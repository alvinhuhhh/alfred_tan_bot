import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Bot,
  webhookCallback,
  session,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import {
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.1.1/conversation.ts";

import ChatsRepository from "./repository/chats.repository.ts";
import DinnersRepository from "./repository/dinners.repository.ts";
import SecretsRepository from "./repository/secrets.repository.ts";
import ChatsService from "./service/chats.service.ts";
import DinnersService from "./service/dinners.service.ts";
import SecretsService from "./service/secrets.service.ts";
import CronService from "./service/cron.service.ts";

// Create an instance of the Bot class
const token = Deno.env.get("BOT_TOKEN");
if (!token) {
  throw new Error("BOT_TOKEN is unset");
}
const bot = new Bot<MyContext>(token);
const handleUpdate = webhookCallback(bot, "std/http");

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

// Initialize repositories
const chatsRepository = new ChatsRepository();
const dinnersRepository = new DinnersRepository();
const secretsRepository = new SecretsRepository();

// Basic chat commands
const chatsService = new ChatsService(bot, chatsRepository);

bot.hears(/\balfred\b/i, async (ctx: MyContext) => {
  console.debug(ctx);
  await chatsService.replyName(ctx);
});

bot.command("start", async (ctx: MyContext) => {
  console.debug(ctx);
  await chatsService.startChat(ctx);
});

bot.command("hello", async (ctx: MyContext) => {
  console.debug(ctx);
  await chatsService.replyHello(ctx);
});

bot.command("cancel", async (ctx: MyContext) => {
  console.debug(ctx);
  await chatsService.exitConversation(ctx);
});

// Dinners
const dinnersService = new DinnersService(
  bot,
  chatsRepository,
  dinnersRepository
);

// Handle the /getdinner command
bot.command("getdinner", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.getDinner(ctx);
});
bot.callbackQuery("get-dinner-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.getDinner(ctx);
});

// Handle the /startdinner command
bot.command("startdinner", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.startDinner(ctx);
});
bot.callbackQuery("start-dinner-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.startDinner(ctx);
});

// Handle the /joindinner command
bot.command("joindinner", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.joinDinner(ctx);
});
bot.callbackQuery("join-dinner-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.joinDinner(ctx);
});

// Handle the /leavedinner command
bot.command("leavedinner", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.leaveDinner(ctx);
});
bot.callbackQuery("leave-dinner-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.leaveDinner(ctx);
});

// Handle the /enddinner command
bot.command("enddinner", async (ctx: MyContext) => {
  console.debug(ctx);
  await dinnersService.endDinner(ctx);
});

// Secrets
const secretsService = new SecretsService(
  bot,
  chatsRepository,
  secretsRepository
);

// Handle the /getwifipassword command
bot.command("getwifipassword", async (ctx: MyContext) => {
  console.debug(ctx);
  await secretsService.getWIFIPassword(ctx);
});
bot.callbackQuery("get-wifi-password-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await secretsService.getWIFIPassword(ctx);
});

// Handle the /setwifipassword command
bot.command("setwifipassword", async (ctx: MyContext) => {
  console.debug(ctx);
  await ctx.conversation.enter("setWIFIPassword");
});
bot.callbackQuery("set-wifi-password-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await ctx.conversation.enter("setWIFIPassword");
});

// Handle the /removewifipassword command
bot.command("removewifipassword", async (ctx: MyContext) => {
  console.debug(ctx);
  await secretsService.removeWIFIPassword(ctx);
});

// Handle the /getcdcvouchers command
bot.command("getcdcvouchers", async (ctx: MyContext) => {
  console.debug(ctx);
  await secretsService.getVoucherLink(ctx);
});
bot.callbackQuery("get-voucher-link-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await secretsService.getVoucherLink(ctx);
});

// Handle the /setcdcvoucherlink command
bot.command("setcdcvoucherlink", async (ctx: MyContext) => {
  console.debug(ctx);
  await ctx.conversation.enter("setVoucherLink");
});
bot.callbackQuery("set-voucher-link-callback", async (ctx: MyContext) => {
  console.debug(ctx);
  await ctx.conversation.enter("setVoucherLink");
});

// Handle the /removecdcvoucherlink command
bot.command("removecdcvoucherlink", async (ctx: MyContext) => {
  console.debug(ctx);
  await secretsService.removeVoucherLink(ctx);
});

// Cron
const cronService = new CronService(bot, dinnersService);

// Register conversations
bot.use(createConversation(secretsService.setWIFIPassword));
bot.use(createConversation(secretsService.setVoucherLink));

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
      return await cronService.handleCronTrigger(req);
    }

    // Default handler
    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("No Bot token received, unauthorized", {
        status: 401,
      });
    }
    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
    return new Response(err, { status: 500 });
  }
});
