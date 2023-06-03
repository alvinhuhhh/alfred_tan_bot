import db from "./db.repository.ts";
import Config from "../config.ts";
import { ChatType } from "../enum/chatType.enum.ts";

export default class ChatsRepository {
  public static async getChatById(id: number) {
    const query = await db.from(Config.CHAT_TABLENAME).select().eq("id", id);
    if (query.error) throw query.error;

    if (query.data?.length) {
      const queryData = query.data[0];
      console.log(`[getChatById] ${JSON.stringify(queryData)}`);
      return queryData;
    } else {
      console.log(`[getChatById] chat does not exist for id: ${id}`);
      return null;
    }
  }

  public static async insertChat(id: number, type: string) {
    // check if chat already exists
    const data = await this.getChatById(id);

    if (!data) {
      // convert type string to ChatType int enum
      const chatType: number = (<any>ChatType)[type.toUpperCase()];

      const result = await db
        .from(Config.CHAT_TABLENAME)
        .insert({ id: id, type: chatType })
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[insertChat] new chat created`);
      return queryData;
    } else {
      console.log(`[insertChat] chat already exists`);
      return data;
    }
  }

  public static async updateChat(id: number, type: string) {
    // check if chat already exists
    const data = await this.getChatById(id);

    if (data) {
      // convert type string to ChatType int enum
      const chatType: number = (<any>ChatType)[type.toUpperCase()];

      const result = await db
        .from(Config.CHAT_TABLENAME)
        .update({ id: id, type: chatType })
        .eq("id", id)
        .select();
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[updateChat] chat updated for id: ${id}`);
      return queryData;
    } else {
      console.log(`[updateChat] chat does not exist for id: ${id}`);
      return null;
    }
  }

  public static async deleteChat(id: number) {
    // check if chat already exists
    const data = await this.getChatById(id);

    if (data) {
      const result = await db.from(Config.CHAT_TABLENAME).delete().eq("id", id);
      if (result.error) throw result.error;

      console.log(`[deleteChat] chat deleted for id: ${id}`);
    }
  }
}
