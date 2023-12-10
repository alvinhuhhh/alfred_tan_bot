import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";

export default class ChatsService {
  bot: Bot<MyContext>;
  chatsRepository: ChatsRepository;

  constructor(bot: Bot<MyContext>, chatsRepository: ChatsRepository) {
    this.bot = bot;
    this.chatsRepository = chatsRepository;
  }

  public commandCatalog: InlineKeyboard = new InlineKeyboard()
    .text("See who's on tonight's dinner", "get-dinner-callback")
    .row()
    .text("Ask me for the WIFI password", "get-wifi-password-callback")
    .row()
    .text("Ask for the link for CDC Vouchers", "get-voucher-link-callback")
    .row();

  public async startChat(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";

    await this.chatsRepository.insertChat(id, type);

    ctx.reply("Welcome! I am up and running!", {
      reply_markup: this.commandCatalog,
    });
  }

  public async replyHello(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";

    await this.chatsRepository.insertChat(id, type);

    ctx.reply("Hello there! What can I do for you today?", {
      reply_markup: this.commandCatalog,
    });
  }

  public async replyName(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";

    await this.chatsRepository.insertChat(id, type);

    ctx.reply("How can I help?", {
      reply_to_message_id: ctx.message?.message_id,
      reply_markup: this.commandCatalog,
    });
  }

  public async exitConversation(ctx: MyContext): Promise<void> {
    await ctx.conversation.exit();
    ctx.reply("Ended any conversation we were having.");
  }

  public registerBotCommands(): void {
    this.bot.hears(/\balfred\b/i, async (ctx: MyContext) => {
      console.debug(ctx);
      await this.replyName(ctx);
    });

    this.bot.command("start", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.startChat(ctx);
    });

    this.bot.command("hello", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.replyHello(ctx);
    });

    this.bot.command("cancel", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.exitConversation(ctx);
    });
  }
}
