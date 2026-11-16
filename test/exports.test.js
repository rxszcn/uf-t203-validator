import assert from 'assert';
import validator from '../index';
import { locales as isPostalCodeLocales } from '../src/lib/isPostalCode';
import { locales as isAlphaLocales } from '../src/lib/isAlpha';
import { locales as isAlphanumericLocales } from '../src/lib/isAlphanumeric';
import { locales as isMobilePhoneLocales } from '../src/lib/isMobilePhone';
import { locales as isFloatLocales } from '../src/lib/isFloat';
import { locales as ibanCountryCodes } from '../src/lib/isIBAN';
import { locales as passportNumberLocales } from '../src/lib/isPassportNumber';
import isISO8601 from '../src/lib/isISO8601';
import isISO8601Duration from '../src/lib/isISO8601Duration';
import srcValidator from '../src/index';

describe('Exports', () => {
  it('should export isPassportNumbers\'s supported locales', () => {
    assert.ok(passportNumberLocales instanceof Array);
    assert.ok(validator.passportNumberLocales instanceof Array);
  });

  it('should export validators', () => {
    assert.strictEqual(typeof validator.isEmail, 'function');
    assert.strictEqual(typeof validator.isAlpha, 'function');
  });

  it('should export sanitizers', () => {
    assert.strictEqual(typeof validator.toBoolean, 'function');
    assert.strictEqual(typeof validator.toFloat, 'function');
  });

  it('should export toString and not inherit Object.prototype.toString', () => {
    assert.notStrictEqual(validator.toString, Object.prototype.toString);
    assert.strictEqual(validator.toString('test'), 'test');
    assert.strictEqual(validator.toString(123), '123');
    assert.strictEqual(validator.toString(null), '');
    assert.strictEqual(validator.toString(undefined), '');
  });

  it('should export the version number', () => {
    /* eslint-disable global-require */
    assert.strictEqual(
      validator.version, require('../package.json').version,
      'Version number mismatch in "package.json" vs. "validator.js"'
    );
    /* eslint-enable global-require */
  });

  it('should export isPostalCode\'s supported locales', () => {
    assert.ok(isPostalCodeLocales instanceof Array);
    assert.ok(validator.isPostalCodeLocales instanceof Array);
  });

  it('should export isAlpha\'s supported locales', () => {
    assert.ok(isAlphaLocales instanceof Array);
    assert.ok(validator.isAlphaLocales instanceof Array);
  });

  it('should export isAlphanumeric\'s supported locales', () => {
    assert.ok(isAlphanumericLocales instanceof Array);
    assert.ok(validator.isAlphanumericLocales instanceof Array);
  });

  it('should export isMobilePhone\'s supported locales', () => {
    assert.ok(isMobilePhoneLocales instanceof Array);
    assert.ok(validator.isMobilePhoneLocales instanceof Array);
  });

  it('should export isFloat\'s supported locales', () => {
    assert.ok(isFloatLocales instanceof Array);
    assert.ok(validator.isFloatLocales instanceof Array);
  });

  it('should export a list of country codes that implement IBAN', () => {
    assert.ok(ibanCountryCodes instanceof Array);
    assert.ok(validator.ibanLocales instanceof Array);
  });

  it('should export isISO8601Duration from both the source and the built entry point', () => {
    assert.strictEqual(typeof validator.isISO8601Duration, 'function');
    assert.strictEqual(typeof srcValidator.isISO8601Duration, 'function');
    assert.strictEqual(typeof validator.isISO8601, 'function');
    // The per-validator module is importable on its own and agrees with both
    // bundled entry points, so a policy loader can use either path.
    assert.strictEqual(typeof isISO8601Duration, 'function');
    ['P1Y2M3DT4H5M6S', 'P1W', 'P0002-01-10T22:33:55', 'P', '1D', ''].forEach((sample) => {
      const expected = isISO8601Duration(sample);
      assert.strictEqual(validator.isISO8601Duration(sample), expected);
      assert.strictEqual(srcValidator.isISO8601Duration(sample), expected);
    });
    // The date/time validator and the duration validator stay distinct: the
    // duration support is not bolted onto isISO8601.
    assert.notStrictEqual(validator.isISO8601Duration, isISO8601);
  });

  it('should not treat ISO 8601 durations as ISO 8601 dates', () => {
    assert.strictEqual(validator.isISO8601Duration('P1Y2M3DT4H5M6S'), true);
    assert.strictEqual(validator.isISO8601('P1Y2M3DT4H5M6S'), false);
  });
});
