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

      const messageId: number | undefined = ctx.message?.message_id;

      const data = await DinnersRepository.getDinnerByDate(
        ctx.chat.id,
        new Date()
      );

      if (data && messageId) {
        await DinnersRepository.updateDinner(
          ctx.chat.id,
          messageId + 1, // next message replied by Bot
          new Date(),
          data.yes,
          data.no
        );

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
      const messageId: number | undefined = ctx.message?.message_id;

      const data = await DinnersRepository.getDinnerByDate(
        ctx.chat.id,
        new Date()
      );

      if (messageId) {
        if (!data) {
          const result = await DinnersRepository.insertDinner(
            ctx.chat.id,
            new Date(),
            name,
            messageId + 1 // next message replied by Bot
          );

          this.replyDinnerDetails(ctx, result);
        } else {
          const result = await DinnersRepository.updateDinner(
            ctx.chat.id,
            messageId + 1, // next message replied by Bot
            new Date(),
            data.yes,
            data.no
          );

          this.replyDinnerDetails(ctx, result);
        }
      }
    }
  }

  public static async startDinnerCallback(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";
      const messageId: number | undefined =
        ctx.callbackQuery?.message?.message_id;

      if (messageId) {
        const data = await DinnersRepository.insertDinner(
          ctx.chat.id,
          new Date(),
          name,
          messageId + 1 // next message replied by Bot
        );

        this.replyDinnerDetails(ctx, data);
      }
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

  public static async joinDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";
      const chatId = ctx.chat.id;
      const messageId = ctx.callbackQuery?.message?.message_id;

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

        if (messageId) {
          const result = await DinnersRepository.updateDinner(
            ctx.chat.id,
            messageId,
            new Date(),
            yes,
            no
          );

          // Update all messages in messageIds
          if (result?.messageIds) {
            for (const messageId of result.messageIds) {
              ctx.api.editMessageText(
                chatId,
                messageId,
                this.parseDinnerDetails(result),
                { parse_mode: "HTML", reply_markup: this.joinLeaveDinnerButton }
              );
            }
          }

          return;
        }
      } else {
        this.replyDinnerNotFound(ctx);
      }
    }
  }

  public static async leaveDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";
      const chatId = ctx.chat.id;
      const messageId = ctx.callbackQuery?.message?.message_id;

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

        if (messageId) {
          const result = await DinnersRepository.updateDinner(
            ctx.chat.id,
            messageId,
            new Date(),
            yes,
            no
          );

          // Update all messages in messageIds
          if (result?.messageIds) {
            for (const messageId of result.messageIds) {
              ctx.api.editMessageText(
                chatId,
                messageId,
                this.parseDinnerDetails(result),
                { parse_mode: "HTML", reply_markup: this.joinLeaveDinnerButton }
              );
            }
          }

          return;
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
