import db from "./db.ts";

export default class Users {
  public static async getUsers() {
    const { data, error } = await db.from("User").select();
    if (error) throw error;

    return data;
  }

  public static async insertUser(name: string) {
    const { error } = await db.from("User").insert({ name: name }).select();
    if (error) throw error;
  }

  public static async updateUser(id: number, name: string) {
    const { error } = await db.from("User").update({ name: name }).eq("id", id);
    if (error) throw error;
  }

  public static async deleteUser(id: number) {
    const { error } = await db.from("User").delete().eq("id", id);
    if (error) throw error;
  }
}
