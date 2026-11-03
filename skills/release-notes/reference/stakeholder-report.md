# Stakeholder report format

`report.json` holds the words; `scripts/build-report.mjs` turns it into one HTML page with every screenshot inline. Screenshot paths are relative to `report.json`.

```json
{
  "title": "What's new in Guest Portal",
  "date": "2 November 2026",
  "summary": "Guests can now change their own booking dates, and the confirmation email is clearer.",
  "brand": {
    "name": "Guest Portal",
    "logo": "../../public/logo.svg",
    "colors": { "accent": "#0f766e", "accentDark": "#5eead4" },
    "font": "\"Inter\"",
    "source": "docs/brand-guidelines.md; logo from public/logo.svg"
  },
  "changes": [
    {
      "title": "Guests can change their booking dates",
      "who": "Guests with an upcoming booking; front-desk staff see fewer change requests.",
      "what": "Guests no longer need to call to move a stay. They pick new dates and see the new price before confirming.",
      "steps": [
        {
          "action": "Open My bookings and choose an upcoming stay.",
          "result": "The booking page opens with a new Change dates button.",
          "screenshot": "screenshots/change-dates-1.png",
          "caption": "The Change dates button sits under the stay summary."
        },
        {
          "action": "Click Change dates and pick 12–15 December.",
          "result": "The new total appears before anything is saved.",
          "screenshot": "screenshots/change-dates-2.png",
          "caption": "Old and new price side by side."
        }
      ]
    }
  ],
  "fixed": [
    "Fixed a problem where the confirmation email showed the wrong check-in time."
  ],
  "actionNeeded": "Nothing. Let the front desk know guests can now do this themselves."
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `title`, `summary` | yes | Summary: one or two sentences, the headline of the release. |
| `date` | no | Written out for people ("2 November 2026"). |
| `brand` | no | From the brand guidelines, else the code. Leave out what you couldn't find; the page falls back to a neutral look. |
| `brand.logo` | no | Path relative to `report.json`; SVG or PNG. Embedded in the page. |
| `brand.colors` | no | `accent` (links, step numbers), optional `accentDark` for dark mode, `background` and `text` only if the guidelines set them (this turns dark mode off). |
| `brand.font` | no | CSS font family the product uses. It shows only where the reader has that font installed; system fonts are the fallback. |
| `brand.source` | no | Where you found it, so a human can check. Not shown on the page. |
| `changes[]` | yes | Most important first. One per user-visible change. |
| `changes[].title` | yes | What the user can now do, not what was built. |
| `changes[].who`, `.what` | yes | Who it affects; the benefit in two or three sentences. |
| `changes[].steps[]` | yes | In the order you did them, 3–8 per change. |
| `steps[].action` | yes | What the user does, as an instruction. Bold-worthy names in plain text. |
| `steps[].result` | no | What they see after it. |
| `steps[].screenshot` | yes | Taken right after this action. |
| `steps[].caption` | yes | What to look at in the screenshot. |
| `fixed[]`, `actionNeeded` | no | Short lines. |

## Style

- Write to the reader ("you can now…"). One idea per sentence.
- Each step is one action. If a screenshot needs two sentences to explain, split the step.
- No acronyms unless the reader uses them daily.
