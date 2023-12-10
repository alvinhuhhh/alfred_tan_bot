import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";
import DinnersRepository from "../repository/dinners.repository.ts";

export default class DinnersService {
  bot: Bot<MyContext>;
  chatsRepository: ChatsRepository;
  dinnersRepository: DinnersRepository;

  constructor(
    bot: Bot<MyContext>,
    chatsRepository: ChatsRepository,
    dinnersRepository: DinnersRepository
  ) {
    this.bot = bot;
    this.chatsRepository = chatsRepository;
    this.dinnersRepository = dinnersRepository;
  }

  public startDinnerButton: InlineKeyboard = new InlineKeyboard().text(
    "Start Dinner",
    "start-dinner-callback"
  );

  public joinLeaveDinnerButton: InlineKeyboard = new InlineKeyboard()
    .text("Leave Dinner", "leave-dinner-callback")
    .text("Join Dinner", "join-dinner-callback");

  public parseDinnerDetails(data: any): string {
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

  private replyDinnerDetails(ctx: MyContext, data: any): void {
    ctx.reply(this.parseDinnerDetails(data), {
      parse_mode: "HTML",
      reply_markup: this.joinLeaveDinnerButton,
    });
    return;
  }

  private replyDinnerNotFound(ctx: MyContext): void {
    ctx.reply("Dinner not started for tonight. Start one now?", {
      reply_markup: this.startDinnerButton,
    });
    return;
  }

  public async getDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const data = await this.dinnersRepository.getDinnerByDate(
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

  public async startDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";

      const data = await this.dinnersRepository.insertDinner(
        ctx.chat.id,
        new Date(),
        name
      );

      this.replyDinnerDetails(ctx, data);
    }
  }

  public async startDinnerScheduled(
    chatId: number,
    chatType: string
  ): Promise<string> {
    await this.chatsRepository.insertChat(chatId, chatType);

    const data = await this.dinnersRepository.insertDinner(chatId, new Date());

    return this.parseDinnerDetails(data);
  }

  public async joinDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";

      const existingDinner = await this.dinnersRepository.getDinnerByDate(
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

        const result = await this.dinnersRepository.updateDinner(
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

  public async leaveDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const name: string = ctx.from?.first_name ?? "";

      const existingDinner = await this.dinnersRepository.getDinnerByDate(
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

        const result = await this.dinnersRepository.updateDinner(
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

  public async endDinner(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await this.dinnersRepository.deleteDinner(ctx.chat.id, new Date());

      ctx.reply("No more dinner for tonight!");
    }
  }

  public registerBotCommands(): void {
    // Handle the /getdinner command
    this.bot.command("getdinner", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.getDinner(ctx);
    });
    this.bot.callbackQuery("get-dinner-callback", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.getDinner(ctx);
    });

    // Handle the /startdinner command
    this.bot.command("startdinner", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.startDinner(ctx);
    });
    this.bot.callbackQuery("start-dinner-callback", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.startDinner(ctx);
    });

    // Handle the /joindinner command
    this.bot.command("joindinner", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.joinDinner(ctx);
    });
    this.bot.callbackQuery("join-dinner-callback", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.joinDinner(ctx);
    });

    // Handle the /leavedinner command
    this.bot.command("leavedinner", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.leaveDinner(ctx);
    });
    this.bot.callbackQuery("leave-dinner-callback", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.leaveDinner(ctx);
    });

    // Handle the /enddinner command
    this.bot.command("enddinner", async (ctx: MyContext) => {
      console.debug(ctx);
      await this.endDinner(ctx);
    });
  }
}
