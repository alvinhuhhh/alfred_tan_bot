import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { BodyJson } from "https://deno.land/x/oak@v12.6.0/mod.ts";
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

  public async handleCronTrigger(json: string): Promise<boolean> {
    try {
      const body: RequestBody = await JSON.parse(json);

      const message: string | undefined =
        await this.dinnersService.startDinnerScheduled(
          body.chatId,
          body.chatType
        );

      if (!message) {
        return false;
      }

      this.bot.api.sendMessage(body.chatId, message, {
        parse_mode: "HTML",
        reply_markup: this.dinnersService.joinLeaveDinnerButton,
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
