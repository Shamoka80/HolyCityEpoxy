# Holy City Epoxy Static Site

Lightweight, static-first marketing site for a Charleston, SC residential epoxy and concrete coatings business.

## Stack
- Plain HTML pages for all public routes
- Shared CSS in `assets/css/styles.css`
- Minimal JavaScript in:
  - `assets/js/main.js` (navigation + gallery filtering)
  - `assets/js/estimate.js` (client-side consultative estimate range logic)
- On-page SEO remains static and framework-free (unique title tags, meta descriptions, canonical URLs, and Open Graph metadata per page)

## Key Pages
- Home (`index.html`)
- About (`about.html`)
- Services (`services.html`)
- Gallery (`gallery.html`)
- Estimate (`estimate.html`)
- Service Area (`service-area.html`)
- Reviews (`reviews.html`)
- Contact (`contact.html`)
- Thank You (`thank-you.html`)

## Structure
- `*.html`: semantic, accessible page templates with shared header/footer patterns.
- `assets/css/styles.css`: global responsive styles, form/layout components, and lightweight utility patterns.
- `assets/js/main.js`: shared mobile navigation, mobile CTA bar, and gallery filtering behavior.
- `assets/js/estimate.js`: client-side estimator range logic and hidden-field sync for Netlify form submissions.
- `scripts/generate-gallery-gifs.php`: local-only generator for before/after gallery GIFs (writes to `assets/images/generated/`).
- `netlify.toml`: publish configuration for static deployment at repository root.

## Gallery GIF Workflow (PR-safe)
- Generated GIF binaries are intentionally **not** committed in this repository workflow.
- Gallery supports generated GIFs when present, with static before/after fallback if GIFs do not exist.
- See `docs/gif-generation-workflow.md` for prerequisites, naming rules, commands, output path, and fallback behavior.

## Netlify Deployment Notes
- Static publish directory is repository root (`.`), configured in `netlify.toml`.
- `contact.html` and `estimate.html` forms are Netlify Forms compatible (`data-netlify="true"`, hidden `form-name`, honeypot field).
- Both forms submit to `/thank-you.html` for a lightweight confirmation flow.
- No build step is required. Deploy directly to Netlify as a static site.

## Form Notifications Operations

Use this runbook when form entries appear in Netlify but email notifications are missing, delayed, or inconsistent.

### Preconditions
- You have Netlify site admin/editor access.
- You can access the recipient mailbox and spam/quarantine dashboards.
- You can submit production form tests from `https://holycityepoxy.com`.

### 1) Confirm both form definitions are registered in Netlify
1. In Netlify, open the production site.
2. Go to **Site → Forms**.
3. Confirm the form names match exactly:
   - `estimate-consultative-request`
   - `contact-homeowner-request`
4. If either name is missing:
   - Trigger a new production deploy.
   - Re-check that the form markup includes `data-netlify="true"` and a matching hidden `form-name` input in source.

### 2) Submit controlled production test entries
Use a unique UTC timestamp in test identity fields so entries are easy to find later.

Recommended timestamp format: `YYYYMMDDTHHMMSSZ` (example: `20260427T034259Z`).

Submit one test for each form:
- `estimate-consultative-request`
- `contact-homeowner-request`

Suggested unique markers:
- Name: `Netlify Test <timestamp>`
- Email: `netlify-test+<timestamp>@example.com`
- Message: `Controlled production test <timestamp>`

### 3) Verify each test appears as a Netlify form submission
1. Return to **Site → Forms**.
2. Open each form and inspect recent entries.
3. Confirm both timestamped submissions exist.
4. Record:
   - Submission ID
   - Received time (UTC)
   - Form name

If submissions are missing:
- Confirm the test was sent to the production domain.
- Confirm the deployed HTML includes the expected form names.
- Re-run test submission after deploy cache propagation.

### 4) If entries exist but emails do not arrive, inspect Netlify notifications
1. Open **Forms → Notifications**.
2. For each form notification rule, verify:
   - Recipient email address(es) are correct.
   - Notification state is enabled.
   - Event trigger is set to new submission.
3. Inspect recent send logs/error metadata for:
   - Delivery failures
   - Bounces
   - Provider rejections
   - Disabled notification hooks

### 5) Validate recipient mailbox filtering
1. Check inbox, spam, quarantine, and any security gateway queues.
2. Search using the unique test timestamp.
3. Allowlist Netlify sender domains/addresses used for form notifications in the mailbox provider/security filter.
4. Re-run one controlled submission after allowlisting and confirm delivery.

### 6) Validate domain authentication posture (when custom email/domain routing is used)
If the mailbox provider enforces strict authentication, verify:
- SPF record validity and include chain correctness.
- DKIM signatures are present and aligned for the sending path.
- DMARC policy/alignment is not quarantining/rejecting expected messages.

If any control is failing, remediate DNS/email authentication and repeat the controlled test loop.

### 7) Incident log template (copy/paste)
```text
Date (UTC):
Operator:
Environment: Production

Forms detected:
- estimate-consultative-request: Yes/No
- contact-homeowner-request: Yes/No

Test submission markers:
- Estimate timestamp:
- Contact timestamp:

Netlify entries observed:
- Estimate entry ID + time:
- Contact entry ID + time:

Notification configuration:
- Recipient(s):
- Enabled state:
- Recent errors/bounces:

Mailbox checks:
- Inbox:
- Spam/quarantine:
- Allowlist updated:

Email auth checks (if applicable):
- SPF:
- DKIM:
- DMARC:

Outcome:
- Delivered / Blocked / Partially Delivered

Next action:
```
