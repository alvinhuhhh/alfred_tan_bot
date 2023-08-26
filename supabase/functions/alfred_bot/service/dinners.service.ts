import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";
import DinnersRepository from "../repository/dinners.repository.ts";

export default class DinnersService {
  static startDinnerButton = new InlineKeyboard().text(
    "Start Dinner",
    "start-dinner-callback"
  );

  static joinLeaveDinnerButton = new InlineKeyboard()
    .text("Leave Dinner", "leave-dinner-callback")
    .text("Join Dinner", "join-dinner-callback");

  private static replyDinnerDetails(ctx: MyContext, data: any) {
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

    ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: this.joinLeaveDinnerButton,
    });
    return;
  }

  private static replyDinnerNotFound(ctx: MyContext) {
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

  public static async joinDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";

      const existingDinner = await DinnersRepository.getDinnerByDate(
        ctx.chat.id,
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

        this.replyDinnerDetails(ctx, result);
      } else {
        this.replyDinnerNotFound(ctx);
      }
    }
  }

  public static async leaveDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";

      const existingDinner = await DinnersRepository.getDinnerByDate(
        ctx.chat.id,
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

        this.replyDinnerDetails(ctx, result);
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
