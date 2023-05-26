import UsersRepository from "../repository/users.repository.ts";

export default class UsersService {
  public static async getUsers(ctx: MyContext) {
    const data = await UsersRepository.getUsers();
    const users = data.map((entry) => entry["name"]);

    ctx.reply(`Here are the list of users: ${JSON.stringify(users)}`);
  }

  public static async addUser(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("What is the name of the user?");
    const userMsg = await conversation.waitFor(":text");

    if (userMsg.update.message?.text)
      await UsersRepository.insertUser(userMsg.update.message?.text);

    const data = await UsersRepository.getUsers();
    const users = data.map((entry) => entry["name"]);

    ctx.reply(`Nice! Here are the registered users: ${JSON.stringify(users)}`);
    return;
  }

  public static async updateUser(conversation: MyConversation, ctx: MyContext) {
    ctx.reply("Coming soon!");
    return;
  }

  public static async deleteUser(conversation: MyConversation, ctx: MyContext) {
    await ctx.reply("What is the name of the user to be deleted?");
    const userMsg = await conversation.waitFor(":text");

    if (userMsg.update.message?.text) {
      const userId = await UsersRepository.getUserByName(
        userMsg.update.message.text
      );
      if (userId[0].id) await UsersRepository.deleteUser(userId[0].id);
      else ctx.reply("Couldn't find a user with that name");

      const data = await UsersRepository.getUsers();
      const users = data.map((entry) => entry["name"]);

      ctx.reply(
        `Nice! Here are the registered users: ${JSON.stringify(users)}`
      );
      return;
    }
  }
}
