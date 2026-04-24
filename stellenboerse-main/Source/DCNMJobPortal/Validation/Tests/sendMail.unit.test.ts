import { expect, jest, test } from "@jest/globals";
import { sendMail, TRANSPORTER } from "../Services/sendEmail";

test("Sending Email", async function () {
  let psy: jest.SpiedFunction<typeof TRANSPORTER.sendMail> = jest.spyOn(TRANSPORTER, "sendMail");
  psy.mockImplementation(async function () {});
  await sendMail(["mock@gmail.com"], "mock", "mock");
  expect(psy).toHaveBeenCalled();
});
