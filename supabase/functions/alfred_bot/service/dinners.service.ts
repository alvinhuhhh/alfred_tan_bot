import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";
import DinnersRepository from "../repository/dinners.repository.ts";

export default class DinnersService {
  public static startDinnerButton: InlineKeyboard = new InlineKeyboard().text(
    "Start Dinner",
    "start-dinner-callback"
  );

  public static joinLeaveDinnerButton: InlineKeyboard = new InlineKeyboard()
    .text("Leave Dinner", "leave-dinner-callback")
    .text("Join Dinner", "join-dinner-callback");

  public static parseDinnerDetails(data: any): string {
    const formattedDate = data.date.split("-").reverse().join("/");
    let yes = "";
    let no = "";

    for (const user of data.yes) {
      yes += `- ${user}\n`;
    }
    for (const user of data.no) {
      no += `- ${user}\n`;
    }

    const text =
      `\n<b>Dinner tonight:</b>\nDate: ${formattedDate}\n\n<u>YES:</u>\n` +
      yes +
      `\n<u>NO:</u>\n` +
      no;

    return text;
  }

  private static replyDinnerDetails(ctx: MyContext, data: any): void {
    ctx.reply(this.parseDinnerDetails(data), {
      parse_mode: "HTML",
      reply_markup: this.joinLeaveDinnerButton,
    });
    return;
  }

  private static replyDinnerNotFound(ctx: MyContext): void {
    ctx.reply("Dinner not started for tonight. Start one now?", {
      reply_markup: this.startDinnerButton,
    });
    return;
  }

  public static async getDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const data = await DinnersRepository.getDinnerByDate(
        ctx.chat.id,
        new Date()
      );

      if (data) {
        this.replyDinnerDetails(ctx, data);
      } else {
        this.replyDinnerNotFound(ctx);
      }
    }
  }

  public static async startDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";

      const data = await DinnersRepository.insertDinner(
        ctx.chat.id,
        new Date(),
        name
      );

      this.replyDinnerDetails(ctx, data);
    }
  }

  public static async startDinnerScheduled(
    chatId: number,
    chatType: string
  ): Promise<string> {
    await ChatsRepository.insertChat(chatId, chatType);

    const data = await DinnersRepository.insertDinner(chatId, new Date());

    return this.parseDinnerDetails(data);
  }

  public static async joinDinner(
    bot: Bot<MyContext>,
    ctx: MyContext
  ): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";
      const chatId = ctx.chat.id;
      const messageId = ctx.message?.message_id;

      const existingDinner = await DinnersRepository.getDinnerByDate(
        chatId,
        new Date()
      );
      if (existingDinner) {
        let yes: Array<string> = existingDinner.yes;
        let no: Array<string> = existingDinner.no;

        if (!existingDinner.yes.includes(name)) {
          yes = [...existingDinner.yes, name];
        }
        if (no.includes(name)) {
          no = existingDinner.no.filter((n: string) => n != name);
        }

        const result = await DinnersRepository.updateDinner(
          ctx.chat.id,
          new Date(),
          yes,
          no
        );

        if (messageId) {
          ctx.api.editMessageText(
            chatId,
            messageId,
            this.parseDinnerDetails(result),
            { parse_mode: "HTML", reply_markup: this.joinLeaveDinnerButton }
          );
        }
      } else {
        this.replyDinnerNotFound(ctx);
      }
    }
  }

  public static async leaveDinner(
    bot: Bot<MyContext>,
    ctx: MyContext
  ): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";
      const chatId = ctx.chat.id;
      const messageId = ctx.message?.message_id;

      const existingDinner = await DinnersRepository.getDinnerByDate(
        chatId,
        new Date()
      );
      if (existingDinner) {
        let yes: Array<string> = existingDinner.yes;
        let no: Array<string> = existingDinner.no;

        if (!existingDinner.no.includes(name)) {
          no = [...existingDinner.no, name];
        }
        if (existingDinner.yes.includes(name)) {
          yes = existingDinner.yes.filter((n: string) => n != name);
        }

        const result = await DinnersRepository.updateDinner(
          ctx.chat.id,
          new Date(),
          yes,
          no
        );

        if (messageId) {
          ctx.api.editMessageText(
            chatId,
            messageId,
            this.parseDinnerDetails(result),
            { parse_mode: "HTML", reply_markup: this.joinLeaveDinnerButton }
          );
        }
      } else {
        this.replyDinnerNotFound(ctx);
      }
    }
  }

  public static async endDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await DinnersRepository.deleteDinner(ctx.chat.id, new Date());

      ctx.reply("No more dinner for tonight!");
    }
  }
}
