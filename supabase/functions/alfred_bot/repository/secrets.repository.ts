import db from "./db.repository.ts";
import Config from "../config.ts";

export default class SecretsRepository {
  public static async getSecretByKey(chatId: number, key: string) {
    const query = await db
      .from(Config.SECRET_TABLENAME)
      .select()
      .eq("chatId", chatId)
      .eq("key", key);
    if (query.error) throw query.error;

    if (query.data?.length) {
      const queryData = query.data[0];
      console.log(`[getSecretByKey] ${JSON.stringify(queryData)}`);
      return queryData;
    } else {
      console.log(`[getSecretByKey] no secret found for key: ${key}`);
      return null;
    }
  }

  public static async insertSecret(chatId: number, key: string, value: string) {
    // check if key already exists
    const data = await this.getSecretByKey(chatId, key);

    if (!data) {
      const result = await db
        .from(Config.SECRET_TABLENAME)
        .insert({ chatId: chatId, key: key, value: value })
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[insertSecret] new secret created`);
      return queryData;
    } else {
      console.log(`[insertSecret] secret key already exists`);
      return data;
    }
  }

  public static async updateSecret(
    chatId: number,
    key: string,
    newValue: string
  ) {
    // check if secret already exists
    const data = await this.getSecretByKey(chatId, key);

    if (data) {
      const result = await db
        .from(Config.SECRET_TABLENAME)
        .update({ value: newValue })
        .eq("chatId", chatId)
        .eq("key", key)
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[updateSecret] secret updated for key: ${key}`);
      return queryData;
    } else {
      console.log(`[updateSecret] secret does not exist for key: ${key}`);
      return null;
    }
  }

  public static async deleteSecret(chatId: number, key: string) {
    // check if secret already exists
    const data = await this.getSecretByKey(chatId, key);

    if (data) {
      const result = await db
        .from(Config.SECRET_TABLENAME)
        .delete()
        .eq("chatId", chatId)
        .eq("key", key);
      if (result.error) throw result.error;

      console.log(`[deleteSecret] secret deleted for key: ${key}`);
    }
  }
}
