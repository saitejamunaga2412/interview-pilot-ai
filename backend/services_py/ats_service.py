import re
import io
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from pypdf import PdfReader
from core.database import get_database, to_object_id, serialize_doc
from core.config import settings
from .ai_provider import ai_provider

# Centralized Scoring Weights (Total = 1.00 / 100%)
ATS_WEIGHTS = {
    "keyword_match": 0.25,
    "skills_alignment": 0.20,
    "experience_relevance": 0.15,
    "projects_relevance": 0.15,
    "content_quality": 0.10,
    "structure": 0.05,
    "formatting": 0.05,
    "education": 0.05,
}

# Role-Aware Categorized Keyword Framework
ROLE_KEYWORD_FRAMEWORK: Dict[str, Dict[str, List[str]]] = {
    "Software Engineer": {
        "Languages": ["Python", "Java", "C++", "C", "JavaScript", "TypeScript", "Go"],
        "Backend / Frameworks": ["REST API", "FastAPI", "Node.js", "Express", "Spring Boot", "Django", "SQL", "MongoDB", "PostgreSQL", "Redis"],
        "Engineering / Tools": ["Git", "Docker", "Testing", "CI/CD", "Data Structures", "Algorithms", "Microservices"]
    },
    "ML Engineer": {
        "Languages": ["Python", "C++", "R", "SQL"],
        "Machine Learning": ["Machine Learning", "Scikit-learn", "TensorFlow", "PyTorch", "Keras"],
        "Libraries": ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Hugging Face"],
        "Engineering / Tools": ["Docker", "MLOps", "Model Evaluation", "Computer Vision", "NLP", "Feature Engineering", "Git"]
    },
    "Data Scientist": {
        "Languages": ["Python", "SQL", "R"],
        "Libraries & Math": ["Pandas", "NumPy", "Scikit-learn", "Statistics", "Machine Learning", "Statsmodels"],
        "Databases": ["PostgreSQL", "BigQuery", "Snowflake", "MongoDB"],
        "Tools & Visualization": ["Data Visualization", "Tableau", "Power BI", "A/B Testing", "Git"]
    },
    "Frontend Developer": {
        "Languages": ["JavaScript", "TypeScript", "HTML5", "CSS3"],
        "Frameworks": ["React", "Vue", "Next.js", "Tailwind CSS", "Redux"],
        "Engineering / Tools": ["REST API", "Responsive Design", "Git", "Webpack", "Vite", "Web Performance", "State Management"]
    },
    "Backend Developer": {
        "Languages": ["Python", "Java", "Go", "Node.js", "TypeScript"],
        "Backend / Frameworks": ["FastAPI", "Express", "Spring Boot", "Django", "REST API", "Microservices"],
        "Databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQL"],
        "Engineering / Tools": ["Docker", "Kubernetes", "Authentication", "JWT", "System Design", "CI/CD", "Git"]
    },
    "Full Stack Developer": {
        "Languages": ["JavaScript", "TypeScript", "Python", "HTML5", "CSS3"],
        "Frameworks": ["React", "Node.js", "Express", "Next.js", "FastAPI", "Tailwind CSS"],
        "Databases": ["MongoDB", "PostgreSQL", "SQL", "Redis"],
        "Engineering / Tools": ["REST API", "Git", "Docker", "Full Stack Architecture", "CI/CD"]
    },
    "Data Analyst": {
        "Languages": ["SQL", "Python", "R"],
        "Libraries": ["Pandas", "NumPy", "Matplotlib", "Seaborn"],
        "Tools & Concepts": ["Tableau", "Power BI", "Excel", "Data Cleaning", "Data Visualization", "Reporting", "Dashboards"]
    },
    "DevOps Engineer": {
        "Languages": ["Python", "Bash", "Go"],
        "Tools & Concepts": ["Docker", "Kubernetes", "CI/CD", "Terraform", "AWS", "Linux", "Git", "Monitoring", "Prometheus", "Grafana"]
    }
}

ACTION_VERBS = {
    "developed", "built", "engineered", "implemented", "designed", "created",
    "optimized", "deployed", "architected", "integrated", "automated", "spearheaded",
    "reduced", "increased", "accelerated", "resolved", "improved", "launched", "formulated",
    "led", "directed", "authored", "orchestrated", "refactored", "analyzed"
}

