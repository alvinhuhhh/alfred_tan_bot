import UsersRepository from "../repository/users.repository.ts";

export default class UsersService {
  public static async getAllUsers(ctx: MyContext): Promise<void> {
    const data = await UsersRepository.getAllUsers();
    const users: Array<string> = data.map((entry) => entry.name);

    ctx.reply(`Here are the list of users: ${JSON.stringify(users)}`);
  }

  public static async addUser(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    await ctx.reply("What is the name of the user?");
    const userMsg = await conversation.waitFor(":text");

    if (userMsg.update.message?.text) {
      await UsersRepository.insertUser(userMsg.update.message?.text);
    }

    this.getAllUsers(ctx);
    return;
  }

  public static async updateUser(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    ctx.reply("Coming soon!");
    return;
  }

  public static async deleteUser(
    conversation: MyConversation,
    ctx: MyContext
  ): Promise<void> {
    await ctx.reply("What is the name of the user to be deleted?");
    const userMsg = await conversation.waitFor(":text");

    if (userMsg.update.message?.text) {
      const user = await UsersRepository.getUserByName(
        userMsg.update.message.text
      );

      if (user?.id) await UsersRepository.deleteUser(user.id);
      else ctx.reply("Couldn't find a user with that name");

      this.getAllUsers(ctx);
      return;
    }
  }
}
