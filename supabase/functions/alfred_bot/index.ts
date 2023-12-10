import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import Alfred from "./alfred.ts";

const alfred = new Alfred();

await serve(async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    console.debug(`${req.method} ${url.pathname}`);

    // Disallow HTTP methods
    if (req.method != "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Handler for cron schedule trigger
    if (url.pathname === "/alfred_bot/cron-trigger") {
      return await alfred.cronService.handleCronTrigger(req);
    }

    // Default handler
    if (url.searchParams.get("secret") !== alfred.bot.token) {
      return new Response("No Bot token received, unauthorized", {
        status: 401,
      });
    }
    return await alfred.handleUpdate(req);
  } catch (err) {
    console.error(err);
    return new Response(err, { status: 500 });
  }
});
