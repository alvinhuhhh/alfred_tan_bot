import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import DinnersService from "../service/dinners.service.ts";

type RequestBody = {
  chatId: number;
  chatType: string;
};

export default class CronService {
  public static async handleCronTrigger(
    bot: Bot<MyContext>,
    json: string
  ): Promise<boolean> {
    try {
      const body: RequestBody = await JSON.parse(json);

      const message: string | undefined =
        await DinnersService.startDinnerScheduled(body.chatId, body.chatType);

      if (!message) {
        return false;
      }

      bot.api.sendMessage(body.chatId, message, {
        parse_mode: "HTML",
        reply_markup: DinnersService.joinLeaveDinnerButton,
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}
