import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import DinnersService from "../service/dinners.service.ts";

type RequestBody = {
  chatId: number;
  chatType: string;
};

export default class CronService {
  bot: Bot<MyContext>;
  dinnersService: DinnersService;

  constructor(bot: Bot<MyContext>, dinnersService: DinnersService) {
    this.bot = bot;
    this.dinnersService = dinnersService;
  }

  public async handleCronTrigger(req: Request): Promise<Response> {
    if (!req.body) {
      return new Response("Empty request body", { status: 400 });
    }

    const body: RequestBody = await req.json();
    const message: string | undefined =
      await this.dinnersService.startDinnerScheduled(
        body.chatId,
        body.chatType
      );

    if (!message) {
      return new Response("Unable to trigger start dinner", { status: 500 });
    }

    this.bot.api.sendMessage(body.chatId, message, {
      parse_mode: "HTML",
      reply_markup: this.dinnersService.joinLeaveDinnerButton,
    });

    return new Response("Start dinner triggered", { status: 201 });
  }
}
