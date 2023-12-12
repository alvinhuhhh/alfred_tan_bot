import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";
import SecretsRepository from "../repository/secrets.repository.ts";
import Config from "../config.ts";

export default class SecretsService {
  public static setWIFIPasswordButton: InlineKeyboard =
    new InlineKeyboard().text(
      "Set WIFI Password",
      "set-wifi-password-callback"
    );

  public static setVoucherLinkButton: InlineKeyboard =
    new InlineKeyboard().text(
      "Set CDC Voucher link",
      "set-voucher-link-callback"
    );

  private static replyWIFIPassword(ctx: MyContext, data: any): void {
    const text = `${data.value}`;
    ctx.reply(text);
    return;
  }

  private static replyWIFIPasswordNotFound(ctx: MyContext): void {
    const text = `I don't know the WIFI password! Tell me?`;
    ctx.reply(text, { reply_markup: this.setWIFIPasswordButton });
    return;
  }

  private static replyVoucherLink(ctx: MyContext, data: any): void {
    const text = `Here's the link for CDC Vouchers:\n${data.value}`;
    ctx.reply(text);
    return;
  }

  private static replyVoucherLinkNotFound(ctx: MyContext): void {
    const text = `I don't know the link! Tell me?`;
    ctx.reply(text, { reply_markup: this.setVoucherLinkButton });
    return;
  }

  public static async getWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const data = await SecretsRepository.getSecretByKey(
        ctx.chat.id,
        Config.WIFI_PASSWORD_KEY
      );

      if (data) {
        this.replyWIFIPassword(ctx, data);
      } else {
        this.replyWIFIPasswordNotFound(ctx);
      }
    }
  }

  public static async setWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const input: string | undefined = ctx.match?.toString();

      if (input) {
        // update secret if key exists
        const data = await SecretsRepository.updateSecret(
          ctx.chat.id,
          Config.VOUCHER_LINK_KEY,
          input
        );

        if (!data) {
          // add new secret if key does not exist
          await SecretsRepository.insertSecret(
            ctx.chat.id,
            Config.VOUCHER_LINK_KEY,
            input
          );
        }
        ctx.reply("I'll remember it!");
        return;
      }

      ctx.reply("You didn't tell me anything!");
    }
  }

  public static async removeWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await SecretsRepository.deleteSecret(
        ctx.chat.id,
        Config.WIFI_PASSWORD_KEY
      );

      ctx.reply("I forgot the WIFI password!");
    }
  }

  public static async getVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const data = await SecretsRepository.getSecretByKey(
        ctx.chat.id,
        Config.VOUCHER_LINK_KEY
      );

      if (data) {
        this.replyVoucherLink(ctx, data);
      } else {
        this.replyVoucherLinkNotFound(ctx);
      }
    }
  }

  public static async setVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const input: string | undefined = ctx.match?.toString();

      if (input) {
        // update secret if key exists
        const data = await SecretsRepository.updateSecret(
          ctx.chat.id,
          Config.VOUCHER_LINK_KEY,
          input
        );

        if (!data) {
          // add new secret if key does not exist
          await SecretsRepository.insertSecret(
            ctx.chat.id,
            Config.VOUCHER_LINK_KEY,
            input
          );
        }
        ctx.reply("I'll remember it!");
        return;
      }

      ctx.reply("You didn't tell me anything!");
    }
  }

  public static async removeVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await SecretsRepository.deleteSecret(
        ctx.chat.id,
        Config.VOUCHER_LINK_KEY
      );

      ctx.reply("I forgot the link for CDC Vouchers!");
    }
  }
}
