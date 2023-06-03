import ChatsRepository from "../repository/chats.repository.ts";

export default class ChatsService {
  public static async addChat(ctx: MyContext): Promise<void> {
    const id: number = ctx.chat?.id ?? -1;
    const type: string = ctx.chat?.type ?? "";
    const name: string = "";

    await ChatsRepository.insertChat(id, type, name);

    ctx.reply("Welcome! I am up and running!");
  }
}
