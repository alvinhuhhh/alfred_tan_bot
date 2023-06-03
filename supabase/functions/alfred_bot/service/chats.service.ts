import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";

export default class ChatsService {
  static commandCatalog = new InlineKeyboard()
    .text("See who's on tonight's dinner", "get-dinner-callback")
    .row()
    .text("Ask me for the WIFI password", "get-wifi-password-callback")
    .row();

  public static async startChat(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";

    await ChatsRepository.insertChat(id, type);

    ctx.reply("Welcome! I am up and running!", {
      reply_markup: this.commandCatalog,
    });
  }

  public static async replyHello(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";

    await ChatsRepository.insertChat(id, type);

    ctx.reply("Hello there! What can I do for you today?", {
      reply_markup: this.commandCatalog,
    });
  }

  public static async replyName(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";

    await ChatsRepository.insertChat(id, type);

    ctx.reply("How can I help?", {
      reply_to_message_id: ctx.message?.message_id,
      reply_markup: this.commandCatalog,
    });
  }
}
