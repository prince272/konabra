import { CalendarDate } from "@internationalized/date";
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

export function toRelativeUrl(fullUrl: string): string {
  try {
    const url = new URL(fullUrl);
    return url.pathname + url.search + url.hash;
  } catch {
    const protoIndex = fullUrl.indexOf("://");
    if (protoIndex !== -1) {
      const startPath = fullUrl.indexOf("/", protoIndex + 3);
      if (startPath !== -1) {
        return fullUrl.substring(startPath);
      }
      return "/";
    }
    return fullUrl.startsWith("/") ? fullUrl : `/${fullUrl}`;
  }
}

export function calendarDateToISOString(date: CalendarDate, isEndOfDay = false): string {
  const dateObj = new Date(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      isEndOfDay ? 23 : 0,
      isEndOfDay ? 59 : 0,
      isEndOfDay ? 59 : 0,
      isEndOfDay ? 999 : 0
    )
  );
  return dateObj.toISOString();
}