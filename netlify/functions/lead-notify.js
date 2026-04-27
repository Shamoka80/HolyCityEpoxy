const inMemoryIdempotencyCache = new Map();
const consecutiveFailureByForm = new Map();

const DEFAULT_ALERT_THRESHOLD = 3;
const IDEMPOTENCY_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function logStructured(event, details) {
  console.log(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      ...details,
    }),
  );
}

function cleanupIdempotencyCache(now = Date.now()) {
  for (const [key, expiresAt] of inMemoryIdempotencyCache.entries()) {
    if (expiresAt <= now) {
      inMemoryIdempotencyCache.delete(key);
    }
  }
}

function computeIdempotencyKey(payload = {}) {
  const submissionId = payload.id || payload.submission_id || payload.number || "unknown-submission";
  const submittedAt = payload.created_at || payload.submitted_at || payload.timestamp || new Date().toISOString();
  return `netlify:${submissionId}:${submittedAt}`;
}

function normalizeFields(payload = {}) {
  if (payload.data && typeof payload.data === "object") {
    return payload.data;
  }

  if (payload.payload && typeof payload.payload === "object") {
    return payload.payload;
  }

  if (payload.fields && typeof payload.fields === "object") {
    return payload.fields;
  }

  return payload;
}

function toList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function escapeHtml(unsafe = "") {
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildMessage(payload, fields) {
  const formName = payload.form_name || payload.form || fields["form-name"] || "unknown-form";
  const lines = [
    `New lead submission from ${formName}`,
    "",
    `Submission ID: ${payload.id || payload.submission_id || "N/A"}`,
    `Submitted At: ${payload.created_at || payload.submitted_at || new Date().toISOString()}`,
    "",
    "Lead fields:",
  ];

  Object.entries(fields).forEach(([key, value]) => {
    lines.push(`- ${key}: ${Array.isArray(value) ? value.join(", ") : value}`);
  });

  return {
    text: lines.join("\n"),
    html: `<h2>New lead submission from ${escapeHtml(formName)}</h2><ul>${Object.entries(fields)
      .map(([key, value]) => `<li><strong>${escapeHtml(key)}</strong>: ${escapeHtml(Array.isArray(value) ? value.join(", ") : value)}</li>`)
      .join("")}</ul>`,
    subject: `New lead: ${formName}`,
    formName,
  };
}

async function relayViaSendGrid(message, idempotencyKey) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = toList(process.env.LEAD_NOTIFY_TO);
  const from = process.env.LEAD_NOTIFY_FROM;

  if (!apiKey || !to.length || !from) {
    throw new Error("Missing SendGrid configuration (SENDGRID_API_KEY, LEAD_NOTIFY_TO, LEAD_NOTIFY_FROM)");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      personalizations: [{ to: to.map((email) => ({ email: email.trim() })) }],
      from: { email: from },
      subject: message.subject,
      content: [
        { type: "text/plain", value: message.text },
        { type: "text/html", value: message.html },
      ],
      custom_args: {
        idempotency_key: idempotencyKey,
        form_name: message.formName,
      },
    }),
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
    destination: `sendgrid:${to.join(",")}`,
  };
}

async function relayViaPostmark(message, idempotencyKey) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  const to = process.env.LEAD_NOTIFY_TO;
  const from = process.env.LEAD_NOTIFY_FROM;

  if (!token || !to || !from) {
    throw new Error("Missing Postmark configuration (POSTMARK_SERVER_TOKEN, LEAD_NOTIFY_TO, LEAD_NOTIFY_FROM)");
  }

  const response = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "X-Postmark-Server-Token": token,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      From: from,
      To: to,
      Subject: message.subject,
      TextBody: message.text,
      HtmlBody: message.html,
      Metadata: {
        idempotency_key: idempotencyKey,
        form_name: message.formName,
      },
    }),
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
    destination: `postmark:${to}`,
  };
}

async function sendFailureAlert(payload) {
  const alertWebhook = process.env.LEAD_NOTIFY_ALERT_WEBHOOK_URL;
  if (!alertWebhook) {
    return;
  }

  await fetch(alertWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  cleanupIdempotencyCache();

  const fields = normalizeFields(payload);
  const message = buildMessage(payload, fields);
  const formName = message.formName;
  const idempotencyKey = computeIdempotencyKey(payload);

  const now = Date.now();
  if (inMemoryIdempotencyCache.has(idempotencyKey)) {
    logStructured("lead_notify_duplicate_skipped", {
      idempotencyKey,
      formName,
      status: "skipped",
      destination: process.env.LEAD_NOTIFY_PROVIDER || "sendgrid",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, duplicate: true, idempotencyKey }),
    };
  }

  inMemoryIdempotencyCache.set(idempotencyKey, now + IDEMPOTENCY_TTL_MS);

  const provider = (process.env.LEAD_NOTIFY_PROVIDER || "sendgrid").toLowerCase();
  const alertThreshold = Number(process.env.LEAD_NOTIFY_FAILURE_ALERT_THRESHOLD || DEFAULT_ALERT_THRESHOLD);

  try {
    const result =
      provider === "postmark"
        ? await relayViaPostmark(message, idempotencyKey)
        : await relayViaSendGrid(message, idempotencyKey);

    if (!result.ok) {
      throw new Error(`Provider responded with status ${result.status}: ${result.body}`);
    }

    consecutiveFailureByForm.set(formName, 0);

    logStructured("lead_notify_relay_attempt", {
      status: "success",
      destination: result.destination,
      formName,
      submissionId: payload.id || payload.submission_id || "unknown",
      idempotencyKey,
      provider,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, idempotencyKey, destination: result.destination }),
    };
  } catch (error) {
    const failureCount = (consecutiveFailureByForm.get(formName) || 0) + 1;
    consecutiveFailureByForm.set(formName, failureCount);

    logStructured("lead_notify_relay_attempt", {
      status: "failure",
      destination: provider,
      formName,
      submissionId: payload.id || payload.submission_id || "unknown",
      idempotencyKey,
      failureCount,
      error: error instanceof Error ? error.message : String(error),
    });

    if (failureCount >= alertThreshold) {
      await sendFailureAlert({
        event: "lead_notify_failure_threshold_reached",
        formName,
        failureCount,
        threshold: alertThreshold,
        provider,
        idempotencyKey,
        timestamp: new Date().toISOString(),
      });
    }

    inMemoryIdempotencyCache.delete(idempotencyKey);

    return {
      statusCode: 502,
      body: JSON.stringify({
        ok: false,
        error: "Notification relay failed",
        idempotencyKey,
        failureCount,
      }),
    };
  }
};
