import { validateAndFormatDate } from "../ClientLogic/validatingInput";

test("German Date Format", function () {
  let result: Date | null = validateAndFormatDate("31.01.2025");
  expect(result?.toISOString()).toStrictEqual("2025-01-31T00:00:00.000Z");
});

test("Not German Date Format", function () {
  let result: Date | null = validateAndFormatDate("01/31/2025");
  expect(result?.toISOString()).toStrictEqual("2025-01-31T00:00:00.000Z");
});

test("Invalid Date", function () {
  let result: Date | null = validateAndFormatDate("not valid");
  expect(result).toBe(null);
});
