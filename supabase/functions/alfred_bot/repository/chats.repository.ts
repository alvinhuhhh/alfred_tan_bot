import db from "./db.repository.ts";
import Config from "../config.ts";
import { ChatType } from "../enum/chatType.enum.ts";

export default class ChatsRepository {
  public static async getChatById(id: number): Promise<Chat | undefined> {
    const query = await db.from(Config.CHAT_TABLENAME).select().eq("id", id);
    if (query.error) throw query.error;

    if (!query.data) {
      console.log(`[getChatById] chat does not exist for id: ${id}`);
      return undefined;
    }

    const queryData: Chat = query.data[0] as Chat;
    console.log(`[getChatById] ${JSON.stringify(queryData)}`);

    return queryData;
  }

  public static async insertChat(
    id: number,
    type: string
  ): Promise<Chat | null> {
    // check if chat already exists
    const data: Chat | undefined = await this.getChatById(id);

    if (data) {
      console.log(`[insertChat] chat already exists`);
      return data;
    }

    // convert type string to ChatType int enum
    const chatType: number = (<any>ChatType)[type.toUpperCase()];

    const result = await db
      .from(Config.CHAT_TABLENAME)
      .insert({ id: id, type: chatType })
      .select();
    if (result.error) throw result.error;

    const queryData: Chat = result.data[0] as Chat;
    console.log(`[insertChat] new chat created`);

    return queryData;
  }

  public static async updateChat(
    id: number,
    type: string
  ): Promise<Chat | undefined> {
    // check if chat already exists
    const data: Chat | undefined = await this.getChatById(id);

    if (!data) {
      console.error(`[updateChat] chat does not exist for id: ${id}`);
      return undefined;
    }

    // convert type string to ChatType int enum
    const chatType: number = (<any>ChatType)[type.toUpperCase()];

    const result = await db
      .from(Config.CHAT_TABLENAME)
      .update({ id: id, type: chatType })
      .eq("id", id)
      .select();
    if (result.error) throw result.error;

    const queryData: Chat = result.data[0] as Chat;
    console.log(`[updateChat] chat updated for id: ${id}`);

    return queryData;
  }

  public static async deleteChat(id: number): Promise<boolean> {
    // check if chat already exists
    const data: Chat | undefined = await this.getChatById(id);

    if (data) {
      const result = await db.from(Config.CHAT_TABLENAME).delete().eq("id", id);
      if (result.error) throw result.error;

      console.log(`[deleteChat] chat deleted for id: ${id}`);
      return true;
    }

    return false;
  }
}
