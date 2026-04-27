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

## Manual QA: Phone Validation Matrix

Phone input is normalized client-side by removing non-digits before validation/submission. A leading US country code `1` is accepted and normalized away, so submitted values are stored as a 10-digit number.

| Example input | Normalized value | Expected |
| --- | --- | --- |
| `8437903344` | `8437903344` | Accept |
| `(843) 790-3344` | `8437903344` | Accept |
| `843-790-3344` | `8437903344` | Accept |
| `+1 (843) 790-3344` | `8437903344` | Accept |
| `18437903344` | `8437903344` | Accept |
| `790-3344` | `7903344` | Reject (too short) |
| `28437903344` | `28437903344` | Reject (11 digits must start with `1`) |
| `843790334455` | `843790334455` | Reject (too long) |

## Secondary Lead Notification Channel (Netlify Forms + Relay)

Netlify Forms remains the primary intake source of truth. A secondary relay can be configured so each successful form submission also notifies an external destination.

### Supported relay patterns
1. **Option A (no code):** Netlify Forms notification webhook directly to Slack/Discord/email automation.
2. **Option B (implemented here):** Netlify Function `netlify/functions/lead-notify.js` relays form submissions to a transactional provider (SendGrid or Postmark).

### Option B flow
1. Form submission is captured by Netlify Forms.
2. Netlify Forms webhook calls `/.netlify/functions/lead-notify`.
3. Function computes an idempotency key from submission ID + submission timestamp.
4. Function relays the notification to SendGrid/Postmark.
5. Function writes structured JSON logs for each relay attempt.
6. Function triggers an alert webhook if relay failures reach **N** consecutive attempts for a form.

### Required environment variables (Option B)
- `LEAD_NOTIFY_PROVIDER`: `sendgrid` (default) or `postmark`.
- `LEAD_NOTIFY_TO`: recipient email(s). For multiple SendGrid recipients, comma-separate values.
- `LEAD_NOTIFY_FROM`: verified sender email.
- `SENDGRID_API_KEY`: required when provider is SendGrid.
- `POSTMARK_SERVER_TOKEN`: required when provider is Postmark.
- `LEAD_NOTIFY_FAILURE_ALERT_THRESHOLD`: optional, defaults to `3`.
- `LEAD_NOTIFY_ALERT_WEBHOOK_URL`: optional (Slack/Discord/webhook endpoint for failure alerts).

### Netlify setup steps (Option B)
1. Deploy this repository to Netlify.
2. In Netlify UI, set the environment variables above.
3. In **Site → Forms → Notifications**, create an **Outgoing webhook** for each form:
   - `estimate-consultative-request`
   - `contact-homeowner-request`
4. Point webhook URL to:
   - `https://<your-site-domain>/.netlify/functions/lead-notify`

### Idempotency behavior
- The function generates an idempotency key: `netlify:<submission_id>:<submitted_at>`.
- The key is forwarded to the provider as `Idempotency-Key` and added to provider metadata/custom args.
- Duplicate webhook calls with the same key are skipped in-process by the function's TTL cache.

### Structured logging format
Each relay attempt logs JSON with at least:
- `status` (`success` or `failure`)
- `destination`
- `timestamp`
- `formName`
- `submissionId`
- `idempotencyKey`

Example success event:
```json
{
  "event": "lead_notify_relay_attempt",
  "status": "success",
  "destination": "sendgrid:ops@example.com",
  "timestamp": "2026-04-27T10:20:30.000Z",
  "formName": "estimate-consultative-request"
}
```

### Failure visibility
- **Primary:** Netlify Function logs (`Site → Functions → lead-notify`).
- **Secondary:** Netlify Forms submission logs confirm intake succeeded even when relay fails.
- **Alerts:** `LEAD_NOTIFY_ALERT_WEBHOOK_URL` receives a payload after N consecutive failures per form.

### Replay failed notifications
1. Copy the failed submission payload from Netlify Forms/webhook logs.
2. Re-submit it to the function endpoint:
   ```bash
   curl -X POST \
     -H 'Content-Type: application/json' \
     --data @failed-submission.json \
     https://<your-site-domain>/.netlify/functions/lead-notify
   ```
3. Confirm a `200` response and a `status: success` structured log entry.

### On-call ownership
- **Owner:** Website operations owner (default: business owner/operator for Holy City Epoxy).
- **Cadence:** Daily check of Forms + Function logs; immediate follow-up for any alert webhook message.
- **Escalation:** If 3+ consecutive relay failures persist after replay, switch to Option A webhook-only fallback until provider credentials/config are fixed.

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
