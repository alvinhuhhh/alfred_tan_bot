import DinnerRepository from "../repository/dinner.repository.ts";

export default class DinnerService {
  public static async startDinner(ctx: MyContext) {
    const date = new Date().toLocaleDateString();
    const name = ctx.from?.first_name ?? "";

    const data = await DinnerRepository.insertDinner(date, name);

    ctx.reply(`Great, dinner is started: ${JSON.stringify(data)}`);
  }
}
