import DinnerRepository from "../repository/dinner.repository.ts";

export default class DinnerService {
  public static async getDinner(ctx: MyContext) {
    const data = await DinnerRepository.getDinnerByDate(new Date());

    if (data) {
      ctx.reply(`Dinner tonight: ${JSON.stringify(data)}`);
    } else {
      ctx.reply("Dinner not started for tonight. Start one now?");
    }
  }

  public static async startDinner(ctx: MyContext) {
    const name = ctx.from?.first_name ?? "";

    const data = await DinnerRepository.insertDinner(new Date(), name);

    ctx.reply(`Dinner tonight: ${JSON.stringify(data)}`);
  }

  public static async joinDinner(ctx: MyContext) {
    const name = ctx.from?.first_name ?? "";

    const existingDinner = await DinnerRepository.getDinnerByDate(new Date());
    if (existingDinner) {
      let result;
      const existingAttendees = existingDinner.attendees;

      if (!existingAttendees.includes(name)) {
        const newAttendees = existingAttendees.push(name);
        result = await DinnerRepository.updateDinner(new Date(), newAttendees);
      }
      ctx.reply(`Dinner tonight: ${JSON.stringify(result)}`);
    } else {
      ctx.reply("Dinner not started for tonight. Start one now?");
    }
  }

  public static async leaveDinner(ctx: MyContext) {
    const name = ctx.from?.first_name ?? "";

    const existingDinner = await DinnerRepository.getDinnerByDate(new Date());
    if (existingDinner) {
      let result;
      const existingAttendees = existingDinner.attendees;

      if (existingAttendees.includes(name)) {
        const newAttendees = existingAttendees.filter((attendee: string) => {
          return attendee != name;
        });

        result = await DinnerRepository.updateDinner(new Date(), newAttendees);
      }
      ctx.reply(`Dinner tonight: ${JSON.stringify(result)}`);
    } else {
      ctx.reply("Dinner not started for tonight. Start one now?");
    }
  }

  public static async endDinner(ctx: MyContext) {
    await DinnerRepository.deleteDinner(new Date());

    ctx.reply("No more dinner for tonight!");
  }
}
