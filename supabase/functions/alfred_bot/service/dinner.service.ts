import DinnerRepository from "../repository/dinner.repository.ts";

export default class DinnerService {
  private static replyDinnerDetails(ctx: MyContext, data: any) {
    const formattedDate = data.date.split("-").reverse().join("/");

    const text = `
<b>Dinner tonight:</b>
Date: ${formattedDate}
Attendees:
${data.attendees}
    `;

    ctx.reply(text, { parse_mode: "HTML" });
  }

  private static replyDinnerNotFound(ctx: MyContext) {
    ctx.reply("Dinner not started for tonight. Start one now?");
  }

  public static async getDinner(ctx: MyContext): Promise<void> {
    const data = await DinnerRepository.getDinnerByDate(new Date());

    if (data) {
      this.replyDinnerDetails(ctx, data);
    } else {
      this.replyDinnerNotFound(ctx);
    }
  }

  public static async startDinner(ctx: MyContext): Promise<void> {
    const name: string = ctx.from?.first_name ?? "";

    const data = await DinnerRepository.insertDinner(new Date(), name);

    this.replyDinnerDetails(ctx, data);
  }

  public static async joinDinner(ctx: MyContext): Promise<void> {
    const name: string = ctx.from?.first_name ?? "";

    const existingDinner = await DinnerRepository.getDinnerByDate(new Date());
    if (existingDinner) {
      let result;
      const attendees: Array<string> = existingDinner.attendees;

      if (!attendees.includes(name)) {
        attendees.push(name);
        result = await DinnerRepository.updateDinner(new Date(), attendees);
      }
      this.replyDinnerDetails(ctx, result);
    } else {
      this.replyDinnerNotFound(ctx);
    }
  }

  public static async leaveDinner(ctx: MyContext): Promise<void> {
    const name: string = ctx.from?.first_name ?? "";

    const existingDinner = await DinnerRepository.getDinnerByDate(new Date());
    if (existingDinner) {
      let result;
      const existingAttendees: Array<string> = existingDinner["attendees"];

      if (existingAttendees.includes(name)) {
        const newAttendees: Array<string> = existingAttendees.filter(
          (attendee: string) => {
            return attendee != name;
          }
        );

        result = await DinnerRepository.updateDinner(new Date(), newAttendees);
      }
      this.replyDinnerDetails(ctx, result);
    } else {
      this.replyDinnerNotFound(ctx);
    }
  }

  public static async endDinner(ctx: MyContext): Promise<void> {
    await DinnerRepository.deleteDinner(new Date());

    ctx.reply("No more dinner for tonight!");
  }
}
