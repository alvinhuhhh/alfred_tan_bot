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
import ChatsService from "./service/chats.service.ts";
import DinnersService from "./service/dinners.service.ts";
import SecretsService from "./service/secrets.service.ts";

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
bot.use(createConversation(SecretsService.setWIFIPassword));
bot.use(createConversation(SecretsService.setVoucherLink));

// Basic commands
bot.hears(/\balfred\b/i, async (ctx) => {
  console.debug(ctx);
  await ChatsService.replyName(ctx);
});

bot.command("start", async (ctx) => {
  console.debug(ctx);
  await ChatsService.startChat(ctx);
});

bot.command("hello", async (ctx) => {
  console.debug(ctx);
  await ChatsService.replyHello(ctx);
});

// Handle the /getdinner command
bot.command("getdinner", async (ctx) => {
  console.debug(ctx);
  await DinnersService.getDinner(ctx);
});
bot.callbackQuery("get-dinner-callback", async (ctx) => {
  console.debug(ctx);
  await DinnersService.getDinner(ctx);
});

// Handle the /startdinner command
bot.command("startdinner", async (ctx) => {
  console.debug(ctx);
  await DinnersService.startDinner(ctx);
});
bot.callbackQuery("start-dinner-callback", async (ctx) => {
  console.debug(ctx);
  await DinnersService.startDinner(ctx);
});

// Handle the /joindinner command
bot.command("joindinner", async (ctx) => {
  console.debug(ctx);
  await DinnersService.joinDinner(ctx);
});
bot.callbackQuery("join-dinner-callback", async (ctx) => {
  console.debug(ctx);
  await DinnersService.joinDinner(ctx);
});

// Handle the /leavedinner command
bot.command("leavedinner", async (ctx) => {
  console.debug(ctx);
  await DinnersService.leaveDinner(ctx);
});
bot.callbackQuery("leave-dinner-callback", async (ctx) => {
  console.debug(ctx);
  await DinnersService.leaveDinner(ctx);
});

// Handle the /enddinner command
bot.command("enddinner", async (ctx) => {
  console.debug(ctx);
  await DinnersService.endDinner(ctx);
});

// Handle the /getwifipassword command
bot.command("getwifipassword", async (ctx) => {
  console.debug(ctx);
  await SecretsService.getWIFIPassword(ctx);
});
bot.callbackQuery("get-wifi-password-callback", async (ctx) => {
  console.debug(ctx);
  await SecretsService.getWIFIPassword(ctx);
});

// Handle the /setwifipassword command
bot.command("setwifipassword", async (ctx) => {
  console.debug(ctx);
  await ctx.conversation.enter("setWIFIPassword");
});
bot.callbackQuery("set-wifi-password-callback", async (ctx) => {
  console.debug(ctx);
  await ctx.conversation.enter("setWIFIPassword");
});

// Handle the /removewifipassword command
bot.command("removewifipassword", async (ctx) => {
  console.debug(ctx);
  await SecretsService.removeWIFIPassword(ctx);
});

// Handle the /getcdcvouchers command
bot.command("getcdcvouchers", async (ctx) => {
  console.debug(ctx);
  await SecretsService.getVoucherLink(ctx);
});
bot.callbackQuery("get-voucher-link-callback", async (ctx) => {
  console.debug(ctx);
  await SecretsService.getVoucherLink(ctx);
});

// Handle the /setcdcvoucherlink command
bot.command("setcdcvoucherlink", async (ctx) => {
  console.debug(ctx);
  await ctx.conversation.enter("setVoucherLink");
});
bot.callbackQuery("set-voucher-link-callback", async (ctx) => {
  console.debug(ctx);
  await ctx.conversation.enter("setVoucherLink");
});

// Handle the /removecdcvoucherlink command
bot.command("removecdcvoucherlink", async (ctx) => {
  console.debug(ctx);
  await SecretsService.removeVoucherLink(ctx);
});

const handleUpdate = webhookCallback(bot, "std/http");

await serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    console.debug(`${req.method} ${url.pathname}`);

    // Disallow methods
    if (req.method != "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Path for cron schedule trigger
    if (url.pathname === "/alfred_bot/cron-trigger") {
      if (!req.body) {
        return new Response("Empty request body", { status: 400 });
      }

      const body: any = await req.json();
      const message: string | undefined =
        await DinnersService.startDinnerScheduled(body.chatId, body.chatType);

      if (!message) {
        return new Response("Unable to trigger start dinner", { status: 500 });
      }

      bot.api.sendMessage(body.chatId, message, {
        parse_mode: "HTML",
        reply_markup: DinnersService.joinLeaveDinnerButton,
      });

      return new Response("Start dinner triggered", { status: 201 });
    }

    // Normal Bot path
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("No Bot token received, unauthorized", {
        status: 401,
      });
    }

    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
