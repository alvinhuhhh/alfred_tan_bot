import db from "./db.repository.ts";
import Config from "../config.ts";

export default class UsersRepository {
  public static async getAllUsers() {
    const query = await db.from(Config.USERS_TABLENAME).select();
    if (query.error) throw query.error;

    console.log(`[getAllUsers] ${JSON.stringify(query.data)}`);
    return query.data;
  }

  public static async getUserByName(name: string) {
    const query = await db
      .from(Config.USERS_TABLENAME)
      .select("id")
      .eq("name", name);
    if (query.error) throw query.error;

    if (query.data?.length) {
      const queryData = query.data[0];
      console.log(`[getUserByName] ${queryData}`);
      return queryData;
    } else {
      console.log(`[getUserByName] user does not exist for name: ${name}`);
      return null;
    }
  }

  public static async insertUser(name: string) {
    // check if user already exists
    const data = await this.getUserByName(name);

    if (!data) {
      const result = await db
        .from(Config.USERS_TABLENAME)
        .insert({ name: name })
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(
        `[insertUser] new user created: ${JSON.stringify(queryData)}`
      );
      return queryData;
    } else {
      console.log(`[insertUser] user already exists for name: ${name}`);
      return data;
    }
  }

  public static async updateUser(name: string, newName: string) {
    // check if user exists
    const data = await this.getUserByName(name);

    if (data) {
      const result = await db
        .from(Config.USERS_TABLENAME)
        .update({ name: newName })
        .eq("name", name)
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[updateUser] user ${name} updated to ${newName}`);
      return queryData;
    } else {
      console.log(`[updateUser] user does not exist for name: ${name}`);
      return null;
    }
  }

  public static async deleteUser(id: number) {
    // check if user exists
    const data = await db.from(Config.USERS_TABLENAME).select().eq("id", id);

    if (data) {
      const result = await db
        .from(Config.USERS_TABLENAME)
        .delete()
        .eq("id", id);
      if (result.error) throw result.error;

      console.log(`[deleteUser] user deleted for id: ${id}`);
    }
  }
}
