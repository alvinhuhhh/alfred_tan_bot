import db from "./db.repository.ts";
import Config from "../config.ts";

export default class ChatsRepository {
  public static async getChatById(id: number): Promise<Chat> {
    const query = await db.from(Config.CHAT_TABLENAME).select().eq("id", id);
    if (query.error) throw query.error;

    if (!query.data)
      throw new Error(`[getChatById] chat does not exist for id: ${id}`);

    const queryData: Chat = query.data[0] as Chat;
    return queryData;
  }

  public static async insertChat(chat: Chat): Promise<Chat> {
    // check if chat already exists
    const data: Chat | undefined = await this.getChatById(chat.id);

    if (data) {
      console.debug(`[insertChat] chat already exists`);
      return data;
    }

    const result = await db
      .from(Config.CHAT_TABLENAME)
      .insert({ id: chat.id, type: chat.type })
      .select();
    if (result.error) throw result.error;

    const queryData: Chat = result.data[0] as Chat;
    return queryData;
  }

  public static async updateChat(chat: Chat): Promise<Chat> {
    // check if chat already exists
    const data: Chat | undefined = await this.getChatById(chat.id);

    if (!data)
      throw new Error(`[updateChat] chat does not exist for id: ${chat.id}`);

    const result = await db
      .from(Config.CHAT_TABLENAME)
      .update({ id: chat.id, type: chat.type })
      .eq("id", chat.id)
      .select();
    if (result.error) throw result.error;

    const queryData: Chat = result.data[0] as Chat;
    return queryData;
  }

  public static async deleteChat(id: number): Promise<boolean> {
    // check if chat already exists
    const data: Chat | undefined = await this.getChatById(id);

    if (data) {
      const result = await db.from(Config.CHAT_TABLENAME).delete().eq("id", id);
      if (result.error) throw result.error;

      return true;
    }

    return false;
  }
}
