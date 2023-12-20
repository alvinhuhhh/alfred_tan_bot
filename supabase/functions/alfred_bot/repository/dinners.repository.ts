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
    console.log(`[getDinnerByDate] ${query}`);

    if (!query.data) {
      console.log(`[getDinnerByDate] no query data`);

      return undefined;
    }

    const queryData: Dinner = query.data[0] as Dinner;
    console.log(`[getDinnerByDate] ${queryData}`);

    // Transform date to JavaScript Date
    queryData.date = new Date(queryData.date);

    return queryData;
  }

  public static async insertDinner(
    chatId: number,
    messageIds: number[],
    date: Date,
    yes: string[],
    no: string[]
  ): Promise<Dinner> {
    // check if dinner already exists
    const data: Dinner | undefined = await this.getDinnerByDate(
      chatId,
      new Date(date)
    );

    if (data) throw new Error(`[insertDinner] dinner already exists`);

    const result = await db
      .from(Config.DINNER_TABLENAME)
      .insert({
        chatId: chatId,
        messageIds: messageIds,
        date: date,
        yes: yes,
        no: no,
      })
      .select();
    if (result.error) throw result.error;

    const queryData: Dinner = result.data[0] as Dinner;
    return queryData;
  }

  public static async updateDinner(dinner: Dinner): Promise<Dinner> {
    // check if dinner already exists
    const data: Dinner | undefined = await this.getDinnerByDate(
      dinner.chatId,
      new Date(dinner.date)
    );

    if (!data)
      throw new Error(
        `[updateDinner] dinner does not exist for date: ${
          dinner.date.toISOString().split("T")[0]
        }`
      );

    const result = await db
      .from(Config.DINNER_TABLENAME)
      .update(dinner)
      .eq("id", dinner.id)
      .select();
    if (result.error) throw result.error;

    const queryData: Dinner = result.data[0] as Dinner;
    return queryData;
  }

  public static async deleteDinner(
    chatId: number,
    date: Date
  ): Promise<boolean> {
    // check if dinner already exists
    const data = await this.getDinnerByDate(chatId, new Date(date));

    if (data) {
      const dinnerId: number = data.id;

      const result = await db
        .from(Config.DINNER_TABLENAME)
        .delete()
        .eq("id", dinnerId);
      if (result.error) throw result.error;

      return true;
    }

    return false;
  }

  public static addMessageId(
    messageIdList: number[],
    messageId: number
  ): number[] {
    const messageIdSet: Set<number> = new Set(messageIdList);
    messageIdSet.add(messageId);

    return Array.from(messageIdSet);
  }
}
