import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";

export function formatInternationalNumber(
  number: string,
  defaultCountry?: CountryCode
): string | null {
  const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
  if (phoneNumber?.isValid()) {
    return phoneNumber.formatInternational();
  }
  return number;
}

export function maybePhoneNumber(input: string): boolean {
  const phonePattern = /^[-+0-9() ]+$/;
  return phonePattern.test(input);
}
