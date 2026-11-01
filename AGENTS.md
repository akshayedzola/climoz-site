# Climoz website

This repository is the source of truth for the public Climoz website. Climoz is a separate brand from EdZola; keep its climate and ESG positioning, visual language and content distinct.

- The site is a dependency-free static page. Run `node scripts/check-site.mjs` before every push.
- Verify layout and interactions in a real browser at desktop and mobile widths after visual changes.
- Use `tools/design-checker/bin/0.1.3/impeccable` from the EdZola playbook workspace as one design review pass when working inside that workspace.
- The enquiry form uses EdZola's public Zoho CRM Web-to-Lead integration. Do not change its field names, public webform identifiers or submission endpoint without testing a mocked payload and a real submission approved by the repository owner.
- Never put secrets, customer data, enquiry details or personal data in source, tests, commits, issues or pull requests.
- Changes to `main` should go through a pull request and human review. Keep GitHub Pages deployment on `main` unless the repository owner changes the release process.

