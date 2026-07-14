"""Business rules about the interaction form: what's required, what's missing, and a
compact human-readable snapshot used to make the agent aware of the live form state.

This is what turns the assistant from a text-mapper into something that reasons about
completeness and asks for what's missing.
"""

# Required to log a meaningful interaction → the agent should ask if absent.
REQUIRED_FIELDS = [("hcp_name", "HCP Name"), ("topics", "Topics Discussed")]
# Valuable but not blocking → the agent nudges/offers, doesn't insist.
RECOMMENDED_FIELDS = [("outcomes", "Outcomes"), ("followup_actions", "Follow-up Actions")]


def _empty(value) -> bool:
    return value in ("", None, []) or (isinstance(value, str) and not value.strip())


def missing_required(form: dict) -> list[str]:
    """Labels of required fields that are still empty."""
    return [label for key, label in REQUIRED_FIELDS if _empty(form.get(key))]


def missing_recommended(form: dict) -> list[str]:
    return [label for key, label in RECOMMENDED_FIELDS if _empty(form.get(key))]


def form_summary(form: dict) -> str:
    """One-line-per-field snapshot of the current form for the system prompt."""
    def fmt(v):
        if isinstance(v, list):
            if not v:
                return "—"
            parts = []
            for item in v:
                if isinstance(item, dict):
                    parts.append(item.get("name") or item.get("type") or str(item))
                else:
                    parts.append(str(item))
            return ", ".join(parts)
        return str(v).strip() or "—"

    order = [
        ("hcp_name", "HCP Name"), ("interaction_type", "Interaction Type"),
        ("date", "Date"), ("time", "Time"), ("attendees", "Attendees"),
        ("topics", "Topics Discussed"), ("materials_shared", "Materials Shared"),
        ("samples_distributed", "Samples Distributed"), ("sentiment", "Sentiment"),
        ("outcomes", "Outcomes"), ("followup_actions", "Follow-up Actions"),
    ]
    return "\n".join(f"- {label}: {fmt(form.get(key))}" for key, label in order)
