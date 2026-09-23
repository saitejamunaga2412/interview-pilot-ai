import asyncio
import logging
from typing import Callable, Dict, List, Any

logger = logging.getLogger("uvicorn.error")

class EventBus:
    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = {}

    def on(self, event: str, listener: Callable):
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(listener)

    def emit(self, event: str, data: Any = None):
        if event in self._listeners:
            for listener in self._listeners[event]:
                try:
                    if asyncio.iscoroutinefunction(listener):
                        asyncio.create_task(listener(data))
                    else:
                        listener(data)
                except Exception as e:
                    logger.warning(f"[EventBus] Error handling event '{event}': {e}")

event_bus = EventBus()
