import db from "./db.repository.ts";
import Config from "../config.ts";

export default class DinnersRepository {
  public static async getDinnerByDate(
    chatId: number,
    date: Date
  ): Promise<Dinner | undefined> {
    const ISODate: string = date.toISOString().split("T")[0];

    const query = await db
      .from(Config.DINNER_TABLENAME)
      .select()
      .eq("chatId", chatId)
      .eq("date", ISODate);
    if (query.error) throw query.error;

    if (!query.data) {
      console.log(
        `[getDinnerByDate] dinner does not exist for date: ${ISODate}`
      );
      return undefined;
    }

    const queryData: Dinner = query.data[0] as Dinner;
    console.log(`[getDinnerByDate] ${JSON.stringify(queryData)}`);

    return queryData;
  }

  public static async insertDinner(
    chatId: number,
    date: Date,
    name?: string,
    messageId?: number
  ): Promise<Dinner | undefined> {
    // check if dinner already exists
    const data: Dinner | undefined = await this.getDinnerByDate(chatId, date);

    if (data) {
      console.log(`[insertDinner] dinner already exists`);
      return data;
    }

    const result = await db
      .from(Config.DINNER_TABLENAME)
      .insert({
        date: date,
        yes: name ? [name] : [],
        no: [],
        chatId: chatId,
        messageIds: messageId ? [messageId] : [],
      })
      .select();
    if (result.error) throw result.error;

    const queryData: Dinner = result.data[0] as Dinner;
    console.log(`[insertDinner] new dinner created`);

    return queryData;
  }

  public static async updateDinner(
    chatId: number,
    messageId: number,
    date: Date,
    yes: Array<string>,
    no: Array<string>
  ): Promise<Dinner | undefined> {
    // check if dinner already exists
    const data: Dinner | undefined = await this.getDinnerByDate(chatId, date);

    if (!data) {
      console.error(
        `[updateDinner] dinner does not exist for date: ${
          date.toISOString().split("T")[0]
        }`
      );
      return undefined;
    }

    const dinnerId: number = data.id;
    const messageIdList: Set<number> = new Set(data.messageIds);
    messageIdList.add(messageId);

    const result = await db
      .from(Config.DINNER_TABLENAME)
      .update({ yes: yes, no: no, messageIds: messageIdList })
      .eq("id", dinnerId)
      .select();
    if (result.error) throw result.error;

    const queryData: Dinner = result.data[0] as Dinner;
    console.log(
      `[updateDinner] dinner updated for date: ${
        date.toISOString().split("T")[0]
      }`
    );

    return queryData;
  }

  public static async deleteDinner(
    chatId: number,
    date: Date
  ): Promise<boolean> {
    const ISODate: string = date.toISOString().split("T")[0];

    // check if dinner already exists
    const data = await this.getDinnerByDate(chatId, date);

    if (data) {
      const dinnerId: number = data.id;

      const result = await db
        .from(Config.DINNER_TABLENAME)
        .delete()
        .eq("id", dinnerId);
      if (result.error) throw result.error;

      console.log(`[deleteDinner] dinner deleted for date: ${ISODate}`);
      return true;
    }

    return false;
  }
}
