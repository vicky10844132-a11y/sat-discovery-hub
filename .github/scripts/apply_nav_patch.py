from pathlib import Path
import re
import sys

if len(sys.argv) != 3:
    raise SystemExit("Usage: apply_nav_patch.py <html-file> <patch-file>")

html_path = Path(sys.argv[1])
patch_path = Path(sys.argv[2])
html = html_path.read_text(encoding="utf-8")
patch = patch_path.read_text(encoding="utf-8").strip()

for start, end in [
    ("NAVIGATION_LAYOUT_V3_START", "NAVIGATION_LAYOUT_V3_END"),
    ("DATA_ACCOUNT_NAV_FIX_START", "DATA_ACCOUNT_NAV_FIX_END"),
    ("FINAL_NAVIGATION_FIX_START", "FINAL_NAVIGATION_FIX_END"),
    ("CLEAN_NAVIGATION_FIX_START", "CLEAN_NAVIGATION_FIX_END"),
]:
    html = re.sub(
        rf"\n?<!-- {start} -->.*?<!-- {end} -->\n?",
        "\n",
        html,
        flags=re.S,
    )

html = html.replace(
    'data-panel="orders" title="Order Center"',
    'data-panel="orders" title="Order"',
)
html = html.replace(
    'data-panel="data" title="Data Center"',
    'data-panel="data" title="Data"',
)
html = html.replace(
    '<span class="tip">Order Center</span>',
    '<span class="tip">Order</span>',
)
html = html.replace(
    '<span class="tip">Data Center</span>',
    '<span class="tip">Data</span>',
)

html_path.write_text(html.rstrip() + "\n" + patch + "\n", encoding="utf-8")
