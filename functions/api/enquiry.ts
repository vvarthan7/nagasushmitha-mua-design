/**
 * POST /api/enquiry — turns a submission from the Enquire form into an email.
 *
 * Routed by worker/index.ts, which answers /api/enquiry from the same Worker
 * that serves the static site — so, same origin: no CORS preflight, no second
 * deploy to keep in step, and no endpoint URL to thread through the client as
 * configuration. Under Pages the path this file sits at *was* the route; on
 * Workers there is no such convention, and it is kept only because it still
 * names the route the router maps.
 *
 * Two things differ from a Node serverless function, and both are load-bearing:
 *
 *   1. Config arrives as `env`, not `process.env`. Workers have no process.
 *   2. It speaks the Web platform — Request in, Response out.
 *
 * Resend is called over its REST API with plain fetch rather than through the
 * `resend` npm package. The SDK reaches for Node built-ins that only exist on
 * Workers behind the nodejs_compat flag; one POST needs none of that, and this
 * way there is no dependency to bundle and nothing to break on a runtime
 * upgrade. It is the same API the SDK itself calls.
 *
 * The key is read here and never leaves: it is a bearer token for the whole
 * Resend account, so a bundle carrying it would let any visitor send mail as
 * this domain. Resend refuses browser origins outright in any case.
 */

interface Env {
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
}

/* Pages hands the handler far more than this, but narrowing to what is
   actually used keeps the dev-server adapter in vite.config.ts able to satisfy
   the same shape without inventing a whole execution context. */
interface RequestContext {
  request: Request;
  env: Env;
}

interface Enquiry {
  name: string;
  phone: string;
  location: string;
  date: string;
  message: string;
}

/** Long enough for a chatty bride, short enough that nobody pastes a novel. */
const MAX_LENGTH: Record<keyof Enquiry, number> = {
  name: 120,
  phone: 60,
  location: 160,
  date: 60,
  message: 4000,
};

/** What the form sends: an Indian mobile number, ten digits, no country code.
 *  The form strips it to that as it is typed; a client posting here directly
 *  does no such thing, so the rule is stated again on this side. */
const PHONE_DIGITS = 10;

/** Read cap for the whole body, so a hostile client cannot stream forever. */
const MAX_BODY_BYTES = 16_000;

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function json(
  status: number,
  body: unknown,
  headers: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

/** Trim, cap, and collapse newlines out of everything but the message — the
 *  others are single-line fields and `name` ends up in the subject. */
function field(body: Record<string, unknown>, key: keyof Enquiry): string {
  const value = body[key];
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, MAX_LENGTH[key]);
  return key === "message" ? trimmed : trimmed.replace(/\s+/g, " ");
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => ESCAPES[character]);

function render(enquiry: Enquiry): { text: string; html: string } {
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Phone / WhatsApp", enquiry.phone],
    ["Location", enquiry.location || "—"],
    ["Event date", enquiry.date || "—"],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    enquiry.message || "(no message)",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.7;color:#221a1e">
      <h2 style="font-size:17px;margin:0 0 16px">New enquiry from the website</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px">
        ${rows
          .map(
            ([label, value]) => `<tr>
          <td style="padding:4px 16px 4px 0;color:#7a6b72;white-space:nowrap">${label}</td>
          <td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td>
        </tr>`,
          )
          .join("")}
      </table>
      <div style="white-space:pre-wrap;border-left:3px solid #c9a99a;padding-left:14px;color:#3d3136">${
        escapeHtml(enquiry.message) ||
        '<em style="color:#7a6b72">No message left.</em>'
      }</div>
    </div>
  `;

  return { text, html };
}

export async function onRequest({
  request,
  env,
}: RequestContext): Promise<Response> {
  if (request.method !== "POST") {
    return json(405, { error: "Method not allowed." }, { allow: "POST" });
  }

  const apiKey = env.RESEND_API_KEY;
  const to = env.ENQUIRY_TO;

  /* Both are required rather than defaulted. A missing key is obvious — nothing
     sends — but a missing recipient falling back to an address baked in here
     would be worse than an error: enquiries would appear to send while landing
     in a stranger's inbox, and nobody would know to look. */
  if (!apiKey || !to) {
    const missing = [!apiKey && "RESEND_API_KEY", !to && "ENQUIRY_TO"]
      .filter(Boolean)
      .join(" and ");
    console.error(
      `[enquiry] not configured — missing ${missing}. See .env.example`,
    );
    return json(500, { error: "Email is not configured on the server yet." });
  }

  try {
    /* Checked before reading rather than after, so an oversized body is refused
       without being pulled into memory first. The length check below still
       stands, content-length being a claim rather than a guarantee. */
    const declared = Number(request.headers.get("content-length") ?? 0);
    if (declared > MAX_BODY_BYTES) {
      return json(413, { error: "That message is too long." });
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json(413, { error: "That message is too long." });
    }
    if (!raw.trim()) return json(400, { error: "The enquiry was empty." });

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object")
        throw new Error("not an object");
      body = parsed as Record<string, unknown>;
    } catch {
      return json(400, { error: "The enquiry could not be read." });
    }

    /* Honeypot. The field is hidden from people, so anything in it is a bot;
       answering 200 leaves it nothing to tune against. */
    if (typeof body.company === "string" && body.company.trim() !== "") {
      return json(200, { ok: true });
    }

    const enquiry: Enquiry = {
      name: field(body, "name"),
      phone: field(body, "phone"),
      location: field(body, "location"),
      date: field(body, "date"),
      message: field(body, "message"),
    };

    if (!enquiry.name || !enquiry.phone) {
      return json(400, { error: "Please leave a name and a phone number." });
    }

    if (enquiry.phone.replace(/\D/g, "").length !== PHONE_DIGITS) {
      return json(400, { error: "Please leave a 10-digit phone number." });
    }

    const { text, html } = render(enquiry);
    const sent = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        /* Until a domain is verified at resend.com/domains, Resend accepts
           exactly one route: onboarding@resend.dev as the sender, and the
           account's own address as the recipient. See the README. */
        from: env.ENQUIRY_FROM ?? "Enquiries <onboarding@resend.dev>",
        to,
        subject: `New enquiry — ${enquiry.name}`,
        text,
        html,
      }),
    });

    /* Resend reports refusals with a status, not by throwing, so an unchecked
       call would report every rejected send to the visitor as a success. */
    if (!sent.ok) {
      console.error(
        `[enquiry] Resend refused the send: ${sent.status} ${await sent.text()}`,
      );
      return json(502, {
        error: "The enquiry could not be sent. Please try WhatsApp instead.",
      });
    }

    const { id } = (await sent.json()) as { id?: string };
    console.log(`[enquiry] sent ${id} for ${enquiry.name}`);
    return json(200, { ok: true });
  } catch (error) {
    console.error("[enquiry] unexpected failure:", error);
    return json(500, {
      error: "Something went wrong. Please try WhatsApp instead.",
    });
  }
}
