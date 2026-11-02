# climoz.com

Website for **Climoz, an EdZola company**: ESG and supplier data systems built on Zoho.

A static site with no build step and no dependencies, served by GitHub Pages from `main` on the custom domain <https://climoz.com/> (see `CNAME`).

## Layout

- `index.html`: homepage, including the enquiry form
- `<page>/index.html`: one folder per URL (`/supplier-evidence/`, `/cbam/`, `/insights/…`, `/privacy/` and so on)
- `assets/site.css`: shared styles for every page
- `assets/consent.js`: loads analytics and chat only after the visitor consents. Dormant until the PageSense script URL or SalesIQ widget code is filled in at the top of the file.
- `downloads/`: files linked from guides
- `sitemap.xml`, `robots.txt`, `404.html`

All internal links are root-relative (`/cbam/`). To preview locally, serve the repository root, for example `python3 -m http.server`, and open <http://localhost:8000/>.

## Adding a page

Create `<slug>/index.html` by copying an existing page, so the header, footer and head tags match. Each page needs:

- a unique `<title>` of 50–60 characters, with the search phrase first
- a unique meta description of 140–160 characters
- a self-referencing canonical on `https://climoz.com/…`
- `BreadcrumbList` JSON-LD, plus `Service`, `Article` or `FAQPage` where it fits
- an entry in `sitemap.xml`

`node scripts/check-site.mjs` enforces all of these.

## Enquiry form

The enquiry form submits to EdZola's existing Zoho CRM Web-to-Lead form. Until a dedicated Climoz CRM category is added, enquiries use the existing `Zoho Consulting` category. Country, team, needs, challenge and contact consent are combined into the existing details field, starting with a `Climoz enquiry` prefix. No new posted field names are used.

## Checks and releases

Run `node scripts/check-site.mjs` before pushing. GitHub Actions runs the same dependency-free check on pull requests and `main`. Visual or interaction changes also need a real browser check at desktop and mobile widths.

Changes should go through a pull request with owner review. Do not include secrets, customer data or enquiry details in the repository.

## Domain

`CNAME` is set to `climoz.com`, so GitHub Pages redirects the `github.io` address to the custom domain. In the repository's Pages settings, keep **Enforce HTTPS** on. Point `www.climoz.com` and `climoz.org` at `https://climoz.com/` with 301 redirects.
