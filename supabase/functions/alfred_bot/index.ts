import {
  Bot,
  webhookCallback,
  session,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import {
  conversations,
  createConversation,
} from "https://deno.land/x/grammy_conversations@v1.1.2/conversation.ts";

import ChatsRepository from "./repository/chats.repository.ts";
import DinnersRepository from "./repository/dinners.repository.ts";
import SecretsRepository from "./repository/secrets.repository.ts";
import ChatsService from "./service/chats.service.ts";
import DinnersService from "./service/dinners.service.ts";
import SecretsService from "./service/secrets.service.ts";
import CronService from "./service/cron.service.ts";

try {
  // Create an instance of the Bot class
  // const token = Deno.env.get("BOT_TOKEN");
  const token = "abc";
  if (!token) {
    throw new Error("BOT_TOKEN is unset");
  }
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
  // bot.use(conversations());

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
  // bot.use(createConversation(secretsService.setWIFIPassword));
  // bot.command("setwifipassword", async (ctx: MyContext) => {
  //   console.debug(ctx);
  //   await ctx.conversation.enter("setWIFIPassword");
  // });
  // bot.callbackQuery("set-wifi-password-callback", async (ctx: MyContext) => {
  //   console.debug(ctx);
  //   await ctx.conversation.enter("setWIFIPassword");
  // });

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
  // bot.use(createConversation(secretsService.setVoucherLink));
  // bot.command("setcdcvoucherlink", async (ctx: MyContext) => {
  //   console.debug(ctx);
  //   await ctx.conversation.enter("setVoucherLink");
  // });
  // bot.callbackQuery("set-voucher-link-callback", async (ctx: MyContext) => {
  //   console.debug(ctx);
  //   await ctx.conversation.enter("setVoucherLink");
  // });

  // Handle the /removecdcvoucherlink command
  bot.command("removecdcvoucherlink", async (ctx: MyContext) => {
    console.debug(ctx);
    await secretsService.removeVoucherLink(ctx);
  });

  // Cron
  const cronService = new CronService(bot, dinnersService);

  // Create webhook callback
  const handleUpdate = webhookCallback(bot, "std/http");

  Deno.serve(async (req: Request) => {
    console.debug(`${req.method} ${req.url}`);
    const url = new URL(req.url);

    if (url.pathname === "/alfred_bot/ping") {
      return new Response("Ping", { status: 200 });
    }

    if (url.pathname === "/alfred_bot/cron-trigger") {
      const requestBody: string = await req.text();

      if (!requestBody) {
        return new Response("Invalid request body", { status: 400 });
      }

      if (await cronService.handleCronTrigger(requestBody)) {
        return new Response("Dinner started", { status: 201 });
      }
      return new Response("Unable to start dinner", { status: 500 });
    }

    if (url.searchParams.get("secret") !== bot.token) {
      return new Response("Invalid Bot token received, unauthorized", {
        status: 401,
      });
    }
    return await handleUpdate(req);
  });
} catch (err) {
  console.error(err);
}
