# InterviewPilot AI - Placement Operating System Architecture

InterviewPilot AI is a unified AI-powered Placement Operating System. Every module must communicate with every other module. There are no isolated experiences.

## Core Philosophy
- **Unified Journey**: Learning -> Coding Practice -> Quiz -> Flashcards -> Revision -> Mock Interview -> Weak Topic Analysis -> Daily Study Plan -> Placement Ready.
- **AI Teacher**: The central intelligence. Every AI response must teach, personalize, explain, encourage practice, and recommend next steps.

## Global AI Memory
- Maintain a global learning profile for every user storing: Learning history, weak/strong concepts, coding/quiz/interview performance, revision history, flashcards, notes, bookmarks, career goal, target companies, and preferred language.

## Knowledge Engine (RAG)
- **Workflow**: User Question -> Conversation Memory -> Knowledge Database Search -> Retrieve Lessons -> Prompt Builder -> LLM -> Rule-Based Validation -> Final Response.
- The Knowledge Database is the primary source; LLM expands and explains curated knowledge.

## AI Teacher Structure
- Strict Teaching Sequence: Definition -> Why it matters -> Real-world analogy -> Step-by-step -> Visualization -> Worked example -> Dry run -> Code -> Time/Space complexity -> Common mistakes -> Interview tips -> Summary -> Practice question -> Recommended next topic.
- **Debugging Assistant**: Explain intention -> Identify bugs -> Explain why -> Progressive hints -> Solution (only if requested).

## Ecosystem Integration
- Every lesson connects to coding problems, quizzes, flashcards, notes, bookmarks, interview questions, and related topics.
- **Personalized Study Planner**: Evolves automatically based on target company, hours, timeline, skill graph, and streak.
- **Skill Graph**: Live tracking for core topics (DSA, DBMS, OS, React, System Design, etc.).
- **Company Mode**: Adjusts difficulty and focus based on target company (Google, Meta, TCS, etc.).

## Flashcards
- Simple spaced repetition: Again (1d), Hard (3d), Good (7d), Easy (14d).

## Quality & Verification
- Modular, Backend-driven, Scalable.
- Run `npm run build` after every implementation.
- Perform API and Browser verification. Fix regressions before continuing.
