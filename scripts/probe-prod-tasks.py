#!/usr/bin/env python3
"""Probe production bundles for myOpenTasks agent handoff surface."""

from __future__ import annotations

import re
import urllib.request

BASE = "https://getcommons.vercel.app"


def main() -> None:
    html = urllib.request.urlopen(BASE + "/r/checkout-friday", timeout=30).read().decode()
    paths = sorted(
        set(re.findall(r'src="(/_next/static/[^"]+\.js)"', html))
        | set(re.findall(r'href="(/_next/static/[^"]+\.js)"', html))
    )
    print("js_files", len(paths))
    found_task = found_desc = False
    for path in paths:
        js = urllib.request.urlopen(BASE + path, timeout=30).read().decode("utf-8", "ignore")
        if "myOpenTasks" in js:
            print("FOUND myOpenTasks in", path)
            found_task = True
        if "Always check myOpenTasks" in js or "Do myOpenTasks" in js:
            print("FOUND task copy in", path)
            found_desc = True
    print("PROD_HAS_MYOPENTASKS" if found_task else "PROD_MISSING_MYOPENTASKS")
    print("PROD_HAS_TOOL_DESC" if found_desc else "PROD_MISSING_TOOL_DESC")


if __name__ == "__main__":
    main()
