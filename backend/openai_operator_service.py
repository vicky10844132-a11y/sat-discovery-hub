"""Embedded AI Operator service for GS LinkOps AI.

This service is designed for a single non-technical platform owner. It turns
natural-language instructions into safe platform actions, with confirmation gates
for actions that modify mission, transfer, billing or resource data.

The current scaffold works without calling an external LLM. When OPENAI_API_KEY
is configured, the production implementation can route messages to an LLM and
use ai_tools.py as the approved tool registry.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List

from ai_tools import find_tool, list_tools


@dataclass
class OperatorResponse:
    message: str
    suggested_tool: str | None = None
    requires_confirmation: bool = False
    tool_arguments: Dict[str, Any] | None = None
    next_step: str | None = None


def route_user_message(message: str) -> OperatorResponse:
    """Route a plain-language user message to a platform tool suggestion.

    This deterministic router keeps the platform usable before LLM integration.
    """
    text = message.lower().strip()

    if any(word in text for word in ["缺", "检查", "check", "missing", "ready", "准备"]):
        return response_for_tool("get_platform_brief", "我会先检查平台当前缺什么、哪些任务需要处理。")

    if any(word in text for word in ["轨道", "过境", "pass", "窗口", "calculate"]):
        return response_for_tool("calculate_pass_windows", "我可以计算过境窗口，但这是会更新平台结果的操作，需要你确认。")

    if any(word in text for word in ["推荐", "哪个站", "最适合", "best", "recommend"]):
        return response_for_tool("recommend_best_contact", "我会根据能力矩阵和过境窗口推荐最合适的站点。")

    if any(word in text for word in ["创建任务", "生成任务", "mission", "下行任务"]):
        return response_for_tool("create_downlink_mission", "我可以创建下行任务；正式创建前需要你确认 pass window。")

    if any(word in text for word in ["推进", "下一步", "advance", "状态"]):
        return response_for_tool("advance_mission_status", "我可以推进任务状态；这会修改任务记录，需要你确认。")

    if any(word in text for word in ["传输完成", "交付完成", "complete transfer", "厂家确认"]):
        return response_for_tool("complete_transfer", "我可以将传输标记为完成并触发计费判断，需要你确认。")

    if any(word in text for word in ["报告", "report", "生成给", "厂家看", "客户看"]):
        return response_for_tool("generate_mission_report", "我会生成一份可发给厂家或客户的任务报告。")

    if any(word in text for word in ["计费", "收费", "bill", "billing", "invoice"]):
        return response_for_tool("get_billing_recommendation", "我会判断该任务是否可计费、暂缓、部分计费或不计费。")

    return OperatorResponse(
        message="我可以帮你检查资源、计算过境窗口、推荐地面站、创建任务、推进状态、判断计费、生成报告。你可以直接说：帮我检查今天该处理什么。",
        suggested_tool="get_platform_brief",
        requires_confirmation=False,
        next_step="Open AI Operator and ask a business question in Chinese.",
    )


def response_for_tool(tool_name: str, message: str) -> OperatorResponse:
    tool = find_tool(tool_name)
    if tool is None:
        return OperatorResponse(message="该工具暂未注册。", suggested_tool=None)
    return OperatorResponse(
        message=message,
        suggested_tool=tool.name,
        requires_confirmation=tool.requires_confirmation,
        tool_arguments={},
        next_step="确认后由平台执行该工具。" if tool.requires_confirmation else "平台可以直接读取并返回结果。",
    )


def operator_capabilities() -> Dict[str, Any]:
    return {
        "mode": "single-owner non-technical operation",
        "language": "Chinese-first natural language operation",
        "tools": list_tools(),
        "safety": {
            "confirmation_required_for_write_actions": True,
            "no_hardcoded_resources": True,
            "no_payload_long_term_storage_by_default": True,
            "no_unconfirmed_frequency_tle_price_authorization": True,
        },
    }
