#!/usr/bin/env python3
"""
inject_pre_independence.py

Parse dates_avant_independance.md and inject pre-independence events
into data/countries.json.
"""

import json
import re
import unicodedata
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
MD_PATH = ROOT / "dates_avant_independance.md"
JSON_PATH = ROOT / "data" / "countries.json"


# ---------------------------------------------------------------------------
# Text normalisation helpers
# ---------------------------------------------------------------------------

def normalize(text: str) -> str:
    """Lowercase, strip accents, replace hyphens/underscores with space."""
    text = text.lower().strip()
    # Remove accents
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    # Replace hyphens / en-dashes / underscores with space
    text = re.sub(r"[-–_]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------------------------------------------------------------------
# Date parsing helpers
# ---------------------------------------------------------------------------
BC_RE = re.compile(r"[≈~]?\s*(\d+)\s*av\.\s*J\.-C\.", re.IGNORECASE)
APPROX_BC_RE = re.compile(r"[≈~]\s*(\d+)\s*av\.\s*J\.-C\.", re.IGNORECASE)
YEAR_RE = re.compile(r"^[≈~]?\s*(\d{1,4})$")


def parse_year_string(raw: str):
    """
    Returns (date_str, iso_date, year_int) from a raw year string like:
        "814 av. J.-C.", "≈ 900 av. J.-C.", "1516", "642"
    """
    raw = raw.strip()

    # Before-common-era
    m = BC_RE.search(raw)
    if m:
        year_int = -int(m.group(1))
        return raw, None, year_int

    # Plain year (possibly approximate prefix)
    m = YEAR_RE.match(raw)
    if m:
        year_int = int(m.group(1))
        return raw, f"{year_int:04d}-01-01", year_int

    # Fallback: try to extract any 4-digit number
    m = re.search(r"(\d{4})", raw)
    if m:
        year_int = int(m.group(1))
        return raw, f"{year_int}-01-01", year_int

    return raw, None, None


# ---------------------------------------------------------------------------
# Markdown parser
# ---------------------------------------------------------------------------

def parse_markdown(md_text: str) -> dict:
    """
    Returns a dict: { md_country_name: [ {date, isoDate, year, name, ...}, ... ] }

    Special cases handled:
      - "Corée du Nord / Corée du Sud" → both keys
      - "Chypre du Nord (voir Chypre…)" → ignored
    """
    result = {}
    current_countries = []  # can be >1 for dual-country headings
    current_events = []

    for line in md_text.splitlines():
        line = line.rstrip()

        # Country heading: **NomDuPays**
        country_match = re.match(r"^\*\*(.+?)\*\*\s*$", line)
        if country_match:
            # Save previous country
            if current_countries and current_events:
                for c in current_countries:
                    result[c] = list(current_events)
            current_events = []
            heading = country_match.group(1).strip()

            # Ignore Chypre du Nord note
            if re.match(r"\(voir", heading, re.IGNORECASE):
                current_countries = []
                continue

            # Handle "Nord / Sud" dual headings
            if "/" in heading:
                parts = [p.strip() for p in heading.split("/")]
                current_countries = parts
            else:
                current_countries = [heading]
            continue

        # Event line: "- YYYY — Description"  or  "- ≈ YYYY av. J.-C. — Desc"
        event_match = re.match(r"^-\s+(.+?)\s+[—–]\s+(.+)$", line)
        if event_match and current_countries:
            year_raw = event_match.group(1).strip()
            description = event_match.group(2).strip()
            date_str, iso_date, year_int = parse_year_string(year_raw)

            event = {
                "date": date_str,
                "isoDate": iso_date,
                "year": year_int,
                "name": description,
                "context": "",
                "category": "Politique",
                "source": {"type": "pre-independence"},
                "preIndependance": True,
            }
            current_events.append(event)

    # Don't forget last country
    if current_countries and current_events:
        for c in current_countries:
            result[c] = list(current_events)

    return result


# ---------------------------------------------------------------------------
# Country name matching
# ---------------------------------------------------------------------------

# Manual override aliases: md_name_normalized → json_name_normalized fragments
# The lookup below will try to find a JSON country whose normalized name
# contains ALL of the fragments.
ALIASES: dict[str, list[str]] = {
    # Africa
    "congo (brazzaville)": ["congo", "brazzaville"],
    "congo (rdc)": ["congo", "democratique"],
    "republique centrafricaine": ["centrafricaine"],
    # Asia
    "coree du nord": ["coree", "nord"],
    "coree du sud": ["coree", "sud"],
    "emirats arabes unis": ["emirats"],
    "etats-unis": ["etats", "unis"],
    "etats unis": ["etats", "unis"],
    "palestine": ["palestine"],
    "timor oriental": ["timor"],
    "myanmar (birmanie)": ["myanmar"],
    "iles marshall": ["marshall"],
    "micronesie (etats federes de)": ["micronesie"],
    "salomon (iles)": ["salomon"],
    "yemen": ["yemen"],
    "coree du nord / coree du sud": ["coree"],  # fallback, shouldn't be used
}

# Exact name overrides (normalized md name → normalized json name snippet to find)
EXACT_OVERRIDES: dict[str, str] = {}


def find_country(md_name: str, json_countries: list) -> list:
    """
    Returns a list of matching JSON country objects (usually 1, but 2 for
    Corée du Nord / Corée du Sud when processed individually).
    """
    norm_md = normalize(md_name)

    # 1. Check alias table
    if norm_md in ALIASES:
        fragments = ALIASES[norm_md]
        matches = []
        for country in json_countries:
            norm_json = normalize(country["name"])
            if all(f in norm_json for f in fragments):
                matches.append(country)
        if matches:
            return matches

    # 2. Direct normalized name match
    for country in json_countries:
        if normalize(country["name"]) == norm_md:
            return [country]

    # 3. Substring match (md name contained in json name or vice versa)
    for country in json_countries:
        norm_json = normalize(country["name"])
        if norm_md in norm_json or norm_json in norm_md:
            return [country]

    # 4. Word-based partial match (all words of md_name present in json_name)
    md_words = set(norm_md.split())
    # Remove very short / common words
    stop = {"de", "du", "des", "la", "le", "les", "et", "d", "l", "au", "aux"}
    md_words -= stop
    if md_words:
        for country in json_countries:
            norm_json = normalize(country["name"])
            json_words = set(norm_json.split()) - stop
            if md_words.issubset(json_words):
                return [country]

    return []


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    # Load markdown
    md_text = MD_PATH.read_text(encoding="utf-8")

    # Load JSON
    with JSON_PATH.open(encoding="utf-8") as f:
        countries = json.load(f)

    # Parse markdown → dict of events per country name
    md_events = parse_markdown(md_text)
    print(f"Parsed {len(md_events)} country entries from markdown.")

    matched = []
    unmatched = []

    for md_name, events in md_events.items():
        # Skip the dual heading itself if it somehow survived (shouldn't)
        if "/" in md_name:
            continue

        found = find_country(md_name, countries)
        if not found:
            unmatched.append(md_name)
            continue

        for country in found:
            # Prepend new events (pre-independence) before existing events
            country["events"] = events + country["events"]
            matched.append(f"{md_name} → {country['name']}")

    # Save updated JSON
    with JSON_PATH.open("w", encoding="utf-8") as f:
        json.dump(countries, f, ensure_ascii=False, indent=2)

    # Summary
    print(f"\n✅ Matched:   {len(matched)} entries")
    print(f"❌ Unmatched: {len(unmatched)} entries")

    if unmatched:
        print("\nNon-matchés :")
        for name in sorted(unmatched):
            print(f"  - {name}")

    print("\nDone. data/countries.json updated.")


if __name__ == "__main__":
    main()
