import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Bot,
  webhookCallback,
  session,
} from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { conversations } from "https://deno.land/x/grammy_conversations@v1.1.1/mod.ts";

import ChatsRepository from "./repository/chats.repository.ts";
import DinnersRepository from "./repository/dinners.repository.ts";
import SecretsRepository from "./repository/secrets.repository.ts";

import BasicService from "./service/basic.service.ts";
import ChatsService from "./service/chats.service.ts";
import DinnersService from "./service/dinners.service.ts";
import SecretsService from "./service/secrets.service.ts";
import CronService from "./service/cron.service.ts";

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

// Initialize repositories
const chatsRepository = new ChatsRepository();
const dinnersRepository = new DinnersRepository();
const secretsRepository = new SecretsRepository();

// Basic commands
const chatsService = new ChatsService(chatsRepository);
const basicService = new BasicService(bot, chatsService);
basicService.registerBotCommands();

// Dinners
const dinnersService = new DinnersService(
  bot,
  chatsRepository,
  dinnersRepository
);
dinnersService.registerBotCommands();

// Secrets
const secretsService = new SecretsService(
  bot,
  chatsRepository,
  secretsRepository
);
secretsService.registerBotCommands();

// Scheduler service
const cronService = new CronService(bot, dinnersService);

const handleUpdate = webhookCallback(bot, "std/http");

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
