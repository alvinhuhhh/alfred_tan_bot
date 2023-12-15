import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsService from "./chats.service.ts";
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
  }

  private static replyDinnerNotFound(ctx: MyContext): void {
    ctx.reply("Dinner not started for tonight. Start one now?", {
      reply_markup: this.startDinnerButton,
    });
  }

  public static async getDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const chatId: number = ctx.chat.id;
        const messageId: number | undefined = ctx.message?.message_id;

        if (messageId === undefined)
          throw new Error(`[getDinner] messageId is undefined`);

        const data = await DinnersRepository.getDinnerByDate(
          chatId,
          new Date()
        );

        if (data) {
          const dinner: Dinner = {
            id: data.id,
            chatId: chatId,
            messageIds: DinnersRepository.addMessageId(
              data.messageIds,
              messageId + 1
            ),
            date: new Date(),
            yes: data.yes,
            no: data.no,
          };

          await DinnersRepository.updateDinner(dinner);

          this.replyDinnerDetails(ctx, data);
        } else {
          this.replyDinnerNotFound(ctx);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async startDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const name: string | undefined = ctx.from?.first_name;
        const chatId: number = ctx.chat.id;
        const messageId: number | undefined = ctx.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[startDinner] name or messageId is undefined`);

        const data = await DinnersRepository.getDinnerByDate(
          chatId,
          new Date()
        );

        if (!data) {
          const result = await DinnersRepository.insertDinner(
            chatId,
            [messageId + 1],
            new Date(),
            [name],
            []
          );

          this.replyDinnerDetails(ctx, result);
          return;
        }

        const dinner: Dinner = {
          id: data.id,
          chatId: chatId,
          messageIds: DinnersRepository.addMessageId(
            data.messageIds,
            messageId + 1
          ),
          date: data.date,
          yes: data.yes,
          no: data.no,
        };

        const result = await DinnersRepository.updateDinner(dinner);

        this.replyDinnerDetails(ctx, result);
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async startDinnerCallback(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const name: string | undefined = ctx.from?.first_name;
        const chatId: number = ctx.chat.id;
        const messageId: number | undefined =
          ctx.callbackQuery?.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[startDinner] name or messageId is undefined`);

        const data = await DinnersRepository.getDinnerByDate(
          chatId,
          new Date()
        );

        if (!data) {
          const result = await DinnersRepository.insertDinner(
            chatId,
            [messageId + 1],
            new Date(),
            [name],
            []
          );

          this.replyDinnerDetails(ctx, result);
          return;
        }

        const dinner: Dinner = {
          id: data.id,
          chatId: chatId,
          messageIds: DinnersRepository.addMessageId(
            data.messageIds,
            messageId + 1
          ),
          date: data.date,
          yes: data.yes,
          no: data.no,
        };

        const result = await DinnersRepository.updateDinner(dinner);

        this.replyDinnerDetails(ctx, result);
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async startDinnerScheduled(chatId: number): Promise<string> {
    const chatExists: boolean = await ChatsService.checkChatExists(
      undefined,
      chatId
    );
    if (!chatExists)
      console.error("[startDinnerScheduled] Chat does not exist");

    const data = await DinnersRepository.insertDinner(
      chatId,
      [],
      new Date(),
      [],
      []
    );

    return this.parseDinnerDetails(data);
  }

  public static async joinDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const name: string | undefined = ctx.from?.first_name;
        const chatId: number = ctx.chat.id;
        const messageId: number | undefined =
          ctx.callbackQuery?.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[joinDinner] name or messageId is undefined`);

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

          const dinner: Dinner = {
            id: existingDinner.id,
            chatId: chatId,
            date: existingDinner.date,
            messageIds: existingDinner.messageIds,
            yes: yes,
            no: no,
          };

          const result = await DinnersRepository.updateDinner(dinner);

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
        } else {
          this.replyDinnerNotFound(ctx);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async leaveDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const name: string | undefined = ctx.from?.first_name;
        const chatId: number = ctx.chat.id;
        const messageId: number | undefined =
          ctx.callbackQuery?.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[leaveDinner] name or messageId is undefined`);

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

          const dinner: Dinner = {
            id: existingDinner.id,
            chatId: chatId,
            date: existingDinner.date,
            messageIds: existingDinner.messageIds,
            yes: yes,
            no: no,
          };

          const result = await DinnersRepository.updateDinner(dinner);

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
        } else {
          this.replyDinnerNotFound(ctx);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async endDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        await DinnersRepository.deleteDinner(ctx.chat.id, new Date());

        ctx.reply("No more dinner for tonight!");
      } catch (err) {
        console.error(err);
      }
    }
  }
}
