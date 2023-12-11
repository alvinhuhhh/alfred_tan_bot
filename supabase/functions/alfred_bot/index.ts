import {
  Application,
  Router,
  BodyJson,
} from "https://deno.land/x/oak@v12.6.0/mod.ts";
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
bot.use(createConversation(secretsService.setWIFIPassword));
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
bot.use(createConversation(secretsService.setVoucherLink));
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

// Create oak app
const handleUpdate = webhookCallback(bot, "oak");

const app: Application = new Application();
const router: Router = new Router();

router.get("/alfred_bot/ping", (ctx) => {
  ctx.response.status = 200;
});

router.post("/alfred_bot/cron-trigger", async (ctx) => {
  const requestBody: BodyJson = ctx.request.body({ type: "json" });

  if (!requestBody) {
    console.error("Empty request body");
    return new Response("Empty request body", { status: 400 });
  }

  if (await cronService.handleCronTrigger(requestBody)) {
    ctx.response.status = 201;
  } else {
    ctx.response.body = "Unable to trigger dinner";
    ctx.response.status = 500;
  }
});

router.post("/alfred_bot", async (ctx) => {
  if (ctx.request.url.searchParams.get("secret") !== bot.token) {
    ctx.response.body = "Invalid Bot token received, unauthorized";
    ctx.response.status = 401;
    return;
  }
  await handleUpdate(ctx);
});

app.use(router.routes());
app.listen();
