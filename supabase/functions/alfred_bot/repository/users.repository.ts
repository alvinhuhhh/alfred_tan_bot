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
    // check if user already exists
    const { data } = await db.from("users").select("name").eq("name", name);

    if (!data) {
      const { error } = await db.from("users").insert({ name: name });
      if (error) throw error;
    }
  }

  public static async updateUser(id: number, newName: string) {
    // check if user exists
    const { data } = await db.from("users").select().eq("id", id);

    if (data) {
      const { error } = await db
        .from("users")
        .update({ name: newName })
        .eq("id", id);
      if (error) throw error;
    }
  }

  public static async deleteUser(id: number) {
    // check if user exists
    const { data } = await db.from("users").select().eq("id", id);

    if (data) {
      const { error } = await db.from("users").delete().eq("id", id);
      if (error) throw error;
    }
  }
}
