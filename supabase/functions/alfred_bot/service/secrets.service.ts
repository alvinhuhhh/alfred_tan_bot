import SecretsRepository from "../repository/secrets.repository.ts";

export default class SecretsService {
  private static replyWIFIPassword(ctx: MyContext, data: any) {
    const text = `Here's the WIFI password: ${data.value}`;
    ctx.reply(text);
    return;
  }

  private static replyWIFIPasswordNotFound(ctx: MyContext) {
    const text = `I don't know the WIFI password! Tell me?`;
    ctx.reply(text);
    return;
  }

  public static async getWIFIPassword(ctx: MyContext): Promise<void> {
    const data = await SecretsRepository.getSecretByKey("wifi_password");

    if (data) {
      this.replyWIFIPassword(ctx, data);
    } else {
      this.replyWIFIPasswordNotFound(ctx);
    }
  }
}
