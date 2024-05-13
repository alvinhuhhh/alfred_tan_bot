import { Bot, Context } from "https://deno.land/x/grammy@v1.23.0/mod.ts";
import DinnersService from "../service/dinners.service.ts";

type RequestBody = {
  chatId: number;
};

export default class CronService {
  public static async handleCronTrigger(
    bot: Bot<Context>,
    json: string
  ): Promise<boolean> {
    try {
      const body: RequestBody = await JSON.parse(json);

      const message: string | undefined =
        await DinnersService.startDinnerScheduled(body.chatId);

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
