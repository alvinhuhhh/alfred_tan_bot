import { Bot } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { createConversation } from "https://deno.land/x/grammy_conversations@v1.1.1/mod.ts";
import { InlineKeyboard } from "https://lib.deno.dev/x/grammy@v1/mod.ts";
import ChatsRepository from "../repository/chats.repository.ts";
import SecretsRepository from "../repository/secrets.repository.ts";
import Config from "../config.ts";

export default class SecretsService {
  bot: Bot<MyContext>;
  chatsRepository: ChatsRepository;
  secretsRepository: SecretsRepository;

  constructor(
    bot: Bot<MyContext>,
    chatsRepository: ChatsRepository,
    secretsRepository: SecretsRepository
  ) {
    this.bot = bot;
    this.chatsRepository = chatsRepository;
    this.secretsRepository = secretsRepository;
  }

  public setWIFIPasswordButton: InlineKeyboard = new InlineKeyboard().text(
    "Set WIFI Password",
    "set-wifi-password-callback"
  );

  public setVoucherLinkButton: InlineKeyboard = new InlineKeyboard().text(
    "Set CDC Voucher link",
    "set-voucher-link-callback"
  );

  private replyWIFIPassword(ctx: MyContext, data: any): void {
    const text = `${data.value}`;
    ctx.reply(text);
    return;
  }

  private replyWIFIPasswordNotFound(ctx: MyContext): void {
    const text = `I don't know the WIFI password! Tell me?`;
    ctx.reply(text, { reply_markup: this.setWIFIPasswordButton });
    return;
  }

  private replyVoucherLink(ctx: MyContext, data: any): void {
    const text = `Here's the link for CDC Vouchers:\n${data.value}`;
    ctx.reply(text);
    return;
  }

  private replyVoucherLinkNotFound(ctx: MyContext): void {
    const text = `I don't know the link! Tell me?`;
    ctx.reply(text, { reply_markup: this.setVoucherLinkButton });
    return;
  }

  public async getWIFIPassword(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const data = await this.secretsRepository.getSecretByKey(
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

  public async setWIFIPassword(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await ctx.reply("Okay, what is the WIFI password?", {
        reply_markup: { force_reply: true },
      });
      const userMsg = await conversation.waitFor(":text");

      if (userMsg.update.message?.text) {
        // update secret if key exists
        const data = await this.secretsRepository.updateSecret(
          ctx.chat.id,
          Config.WIFI_PASSWORD_KEY,
          userMsg.update.message.text
        );

        if (!data) {
          // add new secret if key does not exist
          await this.secretsRepository.insertSecret(
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

  public async removeWIFIPassword(ctx: MyContext) {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await this.secretsRepository.deleteSecret(
        ctx.chat.id,
        Config.WIFI_PASSWORD_KEY
      );

      ctx.reply("I forgot the WIFI password!");
    }
  }

  public async getVoucherLink(ctx: MyContext): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      const data = await this.secretsRepository.getSecretByKey(
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

  public async setVoucherLink(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await ctx.reply("Okay, what is the link for CDC Vouchers?", {
        reply_markup: { force_reply: true },
      });
      const userMsg = await conversation.waitFor(":text");

      if (userMsg.update.message?.text) {
        // update secret if key exists
        const data = await this.secretsRepository.updateSecret(
          ctx.chat.id,
          Config.VOUCHER_LINK_KEY,
          userMsg.update.message.text
        );

        if (!data) {
          // add new secret if key does not exist
          await this.secretsRepository.insertSecret(
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

  public async removeVoucherLink(ctx: MyContext) {
    if (ctx.chat?.id) {
      await this.chatsRepository.insertChat(ctx.chat.id, ctx.chat.type);

      await this.secretsRepository.deleteSecret(
        ctx.chat.id,
        Config.VOUCHER_LINK_KEY
      );

      ctx.reply("I forgot the link for CDC Vouchers!");
    }
  }

  public registerBotCommands() {
    // Register conversations
    this.bot.use(createConversation(this.setWIFIPassword, "setWIFIPassword"));
    this.bot.use(createConversation(this.setVoucherLink, "setVoucherLink"));

    // Handle the /getwifipassword command
    this.bot.command("getwifipassword", async (ctx) => {
      console.debug(ctx);
      await this.getWIFIPassword(ctx);
    });
    this.bot.callbackQuery("get-wifi-password-callback", async (ctx) => {
      console.debug(ctx);
      await this.getWIFIPassword(ctx);
    });

    // Handle the /setwifipassword command
    this.bot.command("setwifipassword", async (ctx) => {
      console.debug(ctx);
      await ctx.conversation.enter("setWIFIPassword");
    });
    this.bot.callbackQuery("set-wifi-password-callback", async (ctx) => {
      console.debug(ctx);
      await ctx.conversation.enter("setWIFIPassword");
    });

    // Handle the /removewifipassword command
    this.bot.command("removewifipassword", async (ctx) => {
      console.debug(ctx);
      await this.removeWIFIPassword(ctx);
    });

    // Handle the /getcdcvouchers command
    this.bot.command("getcdcvouchers", async (ctx) => {
      console.debug(ctx);
      await this.getVoucherLink(ctx);
    });
    this.bot.callbackQuery("get-voucher-link-callback", async (ctx) => {
      console.debug(ctx);
      await this.getVoucherLink(ctx);
    });

    // Handle the /setcdcvoucherlink command
    this.bot.command("setcdcvoucherlink", async (ctx) => {
      console.debug(ctx);
      await ctx.conversation.enter("setVoucherLink");
    });
    this.bot.callbackQuery("set-voucher-link-callback", async (ctx) => {
      console.debug(ctx);
      await ctx.conversation.enter("setVoucherLink");
    });

    // Handle the /removecdcvoucherlink command
    this.bot.command("removecdcvoucherlink", async (ctx) => {
      console.debug(ctx);
      await this.removeVoucherLink(ctx);
    });
  }
}
