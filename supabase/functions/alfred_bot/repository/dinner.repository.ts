import db from "./db.repository.ts";

export default class DinnerRepository {
  static DINNER_TABLE = "dinner";

  public static async getDinnerByDate(date: Date) {
    const ISODate: string = date.toISOString().split("T")[0];

    const query = await db.from(this.DINNER_TABLE).select().eq("date", ISODate);
    if (query.error) throw query.error;

    if (query.data?.length) {
      const queryData = query.data[0];
      console.log(`[getDinnerByDate] ${JSON.stringify(queryData)}`);
      return queryData;
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
        .from(this.DINNER_TABLE)
        .insert({ date: date, attendees: [name] })
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[insertDinner] new dinner created`);
      return queryData;
    } else {
      console.log(`[insertDinner] dinner already exists`);
      return data;
    }
  }

  public static async updateDinner(date: Date, attendees: Array<string>) {
    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (data) {
      const dinnerId: number = data.id;

      const result = await db
        .from(this.DINNER_TABLE)
        .update({ attendees: attendees })
        .eq("id", dinnerId)
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(
        `[updateDinner] dinner updated for date: ${
          date.toISOString().split("T")[0]
        }`
      );
      return queryData;
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
    const ISODate: string = date.toISOString().split("T")[0];

    // check if dinner already exists
    const data = await this.getDinnerByDate(date);

    if (data) {
      const result = await db
        .from(this.DINNER_TABLE)
        .delete()
        .eq("date", ISODate);
      if (result.error) throw result.error;

      console.log(`[deleteDinner] dinner deleted for date: ${ISODate}`);
    }
  }
}
