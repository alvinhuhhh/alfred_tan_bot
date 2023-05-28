import db from "./db.repository.ts";
import Config from "../config.ts";

export default class SecretsRepository {
  public static async getSecretByKey(key: string) {
    const query = await db
      .from(Config.SECRETS_TABLENAME)
      .select()
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

  public static async insertSecret(key: string, value: string) {
    // check if key already exists
    const data = await this.getSecretByKey(key);

    if (!data) {
      const result = await db
        .from(Config.SECRETS_TABLENAME)
        .insert({ key: key, value: value })
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

  public static async updateSecret(key: string, newValue: string) {
    // check if secret already exists
    const data = await this.getSecretByKey(key);

    if (data) {
      const result = await db
        .from(Config.SECRETS_TABLENAME)
        .update({ value: newValue })
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

  public static async deleteSecret(key: string) {
    // check if secret already exists
    const data = await this.getSecretByKey(key);

    if (data) {
      const result = await db
        .from(Config.SECRETS_TABLENAME)
        .delete()
        .eq("key", key);
      if (result.error) throw result.error;

      console.log(`[deleteSecret] secret deleted for key: ${key}`);
    }
  }
}