class AtsService:

    @classmethod
    def extract_text_from_bytes(cls, file_bytes: bytes, filename: str) -> str:
        """Extract readable text from PDF or DOCX binary bytes."""
        text = ""
        filename_lower = filename.lower()

        if filename_lower.endswith(".pdf"):
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e:
                raise ValueError(f"Corrupted or unreadable PDF: {str(e)}")

        elif filename_lower.endswith(".docx"):
            try:
                with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                    xml_content = z.read("word/document.xml")
                    tree = ET.fromstring(xml_content)
                    paragraphs = []
                    for node in tree.iter():
                        if node.tag.endswith("p"):
                            texts = [child.text for child in node.iter() if child.tag.endswith("t") and child.text]
                            if texts:
                                paragraphs.append("".join(texts))
                    text = "\n".join(paragraphs)
            except Exception as e:
                raise ValueError(f"Corrupted or unreadable DOCX: {str(e)}")
        else:
            raise ValueError("Unsupported file format. Please upload a PDF or DOCX file.")

        clean_text = text.strip()
        if len(clean_text) < 40:
            raise ValueError("The uploaded document contains insufficient or unreadable text. Please ensure it is not scanned or empty.")

        return clean_text

    @classmethod
    def resolve_target_role(cls, role_input: Optional[str], user_doc: Optional[Dict[str, Any]]) -> str:
        """Resolve target role from explicit input or candidate user profile."""
        if role_input and role_input.strip():
            return role_input.strip()

        if user_doc:
            career = user_doc.get("career", {})
            if isinstance(career, dict) and career.get("targetRole") and career["targetRole"].strip():
                return career["targetRole"].strip()
            if user_doc.get("targetRole") and user_doc["targetRole"].strip():
                return user_doc["targetRole"].strip()

        raise ValueError("Select a target role to perform a personalized ATS analysis.")

    @classmethod
    def parse_sections_heuristic(cls, text: str) -> Dict[str, Any]:
        """Detect, segment and normalize resume sections into structured representation."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}", text)
        phone_match = re.search(r"\+?\d[\d\s\-\(\)]{8,15}\d", text)
        linkedin_match = re.search(r"https?://(www\.)?linkedin\.com/in/[^\s]+", text, re.IGNORECASE)
        github_match = re.search(r"https?://(www\.)?github\.com/[^\s]+", text, re.IGNORECASE)
        portfolio_match = re.search(r"https?://(www\.)?(?!linkedin|github)[a-zA-Z0-9-]+\.[a-z]{2,}/?[^\s]*", text, re.IGNORECASE)

        name = lines[0] if lines else "Candidate"
        if len(name) > 50 or "@" in name or any(char.isdigit() for char in name[:15]):
            name = "Candidate"

        lower_text = text.lower()
        has_summary = any(h in lower_text for h in ["summary", "objective", "about me", "profile"])
        has_skills = any(h in lower_text for h in ["skills", "technical skills", "technologies", "competencies"])
        has_experience = any(h in lower_text for h in ["experience", "work experience", "employment", "internship", "work history"])
        has_projects = any(h in lower_text for h in ["projects", "personal projects", "academic projects", "key projects"])
        has_education = any(h in lower_text for h in ["education", "academic", "university", "college", "degree", "b.tech", "bachelor", "master"])
        has_certifications = any(h in lower_text for h in ["certifications", "certificates", "licenses"])
        has_achievements = any(h in lower_text for h in ["achievements", "awards", "honors", "accomplishments"])

        # Segment content lines per section
        current_sec = "header"
        section_lines: Dict[str, List[str]] = {
            "summary": [],
            "skills": [],
            "experience": [],
            "projects": [],
            "education": [],
            "certifications": [],
            "achievements": [],
            "other": []
        }

        for line in lines[1:]:
            llower = line.lower().strip()
            if any(h == llower or llower.startswith(h + ":") for h in ["summary", "professional summary", "objective", "profile", "about me"]):
                current_sec = "summary"
                continue
            elif any(h == llower or llower.startswith(h + ":") for h in ["skills", "technical skills", "core competencies", "technologies"]):
                current_sec = "skills"
                continue
            elif any(h == llower or llower.startswith(h + ":") for h in ["experience", "work experience", "employment history", "professional experience", "internships"]):
                current_sec = "experience"
                continue
            elif any(h == llower or llower.startswith(h + ":") for h in ["projects", "personal projects", "key projects", "academic projects"]):
                current_sec = "projects"
                continue
            elif any(h == llower or llower.startswith(h + ":") for h in ["education", "academic background", "academic qualifications"]):
                current_sec = "education"
                continue
            elif any(h == llower or llower.startswith(h + ":") for h in ["certifications", "certificates", "licenses"]):
                current_sec = "certifications"
                continue
            elif any(h == llower or llower.startswith(h + ":") for h in ["achievements", "honors", "awards", "accomplishments"]):
                current_sec = "achievements"
                continue

            if current_sec in section_lines:
                section_lines[current_sec].append(line)
            else:
                section_lines["other"].append(line)

        # Normalized representation
        normalized_resume = {
            "contact": {
                "name": name,
                "email": email_match.group(0) if email_match else None,
                "phone": phone_match.group(0) if phone_match else None,
                "linkedin": linkedin_match.group(0) if linkedin_match else None,
                "github": github_match.group(0) if github_match else None,
                "portfolio": portfolio_match.group(0) if portfolio_match else None
            },
            "summary": " ".join(section_lines["summary"][:5]),
            "skills": section_lines["skills"][:15],
            "experience": section_lines["experience"][:25],
            "projects": section_lines["projects"][:25],
            "education": section_lines["education"][:10],
            "certifications": section_lines["certifications"][:10],
            "achievements": section_lines["achievements"][:10]
        }

        # Extract bullet candidates
        bullets = []
        for line in lines:
            if line.startswith("-") or line.startswith("•") or line.startswith("*") or line.startswith("—"):
                cleaned = line.lstrip("-•*— ").strip()
                if len(cleaned) > 15:
                    bullets.append(cleaned)
            elif len(line) > 35 and any(line.lower().startswith(v) for v in ACTION_VERBS):
                bullets.append(line)

        return {
            "name": name,
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None,
            "linkedin": linkedin_match.group(0) if linkedin_match else None,
            "github": github_match.group(0) if github_match else None,
            "portfolio": portfolio_match.group(0) if portfolio_match else None,
            "sections": {
                "summary": has_summary,
                "skills": has_skills,
                "experience": has_experience,
                "projects": has_projects,
                "education": has_education,
                "certifications": has_certifications,
                "achievements": has_achievements
            },
            "normalized_resume": normalized_resume,
            "bullets": bullets,
            "total_lines": len(lines),
            "word_count": len(text.split())
        }

    @classmethod
    def get_role_keyword_data(cls, target_role: str) -> Tuple[Dict[str, List[str]], List[str]]:
        """Fetch role keyword mapping grouped by category and flat list."""
        normalized_role = target_role.lower()
        for role_key, kw_dict in ROLE_KEYWORD_FRAMEWORK.items():
            if role_key.lower() in normalized_role or normalized_role in role_key.lower():
                all_kws = []
                for sublist in kw_dict.values():
                    all_kws.extend(sublist)
                return kw_dict, list(dict.fromkeys(all_kws))

        # Fallback to Software Engineer
        default_dict = ROLE_KEYWORD_FRAMEWORK["Software Engineer"]
        all_kws = []
        for sublist in default_dict.values():
            all_kws.extend(sublist)
        return default_dict, list(dict.fromkeys(all_kws))

    @classmethod
    def get_role_keywords(cls, target_role: str) -> List[str]:
        """Fetch matching keyword framework based on target role."""
        _, flat_list = cls.get_role_keyword_data(target_role)
        return flat_list

    @classmethod
    def analyze_deterministic(cls, text: str, target_role: str) -> Dict[str, Any]:
        """Run deterministic audit checks on resume structure, contact, and keywords."""
        parsed = cls.parse_sections_heuristic(text)
        sections = parsed["sections"]
        lower_text = text.lower()
        role_kw_dict, role_kws = cls.get_role_keyword_data(target_role)

        detected_kws = []
        missing_kws = []
        keyword_categories: Dict[str, Dict[str, List[str]]] = {}

        for cat_name, kw_list in role_kw_dict.items():
            cat_detected = []
            cat_missing = []
            for kw in kw_list:
                pattern = r"\b" + re.escape(kw.lower()) + r"\b"
                if re.search(pattern, lower_text):
                    cat_detected.append(kw)
                    if kw not in detected_kws:
                        detected_kws.append(kw)
                else:
                    cat_missing.append(kw)
                    if kw not in missing_kws:
                        missing_kws.append(kw)
            keyword_categories[cat_name] = {
                "detected": cat_detected,
                "missing": cat_missing
            }

        # Contact analysis
        missing_contact = []
        deterministic_issues = []

        if not parsed["email"]:
            missing_contact.append("Email address")
            deterministic_issues.append({
                "title": "Missing Contact Information: Email Address",
                "category": "CONTACT",
                "severity": "high",
                "evidence": "No standard email pattern found in contact header",
                "why_it_matters": "Recruiters and automated systems require direct contact information to invite candidates for interviews.",
                "how_to_fix": "Add your professional email address prominently at the top of your resume."
            })
        if not parsed["phone"]:
            missing_contact.append("Phone number")
            deterministic_issues.append({
                "title": "Missing Contact Information: Phone Number",
                "category": "CONTACT",
                "severity": "medium",
                "evidence": "No valid phone number detected",
                "why_it_matters": "Recruiters frequently use phone screening as an initial touchpoint.",
                "how_to_fix": "Add a valid phone number with country/area code."
            })
        if not parsed["linkedin"] and not parsed["github"]:
            missing_contact.append("Online profile (LinkedIn or GitHub)")
            deterministic_issues.append({
                "title": "Missing Professional Profile Links",
                "category": "CONTACT",
                "severity": "medium",
                "evidence": "No LinkedIn or GitHub profile URLs found",
                "why_it_matters": "Technical recruiters verify candidate code repositories and professional references online.",
                "how_to_fix": "Add active links to your LinkedIn profile and GitHub repository."
            })

        # Section analysis
        missing_sections = []
        if not sections["skills"]:
            missing_sections.append("Skills section")
            deterministic_issues.append({
                "title": "Missing Dedicated Skills Section",
                "category": "SECTIONS",
                "severity": "high",
                "evidence": "No dedicated Skills or Technical Skills heading detected",
                "why_it_matters": "Standard ATS parsers index skills specifically from categorized skills sections.",
                "how_to_fix": "Add a clearly labeled 'Technical Skills' section grouping Languages, Frameworks, and Tools."
            })
        if not sections["education"]:
            missing_sections.append("Education section")
            deterministic_issues.append({
                "title": "Missing Education Section",
                "category": "EDUCATION",
                "severity": "high",
                "evidence": "No Education or Academic Background heading detected",
                "why_it_matters": "Degree requirements are standard filtering criteria in corporate ATS systems.",
                "how_to_fix": "Add an 'Education' section detailing your degree, institution, and graduation year."
            })
        if not sections["projects"] and not sections["experience"]:
            missing_sections.append("Projects or Experience section")
            deterministic_issues.append({
                "title": "Missing Experience and Projects Sections",
                "category": "SECTIONS",
                "severity": "high",
                "evidence": "Neither Work Experience nor Projects sections could be identified",
                "why_it_matters": "Demonstrated technical implementation is necessary for engineering hiring evaluations.",
                "how_to_fix": "Include dedicated sections for Professional Experience and Key Technical Projects."
            })

        # Formatting & Structure checks
        formatting_issues = []
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        avg_line_len = sum(len(l) for l in lines) / max(1, len(lines))
        if avg_line_len > 140:
            msg = "Extremely long unbroken text lines detected; may reduce parsing fidelity on standard screeners."
            formatting_issues.append(msg)
            deterministic_issues.append({
                "title": "Excessively Long Text Lines",
                "category": "FORMATTING",
                "severity": "medium",
                "evidence": f"Average line length is {int(avg_line_len)} characters",
                "why_it_matters": "Unbroken dense text reduces readability and can break columnar text extractors.",
                "how_to_fix": "Format content into concise, single-line or two-line bullet points."
            })
        if parsed["word_count"] < 150:
            msg = "Resume word count is under 150 words. Additional detail on projects and technical competencies is recommended."
            formatting_issues.append(msg)
            deterministic_issues.append({
                "title": "Resume Content Too Brief",
                "category": "CONTENT",
                "severity": "high",
                "evidence": f"Total word count is {parsed['word_count']} words",
                "why_it_matters": "Extremely brief resumes fail minimum keyword density thresholds in candidate filtering.",
                "how_to_fix": "Expand project details with technical architecture, problem statement, and outcomes."
            })
        elif parsed["word_count"] > 1400:
            msg = "Resume word count exceeds 1,400 words. Consider condensing to 1-2 pages for stronger readability."
            formatting_issues.append(msg)
            deterministic_issues.append({
                "title": "Resume Exceeds Recommended Length",
                "category": "READABILITY",
                "severity": "medium",
                "evidence": f"Total word count is {parsed['word_count']} words",
                "why_it_matters": "Lengthy resumes dilute focus from key achievements and core technical competencies.",
                "how_to_fix": "Condense older or less relevant details to maintain a crisp 1-2 page document."
            })

        # Check for excessive repeated characters
        if re.search(r"([=\-_*~#])\1{7,}", text):
            deterministic_issues.append({
                "title": "Decorative Formatting Artifacts Detected",
                "category": "FORMATTING",
                "severity": "low",
                "evidence": "Repeated divider characters detected in extracted document stream",
                "why_it_matters": "Decorative character lines can be misinterpreted as garbled text by ATS parsers.",
                "how_to_fix": "Use clean whitespace and standard margins instead of ASCII character dividers."
            })

        # Content quality / bullet checks
        weak_bullets = []
        bullets = parsed["bullets"]
        for b in bullets[:15]:
            has_metric = bool(re.search(r"\b\d+[%kKmMxX]?\b", b))
            starts_with_action = any(b.lower().startswith(v) for v in ACTION_VERBS)
            if not has_metric:
                weak_bullets.append({
                    "bullet": b,
                    "issue": "Lacks measurable impact or verifiable metric",
                    "why_it_matters": "Achievement-oriented bullet points communicate impact and competency more clearly.",
                    "suggested_structure": "Action Verb + Task/Challenge + Technologies Used + Verifiable Outcome/Metric"
                })

        # Deterministic Category Scoring
        kw_ratio = len(detected_kws) / max(1, len(role_kws))
        det_kw_score = min(100, max(30, int(kw_ratio * 120)))

        det_skills_score = 90 if len(detected_kws) >= 6 else (75 if len(detected_kws) >= 3 else 50)
        det_structure_score = 100 - (len(missing_sections) * 20) - (len(missing_contact) * 10)
        det_structure_score = max(40, min(100, det_structure_score))

        det_formatting_score = 92 - (len(formatting_issues) * 12)
        det_formatting_score = max(50, min(95, det_formatting_score))

        det_content_score = 85 - (min(len(weak_bullets), 5) * 5)
        det_content_score = max(45, min(95, det_content_score))

        det_education_score = 92 if sections["education"] else 40
        det_projects_score = 85 if sections["projects"] else (70 if sections["experience"] else 40)
        det_experience_score = 80 if sections["experience"] else "INSUFFICIENT_DATA"

        return {
            "parsed": parsed,
            "detected_keywords": detected_kws,
            "missing_keywords": missing_kws[:8],
            "keyword_categories": keyword_categories,
            "missing_sections": missing_sections,
            "missing_contact": missing_contact,
            "formatting_issues": formatting_issues,
            "deterministic_issues": deterministic_issues,
            "weak_bullets": weak_bullets[:4],
            "deterministic_scores": {
                "keyword_match": det_kw_score,
                "skills_alignment": det_skills_score,
                "structure": det_structure_score,
                "formatting": det_formatting_score,
                "content_quality": det_content_score,
                "education": det_education_score,
                "projects_relevance": det_projects_score,
                "experience_relevance": det_experience_score
            }
        }

    @classmethod
    async def analyze_with_gemini(
        cls,
        resume_text: str,
        target_role: str,
        det_results: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Perform semantic ATS analysis via Gemini using structured JSON output."""
        det_scores = det_results["deterministic_scores"]
        detected_kws = det_results["detected_keywords"]
        missing_kws = det_results["missing_keywords"]
        missing_secs = det_results["missing_sections"]
        normalized_resume = det_results["parsed"].get("normalized_resume", {})

        prompt = f"""You are the InterviewPilot AI ATS Compatibility Analyzer and Executive Technical Recruiter.
Analyze this candidate resume for ATS compatibility and alignment against the target role: "{target_role}".

CRITICAL INSTRUCTIONS & ANTI-HALLUCINATION RULES:
1. Base your evaluation strictly on the candidate's actual resume text and target role.
2. DO NOT hallucinate or invent skills, companies, experiences, metrics, certifications, or achievements.
3. If information or evidence is missing, state clearly that it is missing.
4. "Missing keywords" refers ONLY to relevant industry technologies for "{target_role}" not found in this resume. Never claim a candidate MUST possess them; advise adding them ONLY if truthful.
5. Provide realistic, evidence-backed scores between 0 and 100 for each category.
6. When analyzing bullet points, recommend structural improvements without fabricating false achievements or inventing metrics that do not appear in the text.

Target Role: {target_role}
Deterministic Audit Findings:
- Detected Relevant Keywords: {", ".join(detected_kws[:15]) or "None"}
- Missing Role Keywords: {", ".join(missing_kws[:8]) or "None"}
- Missing Core Sections: {", ".join(missing_secs) or "None"}
- Contact Completeness: {len(det_results['missing_contact'])} items missing ({", ".join(det_results['missing_contact']) or "Complete"})

Resume Structured Representation:
Contact: {normalized_resume.get('contact', {})}
Summary: {normalized_resume.get('summary', '')[:200]}
Skills Detected: {', '.join(normalized_resume.get('skills', [])[:10])}

Resume Text:
\"\"\"
{resume_text[:4000]}
\"\"\"

Output valid JSON matching this schema:
{{
  "role_alignment": {{
    "score": 78,
    "summary": "Concise summary of candidate alignment with {target_role}"
  }},
  "keyword_analysis": {{
    "score": 75,
    "detected": ["Skill1", "Skill2"],
    "missing": ["MissingSkill1", "MissingSkill2"],
    "relevant": ["KeySkill1", "KeySkill2"]
  }},
  "skills_analysis": {{
    "score": 80,
    "matched": ["Skill1", "Skill2"],
    "missing": ["MissingSkill1"],
    "summary": "Summary of technical skills alignment"
  }},
  "experience_analysis": {{
    "score": 75,
    "strengths": ["Real strength from resume"],
    "issues": ["Identified issue"],
    "summary": "Summary of experience relevance"
  }},
  "projects_analysis": {{
    "score": 82,
    "strengths": ["Real project strength"],
    "issues": ["Identified issue"],
    "summary": "Summary of project alignment"
  }},
  "education_analysis": {{
    "score": 90,
    "summary": "Evaluation of educational qualifications"
  }},
  "content_analysis": {{
    "score": 72,
    "issues": ["Identified issue in phrasing or metrics"],
    "strengths": ["Content strength"]
  }},
  "formatting_analysis": {{
    "score": 88,
    "issues": []
  }},
  "category_scores": {{
    "keyword_match": 75,
    "skills_alignment": 80,
    "experience_relevance": 75,
    "projects_relevance": 82,
    "content_quality": 72,
    "structure": 88,
    "formatting": 88,
    "education": 90
  }},
  "strengths": [
    "Evidence-based candidate strength 1",
    "Evidence-based candidate strength 2"
  ],
  "top_issues": [
    {{
      "title": "Clear issue title",
      "category": "PROJECTS",
      "severity": "high",
      "evidence": "Actual sentence or bullet in resume exhibiting this issue",
      "why_it_matters": "Why corporate ATS or recruiter screening evaluates this",
      "how_to_fix": "Concrete guidance for the candidate without fabricating false achievements"
    }}
  ],
  "bullet_improvements": [
    {{
      "current_bullet": "Original text from resume",
      "problem": "Identified weakness (e.g. lacks measurable outcome)",
      "why_it_matters": "Impact is difficult to evaluate without verifiable outcome",
      "suggested_structure": "Action Verb + Task + Tool/Stack + Verifiable Outcome/Scale template"
    }}
  ],
  "recommendations": [
    {{
      "priority": "high",
      "issue": "Primary issue to address",
      "why_it_matters": "Why it impacts ATS scoring",
      "recommendation": "Concrete actionable next step"
    }}
  ]
}}"""

        try:
            res = await ai_provider.generate_json(prompt)
            data = res.get("data")
            if isinstance(data, dict) and ("category_scores" in data or "role_alignment" in data):
                return data
        except Exception:
            pass

        return None

    @classmethod
    def calculate_overall_score(cls, category_scores: Dict[str, Any]) -> Tuple[int, Dict[str, Any]]:
        """Calculate weighted overall compatibility score handling insufficient data dynamically."""
        total_weight = 0.0
        weighted_sum = 0.0
        final_scores: Dict[str, Any] = {}

        for key, weight in ATS_WEIGHTS.items():
            val = category_scores.get(key)
            if val is not None and val != "INSUFFICIENT_DATA" and isinstance(val, (int, float)) and val > 0:
                final_scores[key] = int(round(val))
                weighted_sum += val * weight
                total_weight += weight
            else:
                final_scores[key] = "INSUFFICIENT_DATA"

        if total_weight > 0:
            overall = int(round(weighted_sum / total_weight))
        else:
            overall = 50

        overall = max(0, min(100, overall))
        return overall, final_scores

    @classmethod
    async def analyze_resume(
        cls,
        user_id: str,
        file_bytes: bytes,
        filename: str,
        target_role_input: Optional[str] = None
    ) -> Dict[str, Any]:
        """Complete ATS workflow: text extraction, deterministic audit, Gemini analysis, score calculation, and persistence."""
        db = get_database()
        user_oid = to_object_id(user_id)
        user_doc = await db["users"].find_one({"_id": user_oid}) if user_oid else None

        # 1. Text extraction & validation
        resume_text = cls.extract_text_from_bytes(file_bytes, filename)
        target_role = cls.resolve_target_role(target_role_input, user_doc)

        # 2. Deterministic analysis
        det = cls.analyze_deterministic(resume_text, target_role)

        # 3. Gemini semantic analysis
        gemini_result = await cls.analyze_with_gemini(resume_text, target_role, det)

        # 4. Score merging
        raw_scores = dict(det["deterministic_scores"])
        if gemini_result and "category_scores" in gemini_result:
            for k, v in gemini_result["category_scores"].items():
                if isinstance(v, (int, float)) and 0 <= v <= 100:
                    raw_scores[k] = v

        overall_score, normalized_scores = cls.calculate_overall_score(raw_scores)

        # 5. Build structured Issues list
        issues = []
        if gemini_result and gemini_result.get("top_issues"):
            for issue in gemini_result["top_issues"]:
                if isinstance(issue, dict) and issue.get("title"):
                    issues.append({
                        "title": str(issue.get("title")),
                        "category": str(issue.get("category", "ROLE_ALIGNMENT")).upper(),
                        "severity": str(issue.get("severity", "medium")).lower(),
                        "evidence": str(issue.get("evidence", "")),
                        "why_it_matters": str(issue.get("why_it_matters", "")),
                        "how_to_fix": str(issue.get("how_to_fix", ""))
                    })

        # Merge deterministic issues if not already represented
        for det_issue in det.get("deterministic_issues", []):
            if not any(det_issue["title"].lower() in i["title"].lower() or i["title"].lower() in det_issue["title"].lower() for i in issues):
                issues.append(det_issue)

        # Add deterministic missing keywords issue if not covered
        if det["missing_keywords"] and not any("keyword" in i["title"].lower() for i in issues):
            issues.append({
                "title": f"Target Role Keywords Missing for {target_role}",
                "category": "KEYWORDS",
                "severity": "high",
                "evidence": f"Relevant technologies not detected: {', '.join(det['missing_keywords'][:5])}",
                "why_it_matters": "Applicant tracking systems and recruitment screeners index candidates on core technical stack keywords.",
                "how_to_fix": "Add these skills to your Technical Skills or Projects sections ONLY if you have genuine practical experience with them."
            })

        # Add deterministic weak bullet issue if not covered
        if det["weak_bullets"] and not any("metric" in i["title"].lower() or "impact" in i["title"].lower() or "measurable" in i["title"].lower() for i in issues):
            sample = det["weak_bullets"][0]["bullet"]
            issues.append({
                "title": "Missing Measurable Achievements in Project Descriptions",
                "category": "PROJECTS",
                "severity": "medium",
                "evidence": f"Example: \"{sample[:120]}...\"",
                "why_it_matters": "Achievement-oriented bullet points communicate impact and competency more clearly.",
                "how_to_fix": "Where truthful, add measurable outcomes such as response-time improvement, number of users, accuracy, performance improvement, or other real metrics."
            })

        # 6. Strengths & Recommendations
        strengths = []
        if gemini_result and gemini_result.get("strengths"):
            strengths = [str(s) for s in gemini_result["strengths"] if s]
        if not strengths:
            if len(det["detected_keywords"]) >= 4:
                strengths.append(f"Strong initial alignment on {len(det['detected_keywords'])} core technical keywords.")
            if det["parsed"]["sections"]["education"]:
                strengths.append("Clear educational qualifications and degree details.")
            if det["parsed"]["sections"]["projects"]:
                strengths.append("Dedicated project portfolio demonstrating practical software implementation.")

        recommendations = []
        if gemini_result and gemini_result.get("recommendations"):
            for rec in gemini_result["recommendations"]:
                if isinstance(rec, dict) and rec.get("recommendation"):
                    recommendations.append(str(rec.get("recommendation")))
                elif isinstance(rec, str):
                    recommendations.append(rec)
        if not recommendations:
            recommendations = [
                "Strengthen project impact statements with verifiable metrics where truthful.",
                f"Improve role-specific keyword alignment for {target_role}.",
                "Add missing skills only where truthful and practiced."
            ]

        # 7. Bullet improvements
        bullet_improvements = []
        if gemini_result and gemini_result.get("bullet_improvements"):
            for b in gemini_result["bullet_improvements"]:
                if isinstance(b, dict) and b.get("current_bullet"):
                    bullet_improvements.append({
                        "current_bullet": str(b.get("current_bullet", "")),
                        "problem": str(b.get("problem", b.get("issue", "Could be strengthened"))),
                        "why_it_matters": str(b.get("why_it_matters", "Achievement-oriented bullets convey impact")),
                        "suggested_structure": str(b.get("suggested_structure", "Action Verb + Task + Technologies Used + Verifiable Outcome"))
                    })

        if not bullet_improvements and det["weak_bullets"]:
            for wb in det["weak_bullets"][:3]:
                bullet_improvements.append({
                    "current_bullet": wb["bullet"],
                    "problem": wb["issue"],
                    "why_it_matters": wb.get("why_it_matters", "Clear outcomes communicate practical technical impact."),
                    "suggested_structure": wb["suggested_structure"]
                })

        created_at = datetime.utcnow()
        analysis_payload = {
            "overall_score": overall_score,
            "category_scores": normalized_scores,
            "detected_keywords": det["detected_keywords"],
            "missing_keywords": det["missing_keywords"],
            "keyword_categories": det.get("keyword_categories", {}),
            "missing_sections": det["missing_sections"],
            "formatting_issues": det["formatting_issues"],
            "issues": issues,
            "strengths": strengths,
            "recommendations": recommendations,
            "bullet_improvements": bullet_improvements,
            "normalized_resume": det["parsed"].get("normalized_resume", {}),
            "word_count": det["parsed"]["word_count"]
        }

        # 8. Persist to MongoDB
        record = {
            "userId": user_id,
            "filename": filename,
            "targetRole": target_role,
            "overallScore": overall_score,
            "categoryScores": normalized_scores,
            "analysis": analysis_payload,
            "createdAt": created_at,
            "updatedAt": created_at
        }
        res = await db["resumeanalyses"].insert_one(record)
        record["_id"] = str(res.inserted_id)

        # Link latest ATS analysis to user profile
        if user_oid:
            await db["users"].update_one(
                {"_id": user_oid},
                {
                    "$set": {
                        "resumeData.atsAnalysis": analysis_payload,
                        "resumeData.targetRole": target_role,
                        "resumeData.atsScore": overall_score,
                        "resumeData.atsAnalyzedAt": created_at
                    }
                }
            )

        return serialize_doc(record)

    @classmethod
    async def get_latest_analysis(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve the latest ATS analysis document for the authenticated user."""
        db = get_database()
        doc = await db["resumeanalyses"].find_one(
            {"userId": user_id},
            sort=[("createdAt", -1)]
        )
        return serialize_doc(doc) if doc else None

    @classmethod
    async def get_history(cls, user_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Retrieve historical ATS analysis documents for the authenticated user."""
        db = get_database()
        cursor = db["resumeanalyses"].find({"userId": user_id}).sort("createdAt", -1).limit(limit)
        items = await cursor.to_list(limit)
        return serialize_doc(items)

ats_service = AtsService()
