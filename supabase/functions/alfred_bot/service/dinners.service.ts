import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import Util from "../util/util.ts";
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

  public static parseDinnerDetails(data: Dinner): string {
    const formattedDate = data.date
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("/");

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

  private static replyDinnerDetails(ctx: MyContext, data: Dinner): void {
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

  private static replyError(ctx: MyContext): void {
    ctx.reply("An error occurred, please try me again later");
  }

  public static async getDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const chatId: number = ctx.chat.id;
        const messageId: number | undefined =
          ctx.message?.message_id ?? ctx.callbackQuery?.message?.message_id;

        if (messageId === undefined)
          throw new Error(`[getDinner] messageId is undefined`);

        const data: Dinner | undefined =
          await DinnersRepository.getDinnerByDate(chatId, new Date());

        if (data) {
          const dinner: Dinner = {
            id: data.id,
            chatId: chatId,
            messageIds: DinnersRepository.addMessageId(
              data.messageIds,
              messageId + 1
            ),
            date: new Date(data.date),
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
        const messageId: number | undefined =
          ctx.message?.message_id ?? ctx.callbackQuery?.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[startDinner] name or messageId is undefined`);

        const data: Dinner | undefined =
          await DinnersRepository.getDinnerByDate(chatId, new Date());

        if (!data) {
          const result: Dinner | undefined =
            await DinnersRepository.insertDinner(
              chatId,
              [messageId + 1],
              new Date(),
              [name],
              []
            );
          if (!result) {
            this.replyError(ctx);
            return;
          }

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
          date: new Date(data.date),
          yes: data.yes,
          no: data.no,
        };

        const result: Dinner | undefined = await DinnersRepository.updateDinner(
          dinner
        );
        if (!result) {
          this.replyError(ctx);
          return;
        }

        this.replyDinnerDetails(ctx, result);
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async startDinnerScheduled(
    chatId: number
  ): Promise<string | undefined> {
    const chatExists: boolean = await ChatsService.checkChatExists(
      undefined,
      chatId
    );
    if (!chatExists)
      console.error("[startDinnerScheduled] Chat does not exist");

    const data: Dinner | undefined = await DinnersRepository.getDinnerByDate(
      chatId,
      new Date()
    );

    if (!data) {
      const result: Dinner | undefined = await DinnersRepository.insertDinner(
        chatId,
        [],
        new Date(),
        [],
        []
      );

      if (!result) return;

      return this.parseDinnerDetails(result);
    }
  }

  public static async joinDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const name: string | undefined = ctx.from?.first_name;
        const chatId: number = ctx.chat.id;
        const messageId: number | undefined =
          ctx.message?.message_id ?? ctx.callbackQuery?.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[joinDinner] name or messageId is undefined`);

        const existingDinner: Dinner | undefined =
          await DinnersRepository.getDinnerByDate(chatId, new Date());
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
            date: new Date(existingDinner.date),
            messageIds: DinnersRepository.addMessageId(
              existingDinner.messageIds,
              messageId
            ),
            yes: yes,
            no: no,
          };

          if (Util.deepEqual(existingDinner, dinner)) {
            // Return if no change
            return;
          }

          const result: Dinner | undefined =
            await DinnersRepository.updateDinner(dinner);

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
          ctx.message?.message_id ?? ctx.callbackQuery?.message?.message_id;

        if (name === undefined || messageId === undefined)
          throw new Error(`[leaveDinner] name or messageId is undefined`);

        const existingDinner: Dinner | undefined =
          await DinnersRepository.getDinnerByDate(chatId, new Date());
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
            date: new Date(existingDinner.date),
            messageIds: DinnersRepository.addMessageId(
              existingDinner.messageIds,
              messageId
            ),
            yes: yes,
            no: no,
          };

          if (Util.deepEqual(existingDinner, dinner)) {
            // Return if no change
            return;
          }

          const result: Dinner | undefined =
            await DinnersRepository.updateDinner(dinner);

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
