import json
import time
import re
import asyncio
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id
from .ai_provider import ai_provider

VISUALIZATION_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "array_insertion": {
        "type": "array_insertion",
        "title": "Array Element Insertion",
        "initial": [10, 20, 40, 50],
        "steps": [
            {"description": "Target: Insert element 30 at index 2. Right-side elements must shift right to make room.", "highlight": [2], "action": "shift", "array": [10, 20, 40, 50, None]},
            {"description": "Step 1: Shift element 50 from index 3 to index 4.", "highlight": [4], "action": "shift", "array": [10, 20, 40, None, 50]},
            {"description": "Step 2: Shift element 40 from index 2 to index 3.", "highlight": [3], "action": "shift", "array": [10, 20, None, 40, 50]},
            {"description": "Step 3: Slot at index 2 is now vacant! Place 30 into index 2.", "highlight": [2], "action": "insert", "array": [10, 20, 30, 40, 50]},
            {"description": "Insertion complete! Array has 5 elements. Time Complexity: O(n) worst-case.", "highlight": [2], "action": "inserted", "array": [10, 20, 30, 40, 50]}
        ]
    },
    "array_deletion": {
        "type": "array_deletion",
        "title": "Array Element Deletion",
        "initial": [10, 20, 99, 30, 40],
        "steps": [
            {"description": "Target: Delete element 99 at index 2.", "highlight": [2], "action": "delete", "array": [10, 20, 99, 30, 40]},
            {"description": "Step 1: Remove value 99 from index 2 leaving an empty slot.", "highlight": [2], "action": "delete", "array": [10, 20, None, 30, 40]},
            {"description": "Step 2: Shift element 30 left from index 3 to index 2.", "highlight": [2], "action": "shift", "array": [10, 20, 30, None, 40]},
            {"description": "Step 3: Shift element 40 left from index 4 to index 3.", "highlight": [3], "action": "shift", "array": [10, 20, 30, 40, None]},
            {"description": "Deletion complete! Logical array size reduced to 4. Time Complexity: O(n).", "highlight": [], "action": "normal", "array": [10, 20, 30, 40]}
        ]
    },
    "array_traversal": {
        "type": "array_traversal",
        "title": "Array Traversal & Memory Layout",
        "initial": [10, 20, 30, 40, 50],
        "steps": [
            {"description": "Access index 0: value 10 in O(1) time via base address offset.", "highlight": [0], "action": "visit", "pointerLabel": "i = 0", "array": [10, 20, 30, 40, 50]},
            {"description": "Advance pointer to index 1: value 20.", "highlight": [1], "action": "visit", "pointerLabel": "i = 1", "array": [10, 20, 30, 40, 50]},
            {"description": "Advance pointer to index 2: value 30.", "highlight": [2], "action": "visit", "pointerLabel": "i = 2", "array": [10, 20, 30, 40, 50]},
            {"description": "Advance pointer to index 3: value 40.", "highlight": [3], "action": "visit", "pointerLabel": "i = 3", "array": [10, 20, 30, 40, 50]},
            {"description": "Advance pointer to index 4: value 50. All elements visited. Total Time: O(n).", "highlight": [4], "action": "visit", "pointerLabel": "i = 4", "array": [10, 20, 30, 40, 50]}
        ]
    },
    "binary_search": {
        "type": "binary_search",
        "title": "Binary Search ($O(\\log n)$)",
        "initial": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
        "target": 23,
        "steps": [
            {"description": "Step 1: Pointers L=0, R=9. Mid = 4 (value: 16). 16 < 23 -> Target is in right half. Eliminate [0..4]!", "left": 0, "right": 9, "mid": 4, "action": "compare"},
            {"description": "Step 2: Set L = Mid + 1 = 5. Search range [5..9]. New Mid = 7 (value: 56). 56 > 23 -> Target is in left half. Eliminate [7..9]!", "left": 5, "right": 9, "mid": 7, "action": "compare"},
            {"description": "Step 3: Set R = Mid - 1 = 6. Search range [5..6]. New Mid = 5 (value: 23). 23 == 23! Target found at index 5 in only 3 steps!", "left": 5, "right": 6, "mid": 5, "action": "found"}
        ]
    },
    "stack": {
        "type": "stack",
        "title": "Stack LIFO Operations",
        "steps": [
            {"description": "Push(10): 10 enters the bottom of the stack. TOP = 10.", "items": [10], "operation": "push", "value": 10},
            {"description": "Push(20): 20 placed above 10. TOP pointer updates to 20.", "items": [10, 20], "operation": "push", "value": 20},
            {"description": "Push(30): 30 placed on top. TOP pointer is at 30.", "items": [10, 20, 30], "operation": "push", "value": 30},
            {"description": "Pop(): Removes 30 from the top. TOP moves back to 20. LIFO Order demonstrated.", "items": [10, 20], "operation": "pop", "value": 30}
        ]
    },
    "queue": {
        "type": "queue",
        "title": "Queue FIFO Operations",
        "steps": [
            {"description": "Enqueue(10): Enters at REAR. FRONT = 10.", "items": [10], "operation": "enqueue", "value": 10},
            {"description": "Enqueue(20): Enters at REAR behind 10.", "items": [10, 20], "operation": "enqueue", "value": 20},
            {"description": "Enqueue(30): Enters at REAR behind 20.", "items": [10, 20, 30], "operation": "enqueue", "value": 30},
            {"description": "Dequeue(): Removes 10 from FRONT. 20 is now at FRONT. FIFO Order demonstrated.", "items": [20, 30], "operation": "dequeue", "value": 10}
        ]
    },
    "linked_list": {
        "type": "linked_list",
        "title": "Singly Linked List Traversal",
        "steps": [
            {"description": "Step 1: Traverse starting from HEAD (value: 10).", "activeNodeId": "n1"},
            {"description": "Step 2: Follow next pointer -> visit node 20.", "activeNodeId": "n2"},
            {"description": "Step 3: Follow next pointer -> visit node 30.", "activeNodeId": "n3"},
            {"description": "Step 4: Reach node 40 pointing to NULL. Traversal complete (O(n)).", "activeNodeId": "n4"}
        ]
    },
    "two_pointers": {
        "type": "two_pointers",
        "title": "Two Pointers Technique",
        "steps": [
            {"description": "Step 1: Pointers at L=0 (1) and R=5 (11). Sum = 1 + 11 = 12 > 10. Move R left.", "left": 0, "right": 5, "statusNote": "Sum: 1 + 11 = 12 (> 10) -> Right--"},
            {"description": "Step 2: Pointers at L=0 (1) and R=4 (8). Sum = 1 + 8 = 9 < 10. Move L right.", "left": 0, "right": 4, "statusNote": "Sum: 1 + 8 = 9 (< 10) -> Left++"},
            {"description": "Step 3: Pointers at L=1 (2) and R=4 (8). Sum = 2 + 8 = 10 == Target! Found pair [2, 8]!", "left": 1, "right": 4, "statusNote": "Sum: 2 + 8 = 10 (Target Found!)"}
        ]
    },
    "sliding_window": {
        "type": "sliding_window",
        "title": "Sliding Window Technique (k=3)",
        "steps": [
            {"description": "Window 1 [indices 0..2]: Elements [2, 1, 5]. Current Sum = 8.", "windowStart": 0, "windowEnd": 2, "statusNote": "Window [0..2] -> Sum: 8"},
            {"description": "Slide Window [indices 1..3]: Subtract 2, Add 1. Current Sum = 7.", "windowStart": 1, "windowEnd": 3, "statusNote": "Window [1..3] -> Sum: 7"},
            {"description": "Slide Window [indices 2..4]: Subtract 1, Add 3. Current Sum = 9 (Max Sum!).", "windowStart": 2, "windowEnd": 4, "statusNote": "Window [2..4] -> Max Sum: 9"},
            {"description": "Slide Window [indices 3..5]: Subtract 5, Add 2. Current Sum = 6. Maximum window sum is 9 in O(n) time!", "windowStart": 3, "windowEnd": 5, "statusNote": "Window [3..5] -> Sum: 6"}
        ]
    },
    "sorting": {
        "type": "sorting",
        "title": "Bubble Sort Walkthrough",
        "steps": [
            {"description": "Compare index 0 (45) and index 1 (12). 45 > 12 -> Swap!", "comparing": [0, 1], "swapped": [0, 1], "array": [12, 45, 85, 32, 89, 39, 69, 22]},
            {"description": "Compare index 2 (85) and index 3 (32). 85 > 32 -> Swap!", "comparing": [2, 3], "swapped": [2, 3], "array": [12, 45, 32, 85, 89, 39, 69, 22]},
            {"description": "Compare index 4 (89) and index 5 (39). 89 > 39 -> Swap!", "comparing": [4, 5], "swapped": [4, 5], "array": [12, 45, 32, 85, 39, 89, 69, 22]},
            {"description": "Largest element 89 bubbles to the end. Mark index 7 as sorted.", "sorted": [7], "array": [12, 45, 32, 85, 39, 69, 22, 89]}
        ]
    },
    "binary_tree": {
        "type": "binary_tree",
        "title": "Binary Tree Inorder Traversal (L, Root, R)",
        "steps": [
            {"description": "Traverse to leftmost leaf node (2).", "activeNode": "left_left", "visited": ["left_left"]},
            {"description": "Visit left child (5). Path: [2, 5].", "activeNode": "left", "visited": ["left_left", "left"]},
            {"description": "Visit right child of left subtree (7). Path: [2, 5, 7].", "activeNode": "left_right", "visited": ["left_left", "left", "left_right"]},
            {"description": "Visit Root node (10). Path: [2, 5, 7, 10].", "activeNode": "root", "visited": ["left_left", "left", "left_right", "root"]},
            {"description": "Traverse right subtree to (15) and (20). Inorder traversal complete!", "activeNode": "right_right", "visited": ["left_left", "left", "left_right", "root", "right", "right_right"]}
        ]
    },
    "hash_map": {
        "type": "hash_map",
        "title": "Hash Map Key-Value Lookup",
        "steps": [
            {"description": "Compute hash('banana') % 5 = 3. Check bucket 3: 'banana' found with value 8!", "activeBucket": 3, "activeKey": "banana", "hashCalc": "hash('banana') % 5 = 3 (O(1) average lookup)"}
        ]
    }
}

