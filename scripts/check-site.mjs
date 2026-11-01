import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const failures = [];

function requireText(text, description) {
  if (!html.includes(text)) failures.push(`Missing ${description}`);
}

requireText('<title>Climoz | ESG &amp; climate data systems</title>', 'page title');
requireText('<link rel="canonical" href="https://akshayedzola.github.io/climoz-site/">', 'canonical URL');
requireText('name="WebToLeads4805054000017631043"', 'Zoho Web-to-Lead form');
requireText("fetch('https://crm.zoho.com/crm/WebToLeadForm'", 'Zoho submission endpoint');
requireText('name="LEADCF41" value="Zoho Consulting"', 'temporary CRM category');
requireText("details.value='Climoz enquiry", 'Climoz CRM enquiry prefix');
requireText('name="aG9uZXlwb3Q"', 'form honeypot');
requireText("field.name='Zm9ybWZpbGxpbmd0aW1l'", 'Zoho rotating anti-bot field loader');

if (/href=["']#["']/.test(html)) failures.push('Found a placeholder href="#" link');
if (html.includes('Design preview:')) failures.push('Found design-preview form copy');

const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]));
for (const match of html.matchAll(/href=["']#([^"']+)["']/g)) {
  if (!ids.has(match[1])) failures.push(`Broken internal link: #${match[1]}`);
}

if (failures.length) {
  console.error(failures.map(failure => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Static site checks passed: ${ids.size} IDs and all internal links resolved.`);

