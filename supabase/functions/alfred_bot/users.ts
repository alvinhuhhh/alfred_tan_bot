import db from "./db.ts";

export default class Users {
  public static async getUsers() {
    const { data, error } = await db.from("User").select();
    if (error) throw error;

    return data;
  }
}
