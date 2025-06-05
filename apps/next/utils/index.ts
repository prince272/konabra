import { CountryCode, parsePhoneNumberFromString } from "libphonenumber-js";
import queryString, { StringifyOptions, UrlObject } from "query-string";

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

export function maybePhoneNumber(input?: string): boolean {
  const phonePattern = /^[-+0-9() ]+$/;
  return phonePattern.test(input || "");
}

export function stringifyPath(object: UrlObject, options?: StringifyOptions): string {
  const BASE = "https://example.com";
  const originalUrl = object.url ?? "";
  const isRelative = originalUrl.startsWith("/");

  if (isRelative) {
    const withBase: UrlObject = {
      ...object,
      url: `${BASE}${originalUrl}`
    };

    const full = queryString.stringifyUrl(withBase, options);
    return full.replace(BASE, "");
  }

  return queryString.stringifyUrl(object, options);
}
