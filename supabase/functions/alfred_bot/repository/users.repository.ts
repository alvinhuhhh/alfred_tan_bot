import db from "./db.repository.ts";

export default class UsersRepository {
  public static async getUsers() {
    const { data, error } = await db.from("users").select();
    if (error) throw error;

    return data;
  }

  public static async getUserByName(name: string) {
    const { data, error } = await db
      .from("users")
      .select("id")
      .eq("name", name);
    if (error) throw error;

    return data;
  }

  public static async insertUser(name: string) {
    const { error } = await db.from("users").insert({ name: name }).select();
    if (error) throw error;
  }

  public static async updateUser(id: number, name: string) {
    const { error } = await db
      .from("users")
      .update({ name: name })
      .eq("id", id);
    if (error) throw error;
  }

  public static async deleteUser(id: number) {
    const { error } = await db.from("users").delete().eq("id", id);
    if (error) throw error;
  }
}
