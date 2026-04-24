// we could use these codes insted but i think this would be overkill: https://nodejs.org/api/process.html#process_exit_codes
// if there needs is an need for another exit code in the future maybe take inspiration from the above link

export enum exitCodes {
  Success = 0,
  UncaughtFatalException = 1,
}
