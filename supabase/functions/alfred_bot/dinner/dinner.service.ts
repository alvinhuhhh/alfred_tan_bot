import DinnerRepository from "../repository/dinner.repository.ts";

export default class DinnerService {
  public static async getDinner(ctx: MyContext) {
    const date = new Date().toLocaleDateString();

    const data = await DinnerRepository.getDinnerByDate(date);

    if (data) {
      ctx.reply(`Dinner tonight: ${JSON.stringify(data)}`);
    } else {
      ctx.reply("Dinner not started for tonight. Start one now?");
    }
  }

  public static async startDinner(ctx: MyContext) {
    const date = new Date().toLocaleDateString();
    const name = ctx.from?.first_name ?? "";

    const data = await DinnerRepository.insertDinner(date, name);

    ctx.reply(`Dinner tonight: ${JSON.stringify(data)}`);
  }

  public static async joinDinner(ctx: MyContext) {
    const date = new Date().toLocaleDateString();
    const name = ctx.from?.first_name ?? "";

    const data = await DinnerRepository.updateDinner(date, name);

    ctx.reply(`Dinner tonight: ${JSON.stringify(data)}`);
  }
}
