import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const ORIGIN = 'https://climoz.com';
const failures = [];
const fail = message => failures.push(message);

// Collect every HTML page in the site.
function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    if (name.startsWith('.') || name === 'node_modules' || name === 'scripts') return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : name.endsWith('.html') ? [full] : [];
  });
}
const files = walk(root);
const urlFor = file => {
  const rel = '/' + relative(root, file).split(sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
};
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const pages = files.map(file => ({ file, url: urlFor(file), html: readFileSync(file, 'utf8') }));
const indexable = pages.filter(p => !/<meta name="robots" content="noindex">/.test(p.html));

// Homepage: enquiry form integration must stay intact (see AGENTS.md).
const home = pages.find(p => p.url === '/');
if (!home) fail('Missing index.html');
else {
  const requireText = (text, description) => { if (!home.html.includes(text)) fail(`Homepage: missing ${description}`); };
  requireText('<title>Climoz | ESG and supplier data systems built on Zoho</title>', 'page title');
  requireText('name="WebToLeads4805054000017631043"', 'Zoho Web-to-Lead form');
  requireText("fetch('https://crm.zoho.com/crm/WebToLeadForm'", 'Zoho submission endpoint');
  requireText('name="LEADCF41" value="Zoho Consulting"', 'temporary CRM category');
  requireText("details.value='Climoz enquiry", 'Climoz CRM enquiry prefix');
  requireText('name="aG9uZXlwb3Q"', 'form honeypot');
  requireText("field.name='Zm9ybWZpbGxpbmd0aW1l'", 'Zoho rotating anti-bot field loader');
  requireText('id="f-consent"', 'contact consent checkbox');
  if (home.html.includes('Design preview:')) fail('Homepage: found design-preview form copy');
}

// Site files.
for (const f of ['favicon.svg', 'CNAME', 'robots.txt', 'sitemap.xml', '404.html', 'assets/site.css', 'assets/consent.js']) {
  if (!existsSync(join(root, f))) fail(`Missing ${f}`);
}
if (existsSync(join(root, 'CNAME')) && readFileSync(join(root, 'CNAME'), 'utf8').trim() !== 'climoz.com') fail('CNAME must be climoz.com');
const robots = existsSync(join(root, 'robots.txt')) ? readFileSync(join(root, 'robots.txt'), 'utf8') : '';
if (!robots.includes(`Sitemap: ${ORIGIN}/sitemap.xml`)) fail('robots.txt must list the sitemap');
if (/^Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt blocks the whole site');
const sitemap = existsSync(join(root, 'sitemap.xml')) ? readFileSync(join(root, 'sitemap.xml'), 'utf8') : '';
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));

// Resolve a root-relative path to a file in the repo.
function resolves(path) {
  const clean = decodeURI(path.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return existsSync(join(root, 'index.html'));
  const target = join(root, clean);
  if (clean.endsWith('/')) return existsSync(join(target, 'index.html'));
  return existsSync(target) && statSync(target).isFile();
}

const seenTitles = new Map();
const seenDescriptions = new Map();
for (const page of pages) {
  const { url, html } = page;
  const where = `${url}:`;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1];
  if (!title) fail(`${where} missing <title>`);
  if (!description) fail(`${where} missing meta description`);
  if (!html.includes('<link rel="icon" href="/favicon.svg" type="image/svg+xml">')) fail(`${where} missing favicon`);
  if (!html.includes('<link rel="stylesheet" href="/assets/site.css">')) fail(`${where} missing shared stylesheet`);
  if (/href=["']#["']/.test(html)) fail(`${where} placeholder href="#" link`);
  if (/github\.io/.test(html)) fail(`${where} references github.io`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(`${where} must have exactly one <h1>`);

  const isIndexable = indexable.includes(page);
  if (isIndexable && title && description) {
    const t = decode(title), d = decode(description);
    if (t.length < 50 || t.length > 60) fail(`${where} title is ${t.length} characters (want 50-60): ${t}`);
    if (d.length < 140 || d.length > 160) fail(`${where} description is ${d.length} characters (want 140-160)`);
    if (seenTitles.has(t)) fail(`${where} duplicate title with ${seenTitles.get(t)}`); else seenTitles.set(t, url);
    if (seenDescriptions.has(d)) fail(`${where} duplicate description with ${seenDescriptions.get(d)}`); else seenDescriptions.set(d, url);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
    if (canonical !== ORIGIN + url) fail(`${where} canonical should be ${ORIGIN + url}, found ${canonical || 'none'}`);
    if (!sitemapUrls.has(ORIGIN + url)) fail(`${where} not listed in sitemap.xml`);
  }

  // Structured data must parse.
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { fail(`${where} invalid JSON-LD (${e.message})`); }
  }
  if (isIndexable && url !== '/' && !html.includes('"BreadcrumbList"')) fail(`${where} missing BreadcrumbList structured data`);

  // Links: in-page anchors and root-relative paths must resolve.
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m => m[1]));
  for (const m of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)) {
    const link = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(link)) continue;
    if (link.startsWith('#')) { if (!ids.has(link.slice(1))) fail(`${where} broken anchor ${link}`); continue; }
    if (!link.startsWith('/')) { fail(`${where} use root-relative links, found ${link}`); continue; }
    if (!resolves(link)) fail(`${where} broken link ${link}`);
    const hash = link.split('#')[1];
    if (hash) {
      const target = pages.find(p => p.url === link.split('#')[0]);
      if (target && !new RegExp(`\\sid=["']${hash}["']`).test(target.html)) fail(`${where} broken anchor ${link}`);
    }
  }
}

// Every sitemap URL must exist.
for (const u of sitemapUrls) {
  if (!u.startsWith(ORIGIN + '/')) fail(`sitemap.xml: URL outside ${ORIGIN}: ${u}`);
  else if (!resolves(u.slice(ORIGIN.length))) fail(`sitemap.xml: no page for ${u}`);
}

if (failures.length) {
  console.error(failures.map(failure => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Static site checks passed: ${pages.length} pages, ${sitemapUrls.size} sitemap URLs, all links resolved.`);
