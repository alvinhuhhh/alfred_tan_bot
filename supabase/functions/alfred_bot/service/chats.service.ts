import { Context } from "https://deno.land/x/grammy@v1.23.0/mod.ts";
import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";

export default class ChatsService {
  public static startChatButton: InlineKeyboard = new InlineKeyboard().text(
    "Start chat",
    "start-chat-callback"
  );

  public static commandCatalog: InlineKeyboard = new InlineKeyboard()
    .text("See who's on tonight's dinner", "get-dinner-callback")
    .row()
    .text("Ask me for the WIFI password", "get-wifi-password-callback")
    .row()
    .text("Ask for the link for CDC Vouchers", "get-voucher-link-callback")
    .row();

  public static async startChat(ctx: Context): Promise<void> {
    try {
      const id: number = ctx.chat?.id ?? -1;
      const type: string | undefined = ctx.chat?.type;

      if (id === -1 || type === undefined)
        throw new Error("[startChat] id or chatType is undefined");

      const chat: Chat = {
        id: id,
        type: <ChatType>type,
      };
      await ChatsRepository.insertChat(chat);

      ctx.reply("Welcome! I am up and running!", {
        reply_markup: this.commandCatalog,
      });
    } catch (err) {
      console.error(err);
    }
  }

  public static async replyHello(ctx: Context): Promise<void> {
    try {
      const id: number = ctx.chat?.id ?? -1;
      const type: string | undefined = ctx.chat?.type;

      if (id === -1 || type === undefined)
        throw new Error("[replyHello] id or chatType is undefined");

      const chat: Chat = {
        id: id,
        type: <ChatType>type,
      };
      await ChatsRepository.insertChat(chat);

      ctx.reply("Hello there! What can I do for you today?", {
        reply_markup: this.commandCatalog,
      });
    } catch (err) {
      console.error(err);
    }
  }

  public static async replyName(ctx: Context): Promise<void> {
    try {
      const id: number = ctx.chat?.id ?? -1;
      const type: string | undefined = ctx.chat?.type;

      if (id === -1 || type === undefined)
        throw new Error("[replyName] id or chatType is undefined");

      const chat: Chat = {
        id: id,
        type: <ChatType>type,
      };
      await ChatsRepository.insertChat(chat);

      ctx.reply("How can I help?", {
        reply_to_message_id: ctx.message?.message_id,
        reply_markup: this.commandCatalog,
      });
    } catch (err) {
      console.error(err);
    }
  }

  public static async checkChatExists(
    ctx?: Context,
    chatId?: number
  ): Promise<boolean> {
    try {
      if (ctx) {
        const id: number | undefined = ctx.chat?.id;

        if (id === undefined)
          throw new Error("[checkChatExists] Chat id is undefined");

        if (await ChatsRepository.getChatById(id)) return true;
        return false;
      }

      if (chatId) {
        if (await ChatsRepository.getChatById(chatId)) return true;
        return false;
      }

      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  public static replyChatNotStarted(ctx: Context): void {
    try {
      ctx.reply("I am not started yet! Start me up?", {
        reply_markup: this.startChatButton,
      });
    } catch (err) {
      console.error(err);
    }
  }
}
