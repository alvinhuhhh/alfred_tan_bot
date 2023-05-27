import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Bot,
  webhookCallback,
  session,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import {
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.1.1/mod.ts";

// Import services
import UsersService from "./service/users.service.ts";
import DinnerService from "./service/dinner.service.ts";

// Create an instance of the Bot class
const token = Deno.env.get("BOT_TOKEN");
if (!token) throw new Error("BOT_TOKEN is unset");
const bot = new Bot<MyContext>(token);

// Install the session plugin
bot.use(
  session({
    initial() {
      // return empty object for now
      return {};
    },
  })
);

// Install the conversations plugin
bot.use(conversations());

// Register conversations
bot.use(createConversation(UsersService.addUser));
bot.use(createConversation(UsersService.updateUser));
bot.use(createConversation(UsersService.deleteUser));

// Basic commands
bot.hears(/alfred/i, (ctx) => {
  ctx.reply("How can I help?", {
    reply_to_message_id: ctx.msg.message_id,
  });
});

bot.command("start", (ctx) => ctx.reply("Welcome! I am up and running!"));

bot.command("hello", (ctx) =>
  ctx.reply("Hello there! What can I do for you today?")
);

// Handle the /getusers command
bot.command("getusers", async (ctx) => {
  await UsersService.getAllUsers(ctx);
});

// Handle the /adduser command
bot.command("adduser", async (ctx) => {
  await ctx.conversation.enter("addUser");
});

// Handle the /updateuser command
bot.command("updateuser", async (ctx) => {
  await ctx.conversation.enter("updateUser");
});

// Handle the /deleteuser command
bot.command("deleteuser", async (ctx) => {
  await ctx.conversation.enter("deleteUser");
});

// Handle the /getdinner command
bot.command("getdinner", async (ctx) => {
  await DinnerService.getDinner(ctx);
});

// Handle the /startdinner command
bot.command("startdinner", async (ctx) => {
  await DinnerService.startDinner(ctx);
});
bot.callbackQuery("start-dinner-callback", async (ctx) => {
  await DinnerService.startDinner(ctx);
});

// Handle the /joindinner command
bot.command("joindinner", async (ctx) => {
  await DinnerService.joinDinner(ctx);
});
bot.callbackQuery("join-dinner-callback", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Join dinner",
  });
});

// Handle the /leavedinner command
bot.command("leavedinner", async (ctx) => {
  await DinnerService.leaveDinner(ctx);
});
bot.callbackQuery("leave-dinner-callback", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Leave dinner",
  });
});

// Handle the /enddinner command
bot.command("enddinner", async (ctx) => {
  await DinnerService.endDinner(ctx);
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
