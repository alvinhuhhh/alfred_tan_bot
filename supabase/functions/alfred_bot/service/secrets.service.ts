import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsService from "./chats.service.ts";
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
  }

  private static replyWIFIPasswordNotFound(ctx: MyContext): void {
    const text = `I don't know the WIFI password! Tell me?`;
    ctx.reply(text, { reply_markup: this.setWIFIPasswordButton });
  }

  private static replyVoucherLink(ctx: MyContext, data: any): void {
    const text = `Here's the link for CDC Vouchers:\n${data.value}`;
    ctx.reply(text);
  }

  private static replyVoucherLinkNotFound(ctx: MyContext): void {
    const text = `I don't know the link! Tell me?`;
    ctx.reply(text, { reply_markup: this.setVoucherLinkButton });
  }

  public static async getWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const data = await SecretsRepository.getSecretByKey(
          ctx.chat.id,
          Config.WIFI_PASSWORD_KEY
        );

        if (data) {
          this.replyWIFIPassword(ctx, data);
        } else {
          this.replyWIFIPasswordNotFound(ctx);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async setWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const chatId: number = ctx.chat.id;
        const input: string | undefined = ctx.match?.toString();
        if (!input) {
          ctx.reply("You didn't tell me anything!");
          return;
        }

        const existingSecret: Secret = await SecretsRepository.getSecretByKey(
          chatId,
          Config.WIFI_PASSWORD_KEY
        );

        if (!existingSecret) {
          await SecretsRepository.insertSecret(
            chatId,
            Config.WIFI_PASSWORD_KEY,
            input
          );

          ctx.reply("I'll remember it!");
          return;
        }

        const secret: Secret = {
          id: existingSecret.id,
          chatId: chatId,
          key: existingSecret.key,
          value: input,
        };
        await SecretsRepository.updateSecret(secret);

        ctx.reply("I'll remember it!");
        return;
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async removeWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        await SecretsRepository.deleteSecret(
          ctx.chat.id,
          Config.WIFI_PASSWORD_KEY
        );

        ctx.reply("I forgot the WIFI password!");
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async getVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const data = await SecretsRepository.getSecretByKey(
          ctx.chat.id,
          Config.VOUCHER_LINK_KEY
        );

        if (data) {
          this.replyVoucherLink(ctx, data);
        } else {
          this.replyVoucherLinkNotFound(ctx);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async setVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        const chatId: number = ctx.chat.id;
        const input: string | undefined = ctx.match?.toString();
        if (!input) {
          ctx.reply("You didn't tell me anything!");
          return;
        }

        const existingSecret: Secret = await SecretsRepository.getSecretByKey(
          chatId,
          Config.VOUCHER_LINK_KEY
        );

        if (!existingSecret) {
          await SecretsRepository.insertSecret(
            chatId,
            Config.VOUCHER_LINK_KEY,
            input
          );

          ctx.reply("I'll remember it!");
          return;
        }

        const secret: Secret = {
          id: existingSecret.id,
          chatId: chatId,
          key: existingSecret.key,
          value: input,
        };
        await SecretsRepository.updateSecret(secret);

        ctx.reply("I'll remember it!");
        return;
      } catch (err) {
        console.error(err);
      }
    }
  }

  public static async removeVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      try {
        const chatExists: boolean = await ChatsService.checkChatExists(ctx);
        if (!chatExists) ChatsService.replyChatNotStarted(ctx);

        await SecretsRepository.deleteSecret(
          ctx.chat.id,
          Config.VOUCHER_LINK_KEY
        );

        ctx.reply("I forgot the CDC Vouchers link!");
      } catch (err) {
        console.error(err);
      }
    }
  }
}
