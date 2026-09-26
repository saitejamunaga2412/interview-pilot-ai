from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from core.database import get_database, to_object_id, serialize_doc
from core.event_bus import event_bus

class LearningService:
    CURRICULUM_TOPICS = [
        {"topicId": "arrays", "title": "Arrays & Memory Contiguity", "category": "DSA Linear", "difficulty": "Easy", "duration": "30 mins", "summary": "Master O(1) index math, sub-arrays, and contiguous memory scanning."},
        {"topicId": "strings", "title": "Strings & Pattern Matching", "category": "DSA Linear", "difficulty": "Easy", "duration": "35 mins", "summary": "Immutability, pattern scans, KMP structures, and palindromes."},
        {"topicId": "linked-lists", "title": "Linked Lists & Pointers", "category": "DSA Linear", "difficulty": "Medium", "duration": "35 mins", "summary": "Non-contiguous nodes, pointer manipulation, and cycle detection."},
        {"topicId": "stack", "title": "Stack (LIFO) & Monotonic Stacks", "category": "DSA Linear", "difficulty": "Medium", "duration": "30 mins", "summary": "LIFO execution, call stacks, and monotonic stack optimizations."},
        {"topicId": "queue", "title": "Queue (FIFO) & Deque", "category": "DSA Linear", "difficulty": "Medium", "duration": "30 mins", "summary": "FIFO scheduling, circular buffers, and sliding window maximums."},
        {"topicId": "hashing", "title": "Hashing & Hash Tables", "category": "DSA Linear", "difficulty": "Easy", "duration": "35 mins", "summary": "Collision resolution, O(1) lookup strategies, and frequency tables."},
        {"topicId": "recursion", "title": "Recursion & Call Stack", "category": "Non-Linear", "difficulty": "Medium", "duration": "35 mins", "summary": "Base cases, recursive subproblem frames, and call stacks."},
        {"topicId": "trees", "title": "Binary Trees & Traversals", "category": "Non-Linear", "difficulty": "Medium", "duration": "45 mins", "summary": "DFS/BFS tree traversals and hierarchical sub-tree divisions."},
        {"topicId": "bst", "title": "Binary Search Trees (BST)", "category": "Non-Linear", "difficulty": "Medium", "duration": "45 mins", "summary": "Sorted property validation, tree insertions, and self-balancing."},
        {"topicId": "heaps", "title": "Heaps & Priority Queues", "category": "Non-Linear", "difficulty": "Medium", "duration": "40 mins", "summary": "Min/Max complete trees, scheduling, and Top-K algorithms."},
        {"topicId": "graphs", "title": "Graphs (BFS, DFS & Route Find)", "category": "Non-Linear", "difficulty": "Hard", "duration": "55 mins", "summary": "Adjacency structures, path explorations, and Dijkstra rules."},
        {"topicId": "sorting", "title": "Sorting Algorithms", "category": "Algorithms", "difficulty": "Medium", "duration": "45 mins", "summary": "MergeSort, QuickSort partition schemes, and stability."},
        {"topicId": "binary-search", "title": "Binary Search Space", "category": "Algorithms", "difficulty": "Easy", "duration": "30 mins", "summary": "Halving search spaces and monotonic range reductions."},
        {"topicId": "greedy", "title": "Greedy Algorithms", "category": "Algorithms", "difficulty": "Medium", "duration": "40 mins", "summary": "Local optimizations, scheduling, and interval fits."},
        {"topicId": "backtracking", "title": "Backtracking Patterns", "category": "Algorithms", "difficulty": "Hard", "duration": "50 mins", "summary": "State space trees, recursive undo paths, and pruning."},
        {"topicId": "dynamic-programming", "title": "Dynamic Programming (DP)", "category": "Algorithms", "difficulty": "Hard", "duration": "60 mins", "summary": "Memoization caches, tabulation matrices, and state updates."},
        {"topicId": "python-programming", "title": "Python Core & Generators", "category": "Language Runtimes", "difficulty": "Easy", "duration": "40 mins", "summary": "GIL mechanics, dynamic typing, and advanced generators."},
        {"topicId": "java-programming", "title": "Java JVM Architecture", "category": "Language Runtimes", "difficulty": "Medium", "duration": "45 mins", "summary": "JVM bytecode, Stack/Heap memory, and multi-threading."},
        {"topicId": "javascript-core", "title": "JavaScript Core & Event Loop", "category": "Language Runtimes", "difficulty": "Medium", "duration": "45 mins", "summary": "V8 engine, microtasks, event loop, and asynchronous primitives."},
        {"topicId": "sql-relations", "title": "SQL Relational Constraints", "category": "CS Core & Architecture", "difficulty": "Easy", "duration": "35 mins", "summary": "ACID properties, join mechanics, schema design, and normal forms."},
        {"topicId": "db-indexing", "title": "Database Indexing Structures", "category": "CS Core & Architecture", "difficulty": "Medium", "duration": "40 mins", "summary": "B-Trees, LSM trees, composite indexes, and query planner optimization."},
        {"topicId": "system-design-intro", "title": "System Design Fundamentals", "category": "CS Core & Architecture", "difficulty": "Medium", "duration": "50 mins", "summary": "Load balancing, horizontal scaling, caching strategies, and CAP theorem."}
    ]

    @classmethod
    async def get_all_topics(cls, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        db = get_database()
        db_topics = await db["knowledgetopics"].find({}).to_list(100)
        if not db_topics:
            db_topics = await db["learningtopics"].find({}).to_list(100)
        return serialize_doc(db_topics) if db_topics else cls.CURRICULUM_TOPICS

    @classmethod
    async def get_dashboard_data(cls, user_id: str, query: Dict[str, Any] = None) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)

        progresses = await db["learningprogresses"].find({"user": user_oid}).to_list(100) if user_oid else []
        flashcards = await db["revisionitems"].find({"userId": user_id}).to_list(20) if user_id else []

        completed_count = sum(1 for p in progresses if p.get("status") == "completed")
        topics = await cls.get_all_topics(user_id)
        total_topics = max(1, len(topics))

        return {
            "progress": {
                "completed": completed_count,
                "total": total_topics,
                "percentage": round((completed_count / total_topics) * 100)
            },
            "topics": topics,
            "revisionQueue": serialize_doc(flashcards),
            "recentTopics": serialize_doc(progresses[:5])
        }

    @classmethod
    async def get_topic_details(cls, user_id: Optional[str], topic_id: str, force_regenerate: bool = False) -> Dict[str, Any]:
        db = get_database()
        topic = await db["knowledgetopics"].find_one({
            "$or": [{"topicId": topic_id}, {"_id": to_object_id(topic_id)}]
        })
        lesson = None
        if topic and topic.get("lesson"):
            lesson = await db["lessons"].find_one({"_id": topic["lesson"]})

        if not topic:
            # Clean fallback curriculum topic
            clean_title = topic_id.replace("-", " ").title()
            topic = {
                "topicId": topic_id,
                "title": clean_title,
                "category": "DSA",
                "difficulty": "Medium",
                "summary": f"Comprehensive guide to mastering {clean_title}."
            }
            lesson = {
                "beginnerExplanation": f"{clean_title} is a core computer science concept frequently tested in technical placement rounds.",
                "realLifeAnalogy": "Think of it like an organized library catalogue where items can be looked up predictably.",
                "timeComplexity": "O(log n) to O(n) depending on operation",
                "spaceComplexity": "O(1) auxiliary",
                "codeSnippet": f"// Optimized implementation of {clean_title}\nfunction solve() {{\n  return true;\n}}",
                "interviewTips": ["Check boundary conditions and empty inputs.", "State time and space complexity upfront."]
            }

        return {
            "topic": serialize_doc(topic),
            "lesson": serialize_doc(lesson)
        }

    @classmethod
    async def evaluate_quiz(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        answers = payload.get("answers", [])
        total = max(1, len(answers))
        correct = sum(1 for a in answers if a.get("isCorrect") or a.get("selected") == a.get("correct"))
        score = round((correct / total) * 100)

        db = get_database()
        user_oid = to_object_id(user_id)
        topic_id = payload.get("topicId", "DSA")

        # Update progress
        await db["learningprogresses"].update_one(
            {"user": user_oid, "topicId": topic_id},
            {"$set": {"score": score, "status": "completed", "updatedAt": datetime.utcnow()}},
            upsert=True
        )

        event_bus.emit("learning.completed", {"userId": user_id, "score": score, "topicCategory": "DSA"})

        return {
            "score": score,
            "passed": score >= 60,
            "correctCount": correct,
            "totalQuestions": total
        }

    @classmethod
    async def update_section_progress(cls, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        db = get_database()
        user_oid = to_object_id(user_id)
        topic_id = payload.get("topicId", "DSA")

        await db["learningprogresses"].update_one(
            {"user": user_oid, "topicId": topic_id},
            {"$set": {"status": "completed", "updatedAt": datetime.utcnow()}},
            upsert=True
        )

        event_bus.emit("learning.completed", {"userId": user_id, "score": 1, "topicCategory": payload.get("category", "DSA")})
        return {"topicId": topic_id, "status": "completed"}

    @classmethod
    async def review_flashcard(cls, user_id: str, flashcard_id: str, quality: str) -> Dict[str, Any]:
        # Spaced repetition intervals: again (1d), hard (3d), good (7d), easy (14d)
        interval_days = 1
        if quality == "hard": interval_days = 3
        elif quality == "good": interval_days = 7
        elif quality == "easy": interval_days = 14

        next_date = datetime.utcnow() + timedelta(days=interval_days)

        db = get_database()
        f_oid = to_object_id(flashcard_id)
        if f_oid:
            await db["revisionitems"].update_one(
                {"_id": f_oid, "userId": user_id},
                {
                    "$set": {"interval": interval_days, "nextReviewDate": next_date},
                    "$push": {"history": {"date": datetime.utcnow(), "quality": quality}}
                }
            )

        return {"flashcardId": flashcard_id, "interval": interval_days, "nextReviewDate": next_date.isoformat()}

learning_service = LearningService()
