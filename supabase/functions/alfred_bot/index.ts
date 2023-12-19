import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";

import ChatsService from "./service/chats.service.ts";
import DinnersService from "./service/dinners.service.ts";
import SecretsService from "./service/secrets.service.ts";
import CronService from "./service/cron.service.ts";

try {
  // Create an instance of the Bot class
  const token = Deno.env.get("BOT_TOKEN");
  if (!token) {
    throw new Error("BOT_TOKEN is unset");
  }
  const bot = new Bot<MyContext>(token);

  // Basic chat commands
  bot.hears(/\balfred\b/i, async (ctx: MyContext) => {
    console.debug(ctx);
    await ChatsService.replyName(ctx);
  });

  bot.command("start", async (ctx: MyContext) => {
    console.debug(ctx);
    await ChatsService.startChat(ctx);
  });
  bot.callbackQuery("start-chat-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await ChatsService.startChat(ctx);
  });

  bot.command("hello", async (ctx: MyContext) => {
    console.debug(ctx);
    await ChatsService.replyHello(ctx);
  });

  // Dinners
  // Handle the /getdinner command
  bot.command("getdinner", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.getDinner(ctx);
  });
  bot.callbackQuery("get-dinner-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.getDinner(ctx);
  });

  // Handle the /startdinner command
  bot.command("startdinner", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.startDinner(ctx);
  });
  bot.callbackQuery("start-dinner-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.startDinner(ctx);
  });

  // Handle the /joindinner command
  bot.command("joindinner", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.joinDinner(ctx);
  });
  bot.callbackQuery("join-dinner-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.joinDinner(ctx);
  });

  // Handle the /leavedinner command
  bot.command("leavedinner", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.leaveDinner(ctx);
  });
  bot.callbackQuery("leave-dinner-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.leaveDinner(ctx);
  });

  // Handle the /enddinner command
  bot.command("enddinner", async (ctx: MyContext) => {
    console.debug(ctx);
    await DinnersService.endDinner(ctx);
  });

  // Secrets
  // Handle the /getwifipassword command
  bot.command("getwifipassword", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.getWIFIPassword(ctx);
  });
  bot.callbackQuery("get-wifi-password-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.getWIFIPassword(ctx);
  });

  // Handle the /setwifipassword command
  bot.command("setwifipassword", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.setWIFIPassword(ctx);
  });
  bot.callbackQuery("set-wifi-password-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.setWIFIPassword(ctx);
  });

  // Handle the /removewifipassword command
  bot.command("removewifipassword", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.removeWIFIPassword(ctx);
  });

  // Handle the /getcdcvouchers command
  bot.command("getcdcvouchers", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.getVoucherLink(ctx);
  });
  bot.callbackQuery("get-voucher-link-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.getVoucherLink(ctx);
  });

  // Handle the /setcdcvoucherlink command
  bot.command("setcdcvoucherlink", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.setVoucherLink(ctx);
  });
  bot.callbackQuery("set-voucher-link-callback", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.setVoucherLink(ctx);
  });

  // Handle the /removecdcvoucherlink command
  bot.command("removecdcvoucherlink", async (ctx: MyContext) => {
    console.debug(ctx);
    await SecretsService.removeVoucherLink(ctx);
  });

  // Create webhook callback
  const handleUpdate = webhookCallback(bot, "std/http");

  Deno.serve(async (req: Request) => {
    console.debug(`${req.method} ${req.url}`);
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/alfred_bot/ping") {
      return new Response("Ping", { status: 200 });
    }

    if (req.method === "POST" && url.pathname === "/alfred_bot/cron-trigger") {
      const requestBody: string = await req.text();

      if (!requestBody) {
        return new Response("Invalid request body", { status: 400 });
      }

      if (await CronService.handleCronTrigger(bot, requestBody)) {
        return new Response("Dinner started", { status: 201 });
      }
      return new Response("Unable to start dinner", { status: 500 });
    }

    if (req.method === "POST" && url.pathname === "/alfred_bot") {
      if (url.searchParams.get("secret") !== bot.token) {
        return new Response("Invalid Bot token received, unauthorized", {
          status: 401,
        });
      }

      return await handleUpdate(req);
    }

    return new Response("Not Found", { status: 404 });
  });
} catch (err) {
  console.error(err);
}
