import db from "./db.repository.ts";

export default class DinnerRepository {
  public static async getDinnerByDate(date: Date) {
    const ISODate = date.toISOString().split("T")[0];

    const query = await db.from("dinner").select().eq("date", ISODate);
    if (query.error) throw query.error;

    if (query.data?.length) {
      console.log(`[getDinnerByDate] ${JSON.stringify(query.data)}`);
      return query.data;
    } else {
      console.log(
        `[getDinnerByDate] dinner does not exist for date: ${ISODate}`
      );
      return null;
    }
  }

  public static async insertDinner(date: Date, name: string) {
    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (!data) {
      const result = await db
        .from("dinner")
        .insert({ date: date, attendees: [name] })
        .select();
      if (result.error) throw result.error;

      console.log(`[insertDinner] new dinner created`);
      return result.data;
    } else {
      console.log(`[insertDinner] dinner already exists`);
      return data;
    }
  }

  public static async updateDinner(date: Date, attendees: Array<string>) {
    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (data) {
      const dinnerId = data[0].id;

      const result = await db
        .from("dinner")
        .update({ attendees: attendees })
        .eq("id", dinnerId)
        .select();
      if (result.error) throw result.error;

      console.log(
        `[updateDinner] dinner updated for date: ${
          date.toISOString().split("T")[0]
        }`
      );
      return result.data;
    } else {
      console.log(
        `[updateDinner] dinner does not exist for date: ${
          date.toISOString().split("T")[0]
        }`
      );
      return null;
    }
  }

  public static async deleteDinner(date: Date) {
    const ISODate = date.toISOString().split("T")[0];

    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (data) {
      const result = await db.from("dinner").delete().eq("date", ISODate);
      if (result.error) throw result.error;

      console.log(`[deleteDinner] dinner deleted for date: ${ISODate}`);
    }
  }
}
