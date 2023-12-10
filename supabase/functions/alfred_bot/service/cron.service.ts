import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import DinnersService from "../service/dinners.service.ts";
import { BodyJson } from "https://deno.land/x/oak@v12.6.0/mod.ts";

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

  public async handleCronTrigger(json: BodyJson): Promise<Response> {
    const body: RequestBody = await json.value;

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
