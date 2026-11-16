import assertString from './util/assertString';

/*
 * ISO 8601-1:2019 duration representations (clause 5.5.2).
 *
 * Covered:
 *   - 5.5.2.2 designator form: PnYnMnDTnHnMnS. The order of the components is
 *     fixed; components whose value is zero may be omitted, as may the lower
 *     order components that follow the last component present.
 *   - 5.5.2.2 week form: PnW. It is a standalone representation and shall not
 *     be mixed with any other unit (P1W2D, P1Y2W and P1WT1H are not durations).
 *   - 5.5.2.3 decimal fraction: it may only be added to the lowest order unit
 *     present, and both a comma and a full stop are accepted as decimal sign.
 *   - 5.5.2.4 alternative basic and extended formats, for calendar dates
 *     (PYYYYMMDDTHHMMSS / PYYYY-MM-DDTHH:MM:SS) and for ordinal dates
 *     (PYYYYDDDTHHMMSS / PYYYY-DDDTHH:MM:SS). An optional decimal fraction is
 *     accepted on the seconds, the lowest order unit of the representation.
 *
 * Alternative formats are quantities, not calendar dates, so each field is
 * capped at the point where it would carry over into the next unit: months
 * 00-12, days 00-30, hours 00-23, minutes and seconds 00-59, and ordinal days
 * 000-365. The year is exactly four unsigned digits: expanded (signed) years
 * do not apply to durations.
 *
 * Deliberately excluded:
 *   - signed years (e.g. +0002-01-10) and signed durations, including a
 *     leading "-P" and per-component signs. Those are ISO 8601-2 extensions;
 *     a negative lifetime has no meaning for the policy loader using this
 *     validator.
 *   - time intervals ("start/end", "date/duration") and repeating intervals
 *     ("R5/..."), which are intervals rather than durations.
 */

/* eslint-disable max-len */
const week = /^P(\d+(?:[.,]\d+)?)W$/;
const designator = /^P(?:(\d+(?:[.,]\d+)?)Y)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)D)?(?:(T)(?:(\d+(?:[.,]\d+)?)H)?(?:(\d+(?:[.,]\d+)?)M)?(?:(\d+(?:[.,]\d+)?)S)?)?$/;
const alternativeCalendarBasic = /^P(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}(?:[.,]\d+)?)$/;
const alternativeCalendarExtended = /^P(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:[.,]\d+)?)$/;
const alternativeOrdinalBasic = /^P(\d{4})(\d{3})T(\d{2})(\d{2})(\d{2}(?:[.,]\d+)?)$/;
const alternativeOrdinalExtended = /^P(\d{4})-(\d{3})T(\d{2}):(\d{2}):(\d{2}(?:[.,]\d+)?)$/;
/* eslint-enable max-len */

// Hardening bound for untrusted input. The longest representation covered
// here without a fraction is 20 characters ("P0002-01-10T22:33:55"), so this
// leaves room for high-precision fractional seconds while bounding the work a
// caller can force on the validator.
const MAX_LENGTH = 40;

const hasFraction = value => /[.,]/.test(value);

const isWithin = (value, min, max) => {
  const number = parseInt(value, 10);
  return number >= min && number <= max;
};

// A calendar alternative format holds year, month, day, hour, minute and
// second, an ordinal one holds year, day of the year, hour, minute and second.
// Year is group 1 in both; the remaining fields are checked from the index the
// caller names.
const areClockFieldsLegal = (match, hourGroup) => isWithin(match[hourGroup], 0, 23)
  && isWithin(match[hourGroup + 1], 0, 59)
  && isWithin(match[hourGroup + 2], 0, 59);

const isCalendarAlternative = match => isWithin(match[2], 0, 12)
  && isWithin(match[3], 0, 30)
  && areClockFieldsLegal(match, 4);

const isOrdinalAlternative = match => isWithin(match[2], 0, 365)
  && areClockFieldsLegal(match, 3);

function isDesignator(str) {
  const match = str.match(designator);
  if (!match) return false;

  const parts = [match[1], match[2], match[3], match[5], match[6], match[7]].filter(Boolean);
  const timeDesignator = match[4];
  const timeParts = [match[5], match[6], match[7]].filter(Boolean);

  // "P" and "PT" name no unit at all.
  if (parts.length === 0) return false;
  // A time designator has to introduce at least one time unit ("P1DT").
  if (timeDesignator && timeParts.length === 0) return false;

  // A decimal fraction belongs to the lowest order unit present only.
  return parts.every((part, index) => index === parts.length - 1 || !hasFraction(part));
}

export default function isISO8601Duration(str) {
  assertString(str);

  if (str.length > MAX_LENGTH) return false;
  if (week.test(str)) return true;

  let match = str.match(alternativeCalendarBasic);
  if (match) return isCalendarAlternative(match);

  match = str.match(alternativeCalendarExtended);
  if (match) return isCalendarAlternative(match);

  match = str.match(alternativeOrdinalBasic);
  if (match) return isOrdinalAlternative(match);

  match = str.match(alternativeOrdinalExtended);
  if (match) return isOrdinalAlternative(match);

  return isDesignator(str);
}
