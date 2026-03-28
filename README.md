# Portfolio — Maria Lucely Patricio Garcia

Interactive portfolio website showcasing 11+ years of experience across Software Development, Industrial Automation, and Data Analytics.

## Live Demo

[https://luz900218.github.io/LucelyPatricio.github.io/](https://luz900218.github.io/LucelyPatricio.github.io/)

## Features

- **Config-driven architecture** — all content (projects, skills, education, about) is managed through a single `config.json` file. No HTML editing required.
- **Role-based filtering** — projects and skills can be filtered by role (Software Developer, Data Analytics, Ind Automation). Filters sync across both sections.
- **Configurable roles** — role labels, colors, and categories are defined in one place and applied everywhere.
- **Flip cards with lightbox** — project cards with images flip on click to reveal a preview. Double-click opens a full-screen lightbox with multi-image navigation.
- **Responsive design** — adapts to desktop, tablet, and mobile screens.
- **No frameworks** — built with vanilla HTML, CSS, and JavaScript. Zero dependencies in production.

## Project Structure

```
├── index.html            # Page structure (no hardcoded content)
├── styles.css            # All visual styling
├── script.js             # Logic: rendering, filtering, flip cards, lightbox
├── config.json           # All configurable content (edit this file)
├── images/               # Project screenshots
├── server.ps1            # Local development server (PowerShell)
├── package.json          # Testing dependencies
├── jest.config.js        # Unit test configuration
├── cypress.config.js     # E2E test configuration
├── tests/
│   ├── schema.test.js    # JSON structure validation (Ajv)
│   ├── unit.test.js      # Function tests (Jest)
│   └── e2e/
│       └── portfolio.cy.js  # Interface tests (Cypress)
└── TESTING.md            # Testing documentation
```

## How to Run Locally

```bash
# Option 1: PowerShell server
powershell -ExecutionPolicy Bypass -File .\server.ps1
# Open http://localhost:8080

# Option 2: Python
python -m http.server 8080

# Option 3: Node (after npm install)
npm start
```

## How to Edit Content

All content is in `config.json`. No need to touch HTML, CSS, or JS.

**Add a new project:**
```json
{
    "id": "11",
    "title": "Your Project Title",
    "company": "Company Name",
    "role": "dev",
    "description": "What you built and why.",
    "impact": "Measurable result",
    "tech": ["Tool1", "Tool2"],
    "image": ""
}
```

**Add images to a project:**
```json
"image": "images/project-11.png"
"image": ["images/project-11a.png", "images/project-11b.png"]
```

**Add a new role:**
```json
"roles": {
    "dev": { "label": "Software Developer", "color": "#3b82f6" },
    "data": { "label": "Data Analytics", "color": "#7c3aed" },
    "auto": { "label": "Ind Automation", "color": "#059669" },
    "newrole": { "label": "Your New Role", "color": "#e11d48" }
}
```

## Testing

```bash
npm install                  # Install dependencies (first time only)
npm run test:schema          # Validate config.json structure
npm run test:unit            # Run unit tests (Jest)
npm start                    # Start server (in one terminal)
npm run test:e2e             # Run E2E tests (in another terminal)
npm run test:e2e:open        # Run E2E tests visually in browser
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | CSS3 (vanilla, no frameworks) |
| Logic | JavaScript (vanilla ES5) |
| Data | JSON (config-driven) |
| Unit Testing | Jest |
| E2E Testing | Cypress |
| Schema Validation | Ajv |
| CI/CD | GitHub Actions (planned) |
| Hosting | GitHub Pages |

## License

This project is for personal portfolio use.
