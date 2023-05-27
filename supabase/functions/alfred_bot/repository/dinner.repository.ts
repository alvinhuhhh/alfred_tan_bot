import db from "./db.repository.ts";

export default class DinnerRepository {
  public static async getDinnerByDate(date: string) {
    const query = await db.from("dinner").select().eq("date", date);
    if (query.error) throw query.error;

    if (query.count) return query.data;
    return null;
  }

  public static async insertDinner(date: string, name: string) {
    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (!data) {
      const result = await db
        .from("dinner")
        .insert({ date: date, attendees: [name] })
        .select();
      if (result.error) throw result.error;

      return result.data;
    } else {
      return data;
    }
  }

  public static async updateDinner(date: string, name: string) {
    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (data) {
      const dinnerId = data[0].id;
      const existingAttendees = data[0].attendees;
      const newAttendees = existingAttendees;
      if (!existingAttendees.includes(name)) newAttendees.push(name);

      const result = await db
        .from("dinner")
        .update({ attendees: newAttendees })
        .eq("id", dinnerId)
        .select();
      if (result.error) throw result.error;

      return result.data;
    } else {
      return null;
    }
  }

  public static async deleteDinner(date: string) {
    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (data) {
      const result = await db.from("dinner").delete().eq("date", date);
      if (result.error) throw result.error;
    }
  }
}
