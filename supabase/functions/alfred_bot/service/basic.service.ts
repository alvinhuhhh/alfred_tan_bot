import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import ChatsService from "./chats.service.ts";

export default class BasicService {
  bot: Bot<MyContext>;
  chatsService: ChatsService;

  constructor(bot: Bot<MyContext>, chatsService: ChatsService) {
    this.bot = bot;
    this.chatsService = chatsService;
  }

  public registerBotCommands(): void {
    this.bot.hears(/\balfred\b/i, async (ctx) => {
      console.debug(ctx);
      await this.chatsService.replyName(ctx);
    });

    this.bot.command("start", async (ctx) => {
      console.debug(ctx);
      await this.chatsService.startChat(ctx);
    });

    this.bot.command("hello", async (ctx) => {
      console.debug(ctx);
      await this.chatsService.replyHello(ctx);
    });
  }
}
