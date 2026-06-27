"""Standalone operator API for GS LinkOps AI.

This lightweight API can be mounted into the main FastAPI app later. It allows a
single non-technical owner to ask business questions in Chinese and receive a
safe platform tool suggestion.
"""

from __future__ import annotations

from typing import Any, Dict

from fastapi import APIRouter
from pydantic import BaseModel

from openai_operator_service import operator_capabilities, route_user_message

router = APIRouter(prefix="/operator", tags=["AI Operator"])


class OperatorMessage(BaseModel):
    message: str


@router.get("/capabilities")
def get_operator_capabilities() -> Dict[str, Any]:
    return operator_capabilities()


@router.post("/ask")
def ask_operator(payload: OperatorMessage) -> Dict[str, Any]:
    response = route_user_message(payload.message)
    return {
        "message": response.message,
        "suggested_tool": response.suggested_tool,
        "requires_confirmation": response.requires_confirmation,
        "tool_arguments": response.tool_arguments or {},
        "next_step": response.next_step,
    }
