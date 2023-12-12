import db from "./db.repository.ts";
import Config from "../config.ts";

export default class SecretsRepository {
  public static async getSecretByKey(
    chatId: number,
    key: string
  ): Promise<Secret | undefined> {
    const query = await db
      .from(Config.SECRET_TABLENAME)
      .select()
      .eq("chatId", chatId)
      .eq("key", key);
    if (query.error) throw query.error;

    if (!query.data) {
      console.log(`[getSecretByKey] no secret found for key: ${key}`);
      return undefined;
    }

    const queryData: Secret = query.data[0] as Secret;
    console.log(`[getSecretByKey] ${JSON.stringify(queryData)}`);
    return queryData;
  }

  public static async insertSecret(
    chatId: number,
    key: string,
    value: string
  ): Promise<Secret | undefined> {
    // check if key already exists
    const data: Secret | undefined = await this.getSecretByKey(chatId, key);

    if (data) {
      console.log(`[insertSecret] secret key already exists`);
      return data;
    }

    const result = await db
      .from(Config.SECRET_TABLENAME)
      .insert({ chatId: chatId, key: key, value: value })
      .select();
    if (result.error) throw result.error;

    const queryData: Secret = result.data[0] as Secret;
    console.log(`[insertSecret] new secret created`);

    return queryData;
  }

  public static async updateSecret(
    chatId: number,
    key: string,
    newValue: string
  ): Promise<Secret | undefined> {
    // check if secret already exists
    const data: Secret | undefined = await this.getSecretByKey(chatId, key);

    if (!data) {
      console.error(`[updateSecret] secret does not exist for key: ${key}`);
      return undefined;
    }

    const secretId = data.id;

    const result = await db
      .from(Config.SECRET_TABLENAME)
      .update({ value: newValue })
      .eq("id", secretId)
      .select();
    if (result.error) throw result.error;

    const queryData: Secret = result.data[0] as Secret;
    console.log(`[updateSecret] secret updated for key: ${key}`);

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

      console.log(`[deleteSecret] secret deleted for key: ${key}`);
      return true;
    }

    return false;
  }
}
