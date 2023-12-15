import db from "./db.repository.ts";
import Config from "../config.ts";

export default class SecretsRepository {
  public static async getSecretByKey(
    chatId: number,
    key: string
  ): Promise<Secret> {
    const query = await db
      .from(Config.SECRET_TABLENAME)
      .select()
      .eq("chatId", chatId)
      .eq("key", key);
    if (query.error) throw query.error;

    if (!query.data)
      throw new Error(`[getSecretByKey] no secret found for key: ${key}`);

    const queryData: Secret = query.data[0] as Secret;
    return queryData;
  }

  public static async insertSecret(
    chatId: number,
    key: string,
    value: string
  ): Promise<Secret> {
    // check if key already exists
    const data: Secret | undefined = await this.getSecretByKey(chatId, key);

    if (data) throw new Error(`[insertSecret] secret key already exists`);

    const result = await db
      .from(Config.SECRET_TABLENAME)
      .insert({
        chatId: chatId,
        key: key,
        value: value,
      })
      .select();
    if (result.error) throw result.error;

    const queryData: Secret = result.data[0] as Secret;
    return queryData;
  }

  public static async updateSecret(
    secret: Secret
  ): Promise<Secret | undefined> {
    // check if secret already exists
    const data: Secret | undefined = await this.getSecretByKey(
      secret.chatId,
      secret.key
    );

    if (!data)
      throw new Error(
        `[updateSecret] secret does not exist for key: ${secret.key}`
      );

    const result = await db
      .from(Config.SECRET_TABLENAME)
      .update(secret)
      .eq("id", data.id)
      .select();
    if (result.error) throw result.error;

    const queryData: Secret = result.data[0] as Secret;
    console.log(`[updateSecret] secret updated for key: ${secret.key}`);

    return queryData;
  }

  public static async deleteSecret(
    chatId: number,
    key: string
  ): Promise<boolean> {
    // check if secret already exists
    const data: Secret | undefined = await this.getSecretByKey(chatId, key);

    if (data) {
      const secretId = data.id;

      const result = await db
        .from(Config.SECRET_TABLENAME)
        .delete()
        .eq("id", secretId);
      if (result.error) throw result.error;

      return true;
    }

    return false;
  }
}
