import db from "./db.repository.ts";

export default class DinnerRepository {
  public static async getDinnerByDate(date: string) {
    const { data, error } = await db.from("dinner").select().eq("date", date);
    if (error) throw error;

    return data;
  }

  public static async insertDinner(date: string, name: string) {
    // check if dinner already exists
    const { data } = await db.from("dinner").select().eq("date", date);

    if (!data) {
      const { data, error } = await db
        .from("dinner")
        .insert({ date: date, attendees: [name] })
        .select();
      if (error) throw error;

      return data;
    }
  }

  public static async updateDinner(date: string, name: string) {}
}
