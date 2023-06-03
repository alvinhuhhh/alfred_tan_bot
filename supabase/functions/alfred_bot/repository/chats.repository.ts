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

  public static async getChatByTitle(title: string) {
    const query = await db
      .from(Config.CHAT_TABLENAME)
      .select()
      .eq("title", title);
    if (query.error) throw query.error;

    if (query.data?.length) {
      const queryData = query.data[0];
      console.log(`[getChatByTitle] ${JSON.stringify(queryData)}`);
      return queryData;
    } else {
      console.log(`[getChatByTitle] chat does not exist for title: ${title}`);
      return null;
    }
  }

  public static async getChatByUsername(username: string) {
    const query = await db
      .from(Config.CHAT_TABLENAME)
      .select()
      .eq("username", username);
    if (query.error) throw query.error;

    if (query.data?.length) {
      const queryData = query.data[0];
      console.log(`[getChatByUsername] ${JSON.stringify(queryData)}`);
      return queryData;
    } else {
      console.log(
        `[getChatByUsername] chat does not exist for username: ${username}`
      );
      return null;
    }
  }

  public static async insertChat(id: number, type: string, name: string) {
    // check if chat already exists
    const data = await this.getChatById(id);

    if (!data) {
      // convert type string to ChatType int enum
      const chatType: number = (<any>ChatType)[type.toUpperCase()];

      let result;
      if (chatType === 0) {
        result = await db
          .from(Config.CHAT_TABLENAME)
          .insert({ id: id, type: chatType, username: name })
          .select();
      } else {
        result = await db
          .from(Config.CHAT_TABLENAME)
          .insert({ id: id, type: chatType, title: name })
          .select();
      }
      if (result.error) throw result.error;

      const queryData = result.data[0];
      console.log(`[insertChat] new chat created`);
      return queryData;
    } else {
      console.log(`[insertChat] chat already exists`);
      return data;
    }
  }

  public static async updateChat(id: number, type: string, name: string) {
    // check if chat already exists
    const data = await this.getChatById(id);

    if (data) {
      // convert type string to ChatType int enum
      const chatType: number = (<any>ChatType)[type.toUpperCase()];

      let result;
      if (chatType === 0) {
        result = await db
          .from(Config.CHAT_TABLENAME)
          .update({ username: name })
          .eq("id", id)
          .select();
      } else {
        result = await db
          .from(Config.CHAT_TABLENAME)
          .update({ title: name })
          .eq("id", id)
          .select();
      }
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
