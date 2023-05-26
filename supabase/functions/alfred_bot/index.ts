import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import Users from "./users.ts";

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

// Handle hearing his own name
bot.hears(/alfred/i, (ctx) => {
  ctx.reply("I heard my name!");
});

// Handle the /users command
bot.command("users", async (ctx) => {
  const data = await Users.getUsers();
  const usernames = data.map((entry) => entry["name"]);

  ctx.reply(`Here are the registered users: ${JSON.stringify(usernames)}`);
});

// Handle the /insert command
bot.command("insert", async (ctx) => {
  await Users.insertUser("testUser1");
  const data = await Users.getUsers();
  const usernames = data.map((entry) => entry["name"]);

  ctx.reply(`Here are the registered users: ${JSON.stringify(usernames)}`);
});

// Handle the /update command
bot.command("update", async (ctx) => {
  await Users.updateUser(1, "albert");
  const data = await Users.getUsers();
  const usernames = data.map((entry) => entry["name"]);

  ctx.reply(`Here are the registered users: ${JSON.stringify(usernames)}`);
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
