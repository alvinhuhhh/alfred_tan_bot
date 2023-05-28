import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import SecretsRepository from "../repository/secrets.repository.ts";

export default class SecretsService {
  static WIFI_PASSWORD_KEY = "wifi_password";

  static setWIFIPasswordButton = new InlineKeyboard().text(
    "Set WIFI Password",
    "set-wifi-password-callback"
  );

  private static replyWIFIPassword(ctx: MyContext, data: any) {
    const text = `Here's the WIFI password: ${data.value}`;
    ctx.reply(text);
    return;
  }

  private static replyWIFIPasswordNotFound(ctx: MyContext) {
    const text = `I don't know the WIFI password! Tell me?`;
    ctx.reply(text, { reply_markup: this.setWIFIPasswordButton });
    return;
  }

  public static async getWIFIPassword(ctx: MyContext): Promise<void> {
    const data = await SecretsRepository.getSecretByKey(this.WIFI_PASSWORD_KEY);

    if (data) {
      this.replyWIFIPassword(ctx, data);
    } else {
      this.replyWIFIPasswordNotFound(ctx);
    }
  }

  public static async setWIFIPassword(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    await ctx.reply("What is the WIFI password?");
    const userMsg = await conversation.waitFor(":text");

    if (userMsg.update.message?.text) {
      // update secret if key exists
      let data = await SecretsRepository.updateSecret(
        this.WIFI_PASSWORD_KEY,
        userMsg.update.message.text
      );

      if (!data) {
        // add new secret if key does not exist
        data = await SecretsRepository.insertSecret(
          this.WIFI_PASSWORD_KEY,
          userMsg.update.message.text
        );
      }

      this.replyWIFIPassword(ctx, data);
      return;
    }
  }

  public static async removeWIFIPassword(ctx: MyContext) {
    await SecretsRepository.deleteSecret(this.WIFI_PASSWORD_KEY);

    ctx.reply("I forgot the WIFI password!");
  }
}
