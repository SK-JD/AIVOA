"""Render prompt `.txt` files with mustache-lite `{{ var }}` placeholders.

Kept out of Python source so prompts can be tuned without code changes. Unknown
placeholders render empty (graceful degradation); files are cached on first read.
"""
import re
from functools import lru_cache
from pathlib import Path

_PROMPTS_DIR = Path(__file__).parent
_PLACEHOLDER = re.compile(r"\{\{\s*(\w+)\s*\}\}")


@lru_cache(maxsize=None)
def _read(name: str) -> str:
    return (_PROMPTS_DIR / f"{name}.txt").read_text(encoding="utf-8")


def load_prompt(name: str, **variables) -> str:
    template = _read(name)
    return _PLACEHOLDER.sub(lambda m: str(variables.get(m.group(1), "")), template)
