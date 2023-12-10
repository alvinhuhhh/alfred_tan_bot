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

export default class Alfred {
  bot: Bot<MyContext>;
  handleUpdate: (...args: any[]) => any;
  chatsRepository: ChatsRepository;
  dinnersRepository: DinnersRepository;
  secretsRepository: SecretsRepository;
  chatsService: ChatsService;
  dinnersService: DinnersService;
  secretsService: SecretsService;
  cronService: CronService;

  constructor() {
    // Create an instance of the Bot class
    const token = Deno.env.get("BOT_TOKEN");
    if (!token) {
      throw new Error("BOT_TOKEN is unset");
    }
    this.bot = new Bot<MyContext>(token);
    this.handleUpdate = webhookCallback(this.bot, "std/http");

    // Initialize repositories
    this.chatsRepository = new ChatsRepository();
    this.dinnersRepository = new DinnersRepository();
    this.secretsRepository = new SecretsRepository();

    // Initialize services
    this.chatsService = new ChatsService(this.bot, this.chatsRepository);
    this.dinnersService = new DinnersService(
      this.bot,
      this.chatsRepository,
      this.dinnersRepository
    );
    this.secretsService = new SecretsService(
      this.bot,
      this.chatsRepository,
      this.secretsRepository
    );
    this.cronService = new CronService(this.bot, this.dinnersService);

    // Install the session plugin
    this.bot.use(
      session({
        initial() {
          // return empty object for now
          return {};
        },
      })
    );

    // Install the conversations plugin
    this.bot.use(conversations());

    // Register conversations
    this.bot.use(createConversation(this.secretsService.setWIFIPassword));
    this.bot.use(createConversation(this.secretsService.setVoucherLink));

    // Register commands
    this.chatsService.registerBotCommands();
    this.dinnersService.registerBotCommands();
    this.secretsService.registerBotCommands();
  }
}
