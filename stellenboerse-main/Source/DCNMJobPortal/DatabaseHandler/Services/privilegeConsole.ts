import * as readline from "readline";
import * as privilegeService from "./privilegeService";
import { DATA_SOURCE } from "../Config/data-source";

console.log("---Initialising Connection---");

const RL: readline.Interface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function showMenu(): void {
  console.log("\n===== Main Menu =====");
  console.log("1. Show all privilege keys");
  console.log("2. Delete a privilege key");
  console.log("3. Create a privilege key");
  console.log("4. Exit");
  console.log("=====================");
}

function askQuestion(query: string): Promise<string> {
  return new Promise(function (resolve: (value: string) => void) {
    return RL.question(query, resolve);
  });
}
async function handleOption(option: string) {
  switch (option) {
    case "1":
      await privilegeService.showAllPrivilegeKeys();
      break;
    case "2":
      let privilegeKey: string = await askQuestion("Insert the privilege key >");
      await privilegeService.deletePrivilegeKey(privilegeKey);
      break;
    case "3":
      let keyCount: string = await askQuestion("The number of keys >");
      await privilegeService.createPrivilegeKey(Number(keyCount));
      break;
    case "4":
      RL.close();
      await DATA_SOURCE.destroy();
      console.log("---Connection Destroyed, Goodbye---");
      return;
    default:
      console.log("\nInvalid option. Please try again.");
  }
  privilegeConsole();
}

function privilegeConsole() {
  showMenu();
  RL.question("Choose an option: ", handleOption);
}
async function main() {
  await DATA_SOURCE.initialize();
  console.log("\n---Welcome to Privilege Console---");
  privilegeConsole();
}

main();
