/**
 * The entry point Cloudflare deploys.
 *
 * On Pages the directory layout was the router: functions/api/enquiry.ts
 * answered /api/enquiry with no configuration. Workers have no such
 * convention, so the one dynamic route is mapped here by hand and everything
 * else is handed to the static assets built into dist/.
 *
 * The handler itself is untouched and still lives at its old path, where the
 * filename goes on documenting the route it serves. It was already written
 * against Web standards — Request in, Response out, configuration through
 * `env` — which is exactly what a Worker's fetch handler receives, so this
 * file is a router and nothing more. The dev-server adapter in vite.config.ts
 * loads the same module, so all three environments run one copy of the send
 * logic.
 */
import { onRequest } from "../functions/api/enquiry";

/* Hand-written rather than pulled from @cloudflare/workers-types, matching how
   vite.config.ts narrows the same handler: one method is used, so one method
   is declared, and the project keeps its dependency list short. */
interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/enquiry") return onRequest({ request, env });

    /* Reached only when the path matched no built file. Cloudflare serves the
       real assets before the Worker is ever invoked. */
    return env.ASSETS.fetch(request);
  },
};
