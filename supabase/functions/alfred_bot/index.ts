import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { createClient } from "https://deno.land/x/supabase@1.3.1/mod.ts";

// Create an instance of the Bot class and pass your bot token to it
const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot(token);

// Handle the /start command
bot.command("start", (ctx) => ctx.reply("Welcome! I am up and running!"));

// Handle the /hello command
bot.command("hello", (ctx) =>
  ctx.reply("Hello there! What can I do for you today?")
);

// Handle the /users command
bot.command("users", async (ctx) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (SUPABASE_URL && SERVICE_KEY) {
    const db = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data } = await db.from("User").select();
    console.log(JSON.stringify(data));
  }

  ctx.reply("Get users");
});

const handleUpdate = webhookCallback(bot, "std/http");

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("not allowed", { status: 405 });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
