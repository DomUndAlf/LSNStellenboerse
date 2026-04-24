let mockedDate: Date | null = null;

export function setMockedDate(date: Date | null) {
  mockedDate = date;
}

export function getCurrentDate(): Date {
  return mockedDate || new Date();
}
