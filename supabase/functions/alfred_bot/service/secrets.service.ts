import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";
import SecretsRepository from "../repository/secrets.repository.ts";
import Config from "../config.ts";

export default class SecretsService {
  static setWIFIPasswordButton = new InlineKeyboard().text(
    "Set WIFI Password",
    "set-wifi-password-callback"
  );

  static setVoucherLinkButton = new InlineKeyboard().text(
    "Set CDC Voucher link",
    "set-voucher-link-callback"
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

  private static replyVoucherLink(ctx: MyContext, data: any) {
    const text = `Here's the link for CDC Vouchers: 
${data.value}`;
    ctx.reply(text);
    return;
  }

  private static replyVoucherLinkNotFound(ctx: MyContext) {
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

  public static async setWIFIPassword(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await ctx.reply("Okay, what is the WIFI password?", {
        reply_markup: { force_reply: true },
      });
      const userMsg = await conversation.waitFor(":text");

      if (userMsg.update.message?.text) {
        // update secret if key exists
        const data = await SecretsRepository.updateSecret(
          ctx.chat.id,
          Config.WIFI_PASSWORD_KEY,
          userMsg.update.message.text
        );

        if (!data) {
          // add new secret if key does not exist
          await SecretsRepository.insertSecret(
            ctx.chat.id,
            Config.WIFI_PASSWORD_KEY,
            userMsg.update.message.text
          );
        }

        ctx.reply("I'll remember it!");
        return;
      }
    }
  }

  public static async removeWIFIPassword(ctx: MyContext) {
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

  public static async setVoucherLink(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    if (ctx.chat?.id) {
      await ChatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await ctx.reply("Okay, what is the link for CDC Vouchers?", {
        reply_markup: { force_reply: true },
      });
      const userMsg = await conversation.waitFor(":text");

      if (userMsg.update.message?.text) {
        // update secret if key exists
        const data = await SecretsRepository.updateSecret(
          ctx.chat.id,
          Config.VOUCHER_LINK_KEY,
          userMsg.update.message.text
        );

        if (!data) {
          // add new secret if key does not exist
          await SecretsRepository.insertSecret(
            ctx.chat.id,
            Config.VOUCHER_LINK_KEY,
            userMsg.update.message.text
          );
        }

        ctx.reply("I'll remember it!");
        return;
      }
    }
  }

  public static async removeVoucherLink(ctx: MyContext) {
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
