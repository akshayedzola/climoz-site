# climoz.com

Homepage for **Climoz, an EdZola company** — ESG and climate data systems for Indian exporters, suppliers and listed companies.

Single static page (`index.html`), no build step. Deployed with GitHub Pages from `main` at <https://akshayedzola.github.io/climoz-site/>.

The enquiry form submits to EdZola's existing Zoho CRM Web-to-Lead form. Until a dedicated Climoz CRM category is added, enquiries use the existing `Zoho Consulting` category and include a `Climoz enquiry` prefix in the challenge field.

## Checks and releases

Run `node scripts/check-site.mjs` before pushing. GitHub Actions runs the same dependency-free check on pull requests and `main`. Visual or interaction changes also need a real browser check at desktop and mobile widths.

Changes should go through a pull request with owner review. Do not include secrets, customer data or enquiry details in the repository.

To use the custom domain later: add a `CNAME` file containing `climoz.com`, point the domain's DNS at GitHub Pages, and 301 climoz.org → climoz.com.
