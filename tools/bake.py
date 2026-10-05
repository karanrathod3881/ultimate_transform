#!/usr/bin/env python3
"""Pre-fills text, images and meta tags in the HTML pages from resources.js.
The pages then show their content without JavaScript and search engines / link previews can read it.
Run again after you edit resources.js:   python3 tools/bake.py"""
import json, re, html, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
t = open(os.path.join(root, "resources.js"), encoding="utf8").read()
R = json.loads(t[t.index("{"):t.rindex("}") + 1]); S = R["strings"]; I = R["images"]

def set_attr(tag, name, val):
    v = html.escape(val, quote=True)
    if re.search(r'\s%s="[^"]*"' % name, tag):
        return re.sub(r'(\s%s=")[^"]*(")' % name, lambda m: m.group(1) + v + m.group(2), tag, count=1)
    return re.sub(r'\s*/?>$', lambda m: ' %s="%s"%s' % (name, v, m.group(0).strip()), tag)

def fix_tag(m):
    tag = m.group(0)
    for attr, name in (("data-content", "content"), ("data-aria", "aria-label"), ("data-placeholder", "placeholder")):
        mm = re.search(r'\s%s="([^"]+)"' % attr, tag)
        if mm and mm.group(1) in S: tag = set_attr(tag, name, S[mm.group(1)])
    mm = re.search(r'\sdata-image="([^"]+)"', tag)
    if mm and mm.group(1) in I:
        i = I[mm.group(1)]
        for n, v in (("src", i["src"]), ("alt", i["alt"]), ("width", str(i["width"])), ("height", str(i["height"]))): tag = set_attr(tag, n, v)
        if "data-eager" not in tag and "loading=" not in tag: tag = set_attr(tag, "loading", "lazy")
    return tag

def bake(s):
    s = re.sub(r'(<([a-z0-9]+)\b[^<>]*\bdata-text="([^"]+)"[^<>]*>)(.*?)(</\2>)',
               lambda m: m.group(1) + html.escape(S[m.group(3)], quote=False) + m.group(5) if m.group(3) in S else m.group(0), s, flags=re.S)
    return re.sub(r'<[a-z0-9]+\b[^<>]*>', fix_tag, s)

for f in ("index.html", "admin.html", "404.html"):
    p = os.path.join(root, f)
    if os.path.exists(p):
        old = open(p, encoding="utf8").read(); new = bake(old)
        if new != old: open(p, "w", encoding="utf8").write(new)
        print("baked", f)
