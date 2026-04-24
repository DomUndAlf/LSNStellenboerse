import { getEmployers } from "../../src/apiReceive/receiveEmployer";
import axios, { AxiosResponse } from "axios";

let mockedEmployers: { employer_FullName: string; employer_ShortName: string }[] = [
  { employer_FullName: "first", employer_ShortName: "f" },
  { employer_FullName: "second", employer_ShortName: "s" },
];

let mockedResponse: AxiosResponse = {
  data: mockedEmployers,
} as AxiosResponse;

test("Fetch Employers", async function () {
  jest.spyOn(axios, "get").mockResolvedValue(mockedResponse);
  let result: { FullName: string; ShortName: string }[] = await getEmployers();
  expect(result).toStrictEqual([
    { FullName: "first", ShortName: "f" },
    { FullName: "second", ShortName: "s" },
  ]);
});