class AITeacherService:
    pending_chats: Dict[str, Dict[str, Any]] = {}

    @classmethod
    async def retrieve_knowledge(cls, topic_id: str, mode: str = "teacher") -> str:
        db = get_database()
        try:
            if mode == "coding_coach":
                problem = await db["questions"].find_one({
                    "$or": [
                        {"slug": topic_id},
                        {"title": {"$regex": re.escape(topic_id), "$options": "i"}}
                    ]
                })
                if problem:
                    hints = problem.get("hints", [])
                    constraints = ", ".join(problem.get("constraints", [])) or "Standard"
                    return (
                        f"CODING PROBLEM CONTEXT:\n"
                        f"Title: {problem.get('title')}\n"
                        f"Difficulty: {problem.get('difficulty')}\n"
                        f"Category: {problem.get('category')}\n"
                        f"Description: {problem.get('questionText')}\n"
                        f"Constraints: {constraints}\n"
                        f"Hints: {hints}"
                    )

            # Look up knowledge topic in knowledgetopics
            topic = await db["knowledgetopics"].find_one({
                "$or": [
                    {"topicId": topic_id},
                    {"title": {"$regex": re.escape(topic_id), "$options": "i"}}
                ]
            })
            if topic:
                lesson_id = topic.get("lesson")
                lesson = None
                if lesson_id:
                    lesson = await db["lessons"].find_one({"_id": lesson_id})
                if lesson:
                    return (
                        f"CURATED DATABASE LESSON:\n"
                        f"Title: {topic.get('title')}\n"
                        f"Category: {topic.get('category')}\n"
                        f"Beginner Explanation: {lesson.get('beginnerExplanation', '')}\n"
                        f"Analogy: {lesson.get('realLifeAnalogy', '')}\n"
                        f"Time Complexity: {lesson.get('timeComplexity', '')}\n"
                        f"Space Complexity: {lesson.get('spaceComplexity', '')}"
                    )
        except Exception as e:
            pass

        return f"General Context: Student is inquiring about {topic_id or 'Placement Preparation & Engineering Concepts'}."

    @classmethod
    async def chat(
        cls,
        topic_id: Optional[str],
        history: List[Dict[str, str]] = None,
        current_message: str = "",
        step: str = "general",
        context_meta: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        t0 = time.time()
        history = history or []
        context_meta = context_meta or {}
        user_msg = (current_message or "").strip()
        
        # 1. Instant Greeting & Conversational Check (<10ms, no LLM call)
        clean_msg = re.sub(r"[.,\/#!$%\^&\*;:{}=\-_`~()?]", "", user_msg.lower()).strip()
        greetings = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "howdy", "sup"]
        conversational_checks = ["how are you", "how are you doing", "how r u", "how do you do", "how is it going", "hows it going"]
        
        user_display_name = context_meta.get("userName") or "there"
        if clean_msg in greetings:
            reply = f"Hey {user_display_name}! I'm InterviewPilot AI, your placement mentor. How can I help you today?"
            chat_id = f"greeting_{int(time.time() * 1000)}"
            timing = {
                "dbTimeMs": 0,
                "ragTimeMs": 0,
                "llmTimeMs": 0,
                "totalBackendTimeMs": round((time.time() - t0) * 1000),
                "provider": "cache"
            }
            res = {"chatId": chat_id, "status": "ready", "reply": reply, "timing": timing}
            cls.pending_chats[chat_id] = res
            return res

        if clean_msg in conversational_checks:
            target_role = context_meta.get("targetRole")
            role_hint = f" for {target_role}" if target_role else ""
            reply = f"I'm doing great, thank you for asking! I'm here and ready to help you prepare{role_hint}. We can practice coding, prepare for interviews, analyze your resume, or revise core concepts. What would you like to explore?"
            chat_id = f"status_{int(time.time() * 1000)}"
            timing = {
                "dbTimeMs": 0,
                "ragTimeMs": 0,
                "llmTimeMs": 0,
                "totalBackendTimeMs": round((time.time() - t0) * 1000),
                "provider": "cache"
            }
            res = {"chatId": chat_id, "status": "ready", "reply": reply, "timing": timing}
            cls.pending_chats[chat_id] = res
            return res

        # 2. Context Determination
        mode = context_meta.get("mode") or ("teacher" if topic_id else "placement_advisor")
        active_context = topic_id or context_meta.get("activePage") or "InterviewPilot AI"

        # RAG Knowledge Retrieval
        t_rag_start = time.time()
        db_context = await cls.retrieve_knowledge(topic_id or active_context, mode)
        rag_time_ms = round((time.time() - t_rag_start) * 1000)

        # 3. User Context Gathering (Strictly real data, no invention)
        user_context_snippet = ""
        user_id = context_meta.get("userId")
        if user_id:
            try:
                db = get_database()
                user_oid = to_object_id(user_id)
                if user_oid:
                    user_doc = await db["users"].find_one({"_id": user_oid})
                    unresolved_mistakes = await db["mistakes"].find({"userId": user_id, "resolved": False}).sort("attemptCount", -1).to_list(5)
                    submissions_count = await db["submissions"].count_documents({"userId": user_id, "status": "Accepted"})
                    interviews_count = await db["interviewsessions"].count_documents({"userId": user_id})
                    
                    target_role = user_doc.get("career", {}).get("targetRole") if user_doc else None
                    skills = user_doc.get("career", {}).get("skills", []) if user_doc else []
                    
                    user_context_snippet = (
                        f"\nAUTHENTICATED STUDENT PROFILE (REAL DATA ONLY):\n"
                        f"- Target Role: {target_role or 'Not specified yet'}\n"
                        f"- Solved Coding Problems: {submissions_count}\n"
                        f"- Completed Mock Interviews: {interviews_count}\n"
                        f"- Listed Skills: {', '.join(skills) if skills else 'None added yet'}\n"
                    )
                    
                    if unresolved_mistakes:
                        mistake_lines = [
                            f"  * {m.get('topic', 'Topic')}: {m.get('mistakeType', 'Error')} (Repeated {m.get('attemptCount', 1)} times). Context: {m.get('explanation', '')}"
                            for m in unresolved_mistakes
                        ]
                        user_context_snippet += "- Recorded Mistakes from Student Mistake Book:\n" + "\n".join(mistake_lines) + "\n"
                    else:
                        user_context_snippet += "- Recorded Mistakes: None recorded yet.\n"
            except Exception:
                pass

        # 4. Role Persona Description
        role_description = "You are InterviewPilot AI — an expert mentor and career coach."
        if mode == "teacher":
            role_description = f"You are the InterviewPilot AI Teacher currently teaching the student about: {active_context}."
        elif mode == "coding_coach":
            role_description = f"You are the InterviewPilot AI Coding Coach guiding the student through: {active_context}. Provide progressive hints and complexity tips without immediately giving away the entire solution."
        elif mode == "interview_coach":
            role_description = "You are the InterviewPilot AI Technical & HR Interview Coach. Help the student master frameworks like STAR and technical precision."
        elif mode == "aptitude_coach":
            role_description = "You are the InterviewPilot AI Aptitude Coach explaining quantitative and logical reasoning shortcuts."
        elif mode == "career_advisor":
            role_description = "You are the InterviewPilot AI Career & Resume Advisor guiding on ATS optimization and target company roadmaps."
        elif mode == "placement_advisor":
            role_description = "You are the InterviewPilot AI Placement Advisor analyzing student readiness and recommending actionable next steps."

        system_prompt = f"""{role_description}
Current Context: {active_context} ({mode})
Curated Knowledge Context:
{db_context}
{user_context_snippet}
CRITICAL RULES:
1. Conversational Queries: If the student asks a casual question, greeting, or personal check-in (e.g., 'how are you', 'tell me a joke', 'who are you'), respond warmly, naturally, and concisely as an encouraging AI placement mentor, then offer specific assistance with preparation.
2. Grounding: When answering computer science or DSA topics (e.g. Trees, Graphs, Queues), ALWAYS interpret them as computing/data structures, NEVER physical/botanical entities.
3. Direct & Concise: Always answer the student's exact question first. Keep simple explanations to 2–4 sentences. For code questions, provide clean code + 1-line explanation + Big-O time and space complexity.
4. No Hallucinations: If the user asks about their personal progress/mistakes and no data is listed above, explicitly state that no data is recorded yet. NEVER invent test scores or practice history.
5. No Fluff: Avoid long robotic preamble or boilerplate text.
6. Interactive Visual Learning: When the student asks to learn, explain, or visualize a core data structure, algorithm, or technique (such as Arrays, Array Insertion/Deletion, Binary Search, Linear Search, Stack, Queue, Linked List, Binary Tree, Sorting, Two Pointers, Sliding Window, Hash Map), or asks 'Show me how it works':
   - Provide: Simple Explanation -> Real-World Analogy -> Step-by-Step Breakdown -> Interactive Visual Representation (embedded ```visualization block) -> Worked Example -> Dry Run -> Clean Code -> Time & Space Complexity -> Interview Tips -> Practice Question.
   - For interactive visual representation, embed a ```visualization code block containing valid JSON matching one of the supported types (array_insertion, array_deletion, array_traversal, binary_search, stack, queue, linked_list, two_pointers, sliding_window, sorting, binary_tree, hash_map) with clear step descriptions and highlights.
   - Do NOT include a visualization code block for simple definition queries (e.g. 'What is an array?') or greetings.
   - If the student says 'I don't understand', simplify the explanation and include the visual representation."""

        formatted_history = "\n".join(
            [f"{'Student' if h.get('role') == 'user' else 'Assistant'}: {h.get('content')}" for h in history[-6:]]
        )
        prompt = f"{system_prompt}\n\nChat History:\n{formatted_history}\nStudent: {user_msg}\nAssistant:"

        # 5. Generation with fallback
        t_llm_start = time.time()
        provider_name = "gemini"
        try:
            gen_res = await asyncio.wait_for(ai_provider.generate(prompt), timeout=12.0)
            reply = gen_res.get("text", "")
            provider_name = gen_res.get("provider", "gemini")
        except Exception as e:
            reply = cls.get_fallback_response(user_msg, topic_id, mode, history)
            provider_name = "fallback"

        if not reply or len(reply.strip()) == 0:
            reply = cls.get_fallback_response(user_msg, topic_id, mode, history)
            provider_name = "fallback"

        # 6. Detect and enrich with interactive visualization when useful
        reply, visual_data = cls.detect_and_enrich_visualization(user_msg, reply, topic_id, history)

        llm_time_ms = round((time.time() - t_llm_start) * 1000)
        total_time_ms = round((time.time() - t0) * 1000)

        chat_id = f"{int(time.time() * 1000)}"
        timing = {
            "dbTimeMs": 0,
            "ragTimeMs": rag_time_ms,
            "llmTimeMs": llm_time_ms,
            "totalBackendTimeMs": total_time_ms,
            "provider": provider_name
        }
        res = {
            "chatId": chat_id,
            "status": "ready",
            "reply": reply,
            "timing": timing
        }
        if visual_data:
            res["visualization"] = visual_data

        cls.pending_chats[chat_id] = res
        return res

    @classmethod
    def get_chat_status(cls, chat_id: str) -> Optional[Dict[str, Any]]:
        return cls.pending_chats.get(chat_id)

    @classmethod
    def detect_and_enrich_visualization(
        cls,
        user_msg: str,
        reply: str,
        topic_id: Optional[str],
        history: List[Dict[str, str]] = None
    ) -> tuple[str, Optional[Dict[str, Any]]]:
        history = history or []
        # 1. If reply already contains a visualization block, parse and return it
        vis_match = re.search(r"```visualization\s*([\s\S]*?)\s*```", reply, re.IGNORECASE)
        if vis_match:
            try:
                data = json.loads(vis_match.group(1))
                return reply, data
            except Exception:
                pass

        msg_lower = user_msg.lower().strip()
        # Guard: Simple definitions (e.g. "what is an array?") remain concise without visual blocks
        if re.match(r"^what\s+is\s+(an?\s+)?(array|binary tree|stack|queue|hash map)\??$", msg_lower):
            return reply, None

        chosen_key = None
        if "insertion" in msg_lower or "insert" in msg_lower:
            chosen_key = "array_insertion"
        elif "deletion" in msg_lower or "delete" in msg_lower:
            chosen_key = "array_deletion"
        elif "binary search" in msg_lower:
            chosen_key = "binary_search"
        elif "linear search" in msg_lower:
            chosen_key = "array_traversal"
        elif "two pointer" in msg_lower:
            chosen_key = "two_pointers"
        elif "sliding window" in msg_lower:
            chosen_key = "sliding_window"
        elif "bubble sort" in msg_lower or "sorting" in msg_lower:
            chosen_key = "sorting"
        elif "stack" in msg_lower and "full stack" not in msg_lower:
            chosen_key = "stack"
        elif "queue" in msg_lower:
            chosen_key = "queue"
        elif "linked list" in msg_lower:
            chosen_key = "linked_list"
        elif "binary tree" in msg_lower or ("tree" in msg_lower and "traversal" in msg_lower):
            chosen_key = "binary_tree"
        elif "hash map" in msg_lower or "hash table" in msg_lower:
            chosen_key = "hash_map"
        elif "array" in msg_lower and ("explain" in msg_lower or "learn" in msg_lower or "show" in msg_lower or "visual" in msg_lower):
            chosen_key = "array_traversal"
        elif any(phrase in msg_lower for phrase in ["i don't understand", "dont understand", "can you explain again", "clarify", "confused"]):
            combined_context = (topic_id or "") + " " + " ".join(h.get("content", "") for h in history[-4:])
            combined_lower = combined_context.lower()
            if "binary search" in combined_lower:
                chosen_key = "binary_search"
            elif "insertion" in combined_lower:
                chosen_key = "array_insertion"
            elif "deletion" in combined_lower:
                chosen_key = "array_deletion"
            elif "array" in combined_lower:
                chosen_key = "array_traversal"
            elif "stack" in combined_lower:
                chosen_key = "stack"
            elif "queue" in combined_lower:
                chosen_key = "queue"
            elif "linked list" in combined_lower:
                chosen_key = "linked_list"

        if chosen_key and chosen_key in VISUALIZATION_TEMPLATES:
            vis_data = VISUALIZATION_TEMPLATES[chosen_key]
            vis_block = f"\n\n```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
            if "```" in reply:
                first_code = reply.find("```")
                enriched_reply = reply[:first_code].rstrip() + vis_block + reply[first_code:].lstrip()
            else:
                enriched_reply = reply + vis_block
            return enriched_reply, vis_data

        return reply, None

    @classmethod
    def get_fallback_response(cls, message: str, topic_id: Optional[str], mode: str, history: List[Dict[str, str]] = None) -> str:
        msg = message.lower().strip()
        history = history or []

        if any(w in msg for w in ["how are you", "how r u", "how are you doing", "hows it going", "how is it going"]):
            return "I'm doing great and ready to help you prepare! Would you like to practice coding, review aptitude, or prepare for technical interviews?"
        if any(w in msg for w in ["who are you", "what can you do"]):
            return "I'm InterviewPilot AI, your 24/7 placement mentor. I can help you solve coding problems, prepare for technical & HR interviews, review your resume ATS score, and practice aptitude!"

        # Simple definition query: concise without forced animation
        if re.match(r"^what\s+is\s+(an?\s+)?array\??$", msg):
            return "An **array** is a linear data structure that stores elements of the same data type at contiguous memory locations. It provides $O(1)$ constant-time random access by index and requires $O(n)$ time for middle insertions and deletions due to shifting."

        # Array insertion
        if "insertion" in msg or "insert" in msg:
            vis_data = VISUALIZATION_TEMPLATES["array_insertion"]
            return (
                "### 📚 Array Element Insertion\n\n"
                "To insert an element at index $k$ in an array, elements from index $k$ to $n-1$ must be shifted one position to the right to make room.\n\n"
                f"```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
                "**Dry Run:**\n"
                "- Shift element at index 3 -> index 4\n"
                "- Shift element at index 2 -> index 3\n"
                "- Place new value `30` at now-vacant index 2.\n\n"
                "- **Time Complexity:** $O(n)$ worst-case shifting\n"
                "- **Space Complexity:** $O(1)$ auxiliary memory\n\n"
                "**Interview Tip:** When inserting at the end of a dynamic array, it's $O(1)$ amortized, but in the middle or beginning it's $O(n)$."
            )

        # Array deletion
        if "deletion" in msg or "delete" in msg:
            vis_data = VISUALIZATION_TEMPLATES["array_deletion"]
            return (
                "### 📚 Array Element Deletion\n\n"
                "Deleting an element from an array requires shifting all subsequent elements left to close the gap.\n\n"
                f"```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
                "- **Time Complexity:** $O(n)$ due to leftward shifting\n"
                "- **Space Complexity:** $O(1)$"
            )

        # Explain Arrays (full 10-step pedagogy with visualization)
        if "explain array" in msg or "arrays" in msg or msg == "explain arrays":
            vis_data = VISUALIZATION_TEMPLATES["array_traversal"]
            return (
                "### 📚 1. Simple Explanation\n"
                "An **Array** is a linear collection of elements stored in contiguous memory locations. Each element is accessible in $O(1)$ constant time using its index: $\\text{Address} = \\text{Base} + (\\text{index} \\times \\text{size})$.\n\n"
                "### 💡 2. Real-World Analogy\n"
                "Think of an array like a row of numbered lockers in a school hallway. Knowing the locker number lets you walk straight to it immediately without searching.\n\n"
                "### 🔍 3. Step-by-Step Breakdown\n"
                "1. **Contiguous Allocation:** The OS allocates an unbroken memory segment.\n"
                "2. **Zero-Based Indexing:** The first item is at offset 0.\n"
                "3. **Sequential Traversal:** Visiting elements from index 0 to $n-1$.\n\n"
                f"```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
                "### 💻 4. Code Implementation\n"
                "```python\n# Array access and traversal\nnumbers = [10, 20, 30, 40, 50]\n\n# O(1) direct access\nfirst_element = numbers[0]\n\n# O(n) traversal\nfor i, val in enumerate(numbers):\n    print(f'Index {i}: {val}')\n```\n\n"
                "### 🏃 5. Dry Run\n"
                "For `numbers = [10, 20, 30, 40, 50]`:\n"
                "- `i = 0` -> prints 10\n"
                "- `i = 1` -> prints 20\n"
                "- `i = 2` -> prints 30\n"
                "- `i = 3` -> prints 40\n"
                "- `i = 4` -> prints 50\n\n"
                "### ⏱️ 6. Time & Space Complexity\n"
                "- **Access:** $O(1)$\n"
                "- **Search:** $O(n)$ linear / $O(\\log n)$ if sorted\n"
                "- **Insertion/Deletion:** $O(n)$ in middle, $O(1)$ amortized at end\n"
                "- **Space:** $O(n)$\n\n"
                "### 💡 7. Interview Tips\n"
                "- Beware of off-by-one boundary errors (`arr.length - 1`).\n"
                "- For sorted arrays, always think of **Two Pointers** or **Binary Search** first.\n\n"
                "### 🎯 8. Practice Question\n"
                "Given an array of integers, how would you find the maximum subarray sum in $O(n)$ time using Kadane's Algorithm?"
            )

        # Binary Search / I don't understand binary search
        if "binary search" in msg or ("don't understand" in msg and "binary" in str(history)):
            vis_data = VISUALIZATION_TEMPLATES["binary_search"]
            return (
                "### 📚 Binary Search ($O(\\log n)$)\n\n"
                "Binary search locates a target value in a **sorted array** by repeatedly dividing the search space in half.\n\n"
                "### 💡 Real-World Analogy\n"
                "Like searching for a word in a dictionary: you open the middle. If your word comes later alphabetically, you ignore the entire left half!\n\n"
                f"```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
                "### 💻 Code Implementation\n"
                "```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n```\n\n"
                "- **Time Complexity:** $O(\\log n)$\n"
                "- **Space Complexity:** $O(1)$"
            )

        # "I don't understand" general recovery
        if any(w in msg for w in ["i don't understand", "dont understand", "explain simply", "too complex"]):
            vis_data = VISUALIZATION_TEMPLATES["array_traversal"]
            return (
                "Let's simplify this step-by-step! Here is a visual demonstration to make it intuitive:\n\n"
                f"```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
                "Notice how each step advances the pointer one box at a time. What specific part can I clarify for you?"
            )

        if "two sum" in msg:
            return (
                "Two Sum finds two indices in an array whose values sum to a target. The optimal solution uses a hash map for $O(1)$ complement lookups.\n\n"
                "```python\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n```\n\n"
                "- **Time Complexity:** $O(n)$\n"
                "- **Space Complexity:** $O(n)$"
            )
        if "binary tree" in msg or "tree" in msg:
            vis_data = VISUALIZATION_TEMPLATES["binary_tree"]
            return (
                "A binary tree is a hierarchical data structure in which each node has at most two children (left and right).\n\n"
                f"```visualization\n{json.dumps(vis_data, indent=2)}\n```\n\n"
                "- **Core Types:** Full, Complete, Balanced, and Binary Search Tree (BST).\n"
                "- **BST Search/Insert:** $O(\\log n)$ average, $O(n)$ worst-case.\n"
                "- **Traversals:** Inorder (Left, Root, Right), Preorder, Postorder."
            )
        if "sql join" in msg or "join" in msg:
            return (
                "A SQL JOIN combines rows from two or more tables based on a related column between them.\n\n"
                "- **INNER JOIN:** Returns records with matching values in both tables.\n"
                "- **LEFT JOIN:** Returns all records from the left table and matched records from the right.\n"
                "- **RIGHT JOIN:** Returns all records from the right table and matched records from the left.\n"
                "- **FULL OUTER JOIN:** Returns records when there is a match in either table."
            )
        if "normalization" in msg:
            return (
                "Database normalization organizes tables to reduce data redundancy and improve data integrity.\n\n"
                "- **1NF:** Atomic values, no repeating groups.\n"
                "- **2NF:** In 1NF and no partial dependency.\n"
                "- **3NF:** In 2NF and no transitive dependency.\n"
                "- **BCNF:** Stricter 3NF where every determinant is a candidate key."
            )
        if "mistake" in msg:
            return "You currently have no recorded coding or aptitude mistakes in your Mistake Book. Practice in the Coding Arena to start tracking conceptual errors!"

        # Python for technical interviews
        if "python" in msg:
            return (
                "### 🐍 Python for Technical Interviews\n\n"
                "Python is one of the most popular and efficient languages for placement coding rounds due to its clean syntax and extensive standard library.\n\n"
                "### 🔑 Core Data Structures & Complexities\n"
                "1. **`list` (Dynamic Array):**\n"
                "   - Append / Pop from end: $O(1)$ amortized\n"
                "   - Lookup by index: $O(1)$\n"
                "   - Insert / Delete at arbitrary index: $O(n)$\n\n"
                "2. **`dict` & `set` (Hash Tables):**\n"
                "   - Average lookup, insertion, and deletion: $O(1)$\n"
                "   - Worst-case (hash collision): $O(n)$\n\n"
                "3. **`collections.deque` (Double-Ended Queue):**\n"
                "   - Fast $O(1)$ `appendleft()` and `popleft()`. Essential for BFS graph and tree traversals.\n\n"
                "4. **`heapq` (Binary Min-Heap):**\n"
                "   - Push and Pop: $O(\\log n)$. Crucial for Top-K elements, Median in Stream, and Dijkstra's algorithm.\n\n"
                "### 💻 Essential Python Interview Idioms\n"
                "```python\n"
                "from collections import defaultdict, Counter, deque\n"
                "import heapq\n\n"
                "# 1. Frequency counting\n"
                "freq = Counter([1, 2, 2, 3, 3, 3])  # {3: 3, 2: 2, 1: 1}\n\n"
                "# 2. Default dictionary (graph adjacency list)\n"
                "graph = defaultdict(list)\n"
                "graph['u'].append('v')\n\n"
                "# 3. Min-heap / Priority queue\n"
                "min_heap = []\n"
                "heapq.heappush(min_heap, (priority, item))\n"
                "best = heapq.heappop(min_heap)\n"
                "```\n\n"
                "### 💡 Pro Placement Tips\n"
                "- Use `enumerate()` instead of `range(len(arr))` when you need both index and value.\n"
                "- Use list comprehensions `[x for x in nums if x > 0]` for clean, pythonic filtering.\n"
                "- Python 3 integers have arbitrary precision (no 32-bit integer overflow issues!).\n\n"
                "Would you like to practice a specific Python coding problem, data structure, or algorithmic pattern?"
            )

        # Coding / Coding Arena / DSA
        if any(w in msg for w in ["coding", "code", "coding arena", "problem solving", "dsa", "algorithm"]):
            return (
                "### 💻 Technical Coding & DSA Preparation\n\n"
                "In placement coding rounds (e.g. Amazon, Google, TCS Digital, Infosys SP), questions revolve around recognizing standard algorithmic patterns.\n\n"
                "### 🗺️ Top 6 High-Frequency Interview Patterns\n"
                "1. **Two Pointers:** Opposite ends for sorted arrays (e.g., Two Sum II, Valid Palindrome) — $O(n)$ time, $O(1)$ space.\n"
                "2. **Sliding Window:** Subarray and substring problems with contiguous elements (e.g., Longest Substring Without Repeating Characters) — $O(n)$ time.\n"
                "3. **Fast & Slow Pointers (Floyd's Cycle):** Cycle detection in linked lists and arrays.\n"
                "4. **Binary Search on Answer:** Searching in a monotonic search space (e.g., Koko Eating Bananas, Aggressive Cows) — $O(\\log n)$ time.\n"
                "5. **BFS / DFS:** Level-order traversals (shortest path in unweighted graphs) and exhaustive search on trees/graphs.\n"
                "6. **Dynamic Programming:** Overlapping subproblems and optimal substructure (e.g., 0/1 Knapsack, Coin Change, LCS).\n\n"
                "### 🚀 Ready to Code?\n"
                "Open the **Coding Arena** from the left navigation rail to solve problems live with our multi-language execution engine, or tell me which topic (Arrays, Strings, Trees, DP) you'd like to practice right now!"
            )

        # Aptitude & Reasoning
        if any(w in msg for w in ["aptitude", "quantitative", "reasoning", "quant", "logical reasoning", "verbal"]):
            return (
                "### 🧮 Placement Aptitude & Logical Reasoning\n\n"
                "Aptitude tests are the first elimination round for 80%+ of campus recruitment drives.\n\n"
                "### 📚 Core Sections & Essential Formulas\n"
                "1. **Quantitative Aptitude:**\n"
                "   - **Time & Work:** If A takes $x$ days and B takes $y$ days, together they take $\\frac{xy}{x + y}$ days.\n"
                "   - **Speed, Time & Distance:** Speed = $\\text{Distance}/\\text{Time}$. Convert km/h to m/s: multiply by $\\frac{5}{18}$.\n"
                "   - **Percentages & Profit/Loss:** Gain % = $\\frac{\\text{Gain}}{\\text{Cost Price}} \\times 100$.\n"
                "2. **Logical Reasoning:** Syllogisms, Blood Relations, Direction Sense, Coding-Decoding, Seating Arrangements.\n"
                "3. **Verbal Ability:** Reading Comprehension, Sentence Correction, Error Spotting, Synonyms/Antonyms.\n\n"
                "### 🎯 Recommendation\n"
                "Visit the **Aptitude** module in the sidebar to practice timed question banks, or ask me for shortcuts on any topic (like Speed-Distance or Work problems)!"
            )

        # AI Mock Interview
        if any(w in msg for w in ["ai interview", "mock interview", "interview prep", "interview"]):
            return (
                "### 🎙️ AI Mock Interview Studio\n\n"
                "Acing interviews requires combining solid technical answers with structured communication frameworks.\n\n"
                "### 🏆 The Winning Frameworks\n"
                "1. **Behavioral Questions (The STAR Method):**\n"
                "   - **Situation:** Set the scene and context.\n"
                "   - **Task:** What was your specific responsibility?\n"
                "   - **Action:** Exactly what steps did YOU take (technologies, decisions)?\n"
                "   - **Result:** Quantifiable outcome (e.g., 'reduced latency by 35%').\n\n"
                "2. **Technical Problem Solving in Interviews:**\n"
                "   - Step 1: Clarify constraints (input size, negative numbers, space limits).\n"
                "   - Step 2: Propose the brute force solution and state its complexity.\n"
                "   - Step 3: Optimize using suitable data structures before writing code.\n"
                "   - Step 4: Write clean, modular code with descriptive variable names.\n"
                "   - Step 5: Dry-run with an edge case (empty array, single element).\n\n"
                "### 🚀 Practice Now\n"
                "Head over to **AI Interview** in the sidebar to start a real-time 15, 30, or 45-minute timed interview simulation tailored to your target role!"
            )

        # Resume & ATS
        if any(w in msg for w in ["resume", "ats", "cv"]):
            return (
                "### 📄 ATS Resume Optimization Strategy\n\n"
                "Applicant Tracking Systems (ATS) scan resumes for keyword density, formatting simplicity, and relevant experience before a human recruiter sees them.\n\n"
                "### 🔑 ATS Best Practices\n"
                "1. **Single-Column Layout:** Multi-column tables and complex graphics often fail ATS text parsers.\n"
                "2. **Impact-Driven Bullet Points (XYZ Formula):**\n"
                "   - *Accomplished [X], as measured by [Y], by doing [Z].*\n"
                "   - *Example:* 'Optimized API response time by 40% (from 800ms to 480ms) by implementing Redis caching and indexing MongoDB collections.'\n"
                "3. **Keywords & Skills:** Include explicit skills matching the job description (e.g., Python, FastAPI, Docker, PostgreSQL, React).\n"
                "4. **Standard Section Headers:** Use standard headers: 'Education', 'Technical Skills', 'Experience', 'Projects', 'Certifications'.\n\n"
                "### 🚀 Next Step\n"
                "Upload your resume to our **Resume ATS Analyzer** from the sidebar to get your instant match score and missing keyword analysis!"
            )

        # Study Plan / Placement Strategy
        if any(w in msg for w in ["study plan", "roadmap", "schedule", "how to prepare", "strategy"]):
            return (
                "### 📅 Comprehensive Placement Study Plan\n\n"
                "Here is an optimal structured roadmap to reach placement readiness:\n\n"
                "### ⏱️ Recommended Daily Routine\n"
                "- **60% DSA & Coding Practice:** 2–3 problems daily (1 Easy, 1 Medium, revise past mistakes).\n"
                "- **20% CS Fundamentals:** Alternate daily between DBMS, Operating Systems, Computer Networks, and OOP.\n"
                "- **20% Aptitude & Communication:** 10 quantitative/reasoning questions daily + 1 STAR behavioral story rehearsal.\n\n"
                "### 🗺️ 3-Phase Progression\n"
                "1. **Phase 1 (Foundations):** Arrays, Strings, Hash Maps, Two Pointers, Linked Lists.\n"
                "2. **Phase 2 (Intermediate):** Stacks/Queues, Binary Search, Trees, Heaps, DBMS SQL & Transactions.\n"
                "3. **Phase 3 (Advanced & Mocks):** Graphs, DP, System Design basics, full-length timed mock interviews.\n\n"
                "Tell me your target companies and graduation year, and I can customize this roadmap for your exact timeline!"
            )

        # Java
        if "java" in msg:
            return (
                "### ☕ Java for Placement Coding\n\n"
                "Java is widely tested in service-based and product-based companies (TCS, Infosys, Morgan Stanley, Goldman Sachs).\n\n"
                "- **Collections Framework:** `ArrayList`, `LinkedList`, `HashMap`, `HashSet`, `PriorityQueue` (Min-heap by default).\n"
                "- **String Immutability:** Always use `StringBuilder` for frequent string concatenations inside loops to prevent $O(n^2)$ memory overhead.\n"
                "- **Key Concept:** Know the difference between `Comparable` (natural ordering via `compareTo`) and `Comparator` (custom sorting logic via `compare`)."
            )

        # C++
        if "c++" in msg or "cpp" in msg:
            return (
                "### ⚡ C++ STL for Competitive Programming & Placements\n\n"
                "C++ is prized for its execution speed and rich Standard Template Library (STL).\n\n"
                "- **Vectors:** Dynamic array with $O(1)$ amortized `push_back()`.\n"
                "- **Unordered Map vs Map:** `unordered_map` is hash-table based ($O(1)$ average), while `map` is Red-Black Tree based ($O(\\log n)$ ordered).\n"
                "- **Priority Queue:** `priority_queue<int>` is a max-heap by default. For min-heap, use `priority_queue<int, vector<int>, greater<int>>`.\n"
                "- **Fast I/O:** `ios_base::sync_with_stdio(false); cin.tie(NULL);` prevents TLE in coding tests."
            )

        # Operating Systems / OS
        if "operating system" in msg or msg == "os" or "process" in msg and "thread" in msg:
            return (
                "### 💻 Operating Systems Fundamentals for Placements\n\n"
                "Operating Systems is a core placement interview subject across all tier-1 and tier-2 companies.\n\n"
                "- **Process vs Thread:** A process is an executing program with independent address space; a thread is a lightweight execution unit sharing the process memory.\n"
                "- **Deadlock Conditions (Coffman Conditions):** Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.\n"
                "- **CPU Scheduling:** FCFS, SJF, Round Robin (time quantum), Priority Scheduling.\n"
                "- **Virtual Memory & Paging:** Translates logical addresses to physical addresses using page tables; page replacement algorithms include LRU, FIFO, and Optimal."
            )

        # Dynamic Programming
        if "dynamic programming" in msg or "dp" in msg:
            return (
                "### 🧩 Dynamic Programming (DP) Strategy\n\n"
                "Dynamic programming optimizes recursive solutions by storing intermediate subproblem results.\n\n"
                "### 2 Key Prerequisites:\n"
                "1. **Overlapping Subproblems:** Same subproblems are calculated repeatedly.\n"
                "2. **Optimal Substructure:** Optimal solution can be constructed from optimal subproblem solutions.\n\n"
                "### Approaches:\n"
                "- **Top-Down (Memoization):** Start with recursion and cache results in an array/map.\n"
                "- **Bottom-Up (Tabulation):** Start from base cases and iteratively build up the table (often allows space optimization from $O(n)$ to $O(1)$).\n\n"
                "**Top 5 DP Patterns:** 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), Matrix Chain Multiplication, DP on Trees."
            )

        # General intelligent fallback
        clean_topic = message.strip()
        return (
            f"Regarding **'{clean_topic}'**:\n\n"
            f"I'm here to help you master this for your upcoming placement rounds! We can explore:\n"
            f"- 💡 **Core Theory & Concepts:** Key definitions and mental models.\n"
            f"- 💻 **Coding Practice:** Implementation, edge cases, and time/space complexity.\n"
            f"- 🎙️ **Interview Questions:** High-frequency technical and conceptual questions asked by top tech firms.\n\n"
            f"What specific question or subtopic in **{clean_topic}** would you like to start with?"
        )
