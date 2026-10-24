"""Pull this year's contribution calendar from github.com and save it for the about page."""
import datetime, json, os, re, sys, urllib.request

USER = os.environ.get("GH_USER", "ruth1445")
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "about", "data", "contributions.json")


def fetch(year):
    url = f"https://github.com/users/{USER}/contributions?from={year}-01-01&to={year}-12-31"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (contributions sync)",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "text/html",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8")


def parse(html):
    cells = {}
    for tag in re.findall(r"<td\b[^>]*\bdata-date=[^>]*>", html):
        date = re.search(r'data-date="([\d-]+)"', tag).group(1)
        lvl = int(re.search(r'data-level="(\d)"', tag).group(1))
        cid = re.search(r'\bid="([^"]+)"', tag).group(1)
        cells[cid] = [date, lvl, 0]
    for cid, text in re.findall(r'<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)</tool-tip>', html):
        m = re.match(r"\s*([\d,]+) contribution", text)
        if cid in cells and m:
            cells[cid][2] = int(m.group(1).replace(",", ""))
    return {d: [l, n] for d, l, n in sorted(cells.values())}


def main():
    year = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else datetime.date.today().year
    src = sys.argv[2] if len(sys.argv) > 2 else None
    html = open(src, encoding="utf-8").read() if src else fetch(year)
    days = parse(html)
    if len(days) < 300:
        sys.exit(f"only found {len(days)} days, refusing to overwrite")
    data = {"user": USER, "year": year, "total": sum(n for _, n in days.values()), "days": days}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
        f.write("\n")
    print(f"{len(days)} days, {data['total']} contributions")


if __name__ == "__main__":
    main()
