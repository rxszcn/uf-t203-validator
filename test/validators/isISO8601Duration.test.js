import assert from 'assert';
import test from '../testFunctions';
import validator from '../../src/index';

describe('isISO8601Duration', () => {
  // ISO 8601-1:2019, 5.5.2.2 a): designator form, fixed order of components,
  // at least one component present.
  describe('designator form (5.5.2.2)', () => {
    it('should accept a duration for each component and in any reduced precision', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P1Y',
          'P5M',
          'P1D',
          'P100D',
          'PT1H',
          'PT30M',
          'PT45S',
          'P2Y3M',
          'P1Y2M3D',
          'PT12H30M',
          'P1DT1S',
          'P3Y6M4DT12H30M5S',
          'P1Y2M3DT4H5M',
          'P1Y2M3DT4H',
          'P1Y2M3DT4H5M6S',
          'P1Y6M',
          'P1M2D',
          'P4D',
          // A value that does not carry over is still a legal quantity, the
          // carry-over caps only apply to the alternative formats.
          'PT36H',
        ],
      });
    });

    it('should accept zero-valued components, including an all-zero duration', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P0D',
          'PT0S',
          'P0Y0M0DT0H0M0S',
          'P1Y0M0D',
          'P1DT0S',
          'PT0H0M0S',
        ],
      });
    });

    it('should reject a representation that names no component', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          '',
          'P',
          'PT',
          'P1DT',
          'P1YT',
          'PT1H30',
          'P1Y2M3D4H',
          'P1D1H',
          'P1Y2M3DT4H5M6S7',
          'P1Y2M3DT4H5M6S7S',
        ],
      });
    });

    it('should reject components out of order, repeated or without a number', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P1M1Y',
          'P1D1M',
          'PT1M1H',
          'P1Y1Y',
          'P1M1M',
          'PY',
          'PM',
          'PD',
          'P1YM',
          'P1Y2MD',
          'P1Y2M3DT4HM',
        ],
      });
    });

    it('should only accept uppercase designators', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'p1Y',
          'P1y',
          'P1m',
          'P1d',
          'P1Dt1H',
          'P1DT1h',
          'P1DT1m',
          'P1DT1s',
        ],
      });
    });
  });

  // ISO 8601-1:2019, 5.5.2.3: a decimal fraction is added to the lowest order
  // component present only, and both the comma and the full stop are accepted
  // as decimal sign.
  describe('decimal fractions (5.5.2.3)', () => {
    it('should accept a fraction on the lowest order component present', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P0.5Y',
          'P0,5Y',
          'P1.5Y',
          'P1,5Y',
          'P1.5M',
          'P1.5D',
          'PT1.5H',
          'PT1.5M',
          'PT1.5S',
          'P1Y2M3DT4H5M6.5S',
          'P1Y2M3DT4H5M6,5S',
          'P1M2.5D',
          'PT0.5H',
        ],
      });
    });

    it('should reject a fraction that does not sit on the lowest order component', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P1.5Y2M',
          'P1,5Y2M',
          'P1.5M2D',
          'P1.5D2H',
          'PT1.5H30M',
          'PT1.5M30S',
          'P1Y2M3.5DT4H5M6S',
        ],
      });
    });

    it('should reject a malformed decimal sign', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P1.Y',
          'P1,Y',
          'P.5Y',
          'P,5Y',
          'P1.5.5Y',
          'P1,5,5Y',
          'PT1.5H.5M',
        ],
      });
    });
  });

  // ISO 8601-1:2019, 5.5.2.2 b): the week form is a standalone
  // representation and shall not be combined with any other unit.
  describe('week form (5.5.2.2 b)', () => {
    it('should accept a standalone number of weeks', () => {
      test({
        validator: 'isISO8601Duration',
        valid: ['P0W', 'P1W', 'P10W', 'P52W', 'P100W', 'P1.5W', 'P1,5W', 'P0.5W'],
      });
    });

    it('should reject a week mixed with any other unit', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P1W2D',
          'P1Y2W',
          'P1M2W',
          'P1WT1H',
          'PT1H1W',
          'P1Y2M3W',
          'P1W2D3M',
        ],
      });
    });

    it('should reject a malformed week form', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: ['PW', 'P10w', 'p10W', 'P-1W', 'P1.W', 'P.5W', 'P1 W', 'P1WD'],
      });
    });
  });

  // ISO 8601-1:2019, 5.5.2.4: alternative basic and extended formats for a
  // calendar date or an ordinal date. Fields are quantities, capped at their
  // carry-over point, and the year is four unsigned digits.
  describe('alternative calendar formats (5.5.2.4)', () => {
    it('should accept the basic and the extended format', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P00020110T223355',
          'P00010101T000000',
          'P00100615T123045',
          'P00000000T000000',
          'P00000001T000000',
          'P00010001T000000',
          'P00001230T235959',
          'P0002-01-10T22:33:55',
          'P0001-01-01T00:00:00',
          'P0010-06-15T12:30:45',
          'P0000-00-01T00:00:00',
          'P0001-00-01T00:00:00',
          'P0000-12-30T23:59:59',
        ],
      });
    });

    it('should accept a fraction on the seconds', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P00020110T223355.5',
          'P00020110T223355,5',
          'P0002-01-10T22:33:55.5',
          'P0002-01-10T22:33:55,5',
        ],
      });
    });

    it('should reject a field past its carry-over point', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P00001231T235959',
          'P0000-12-31T23:59:59',
          'P00001310T000000',
          'P0002-13-10T22:33:55',
          'P00020110T243355',
          'P00020110T236055',
          'P00020110T223360',
          'P0002-01-10T24:00:00',
          'P0002-01-10T22:60:00',
          'P0002-01-10T22:33:60',
        ],
      });
    });

    it('should reject a field of the wrong width and a mixed basic/extended form', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P00020110T22335',
          'P00020110T2233555',
          'P00020110223355',
          'P00020110',
          'P0002-1-10T22:33:55',
          'P0002-001-10T22:33:55',
          'P002-01-10T22:33:55',
          'P00002-01-10T22:33:55',
          'P0002-01-10T223355',
          'P00020110T22:33:55',
          'P0002-01-1022:33:55',
          'P0002-01-10T22:33',
          'P0002-01-10T22',
          'P0002-01-10',
          'P0002-01-10T22:33:55,',
          'P0002-01-10 T 22:33:55',
          'p0002-01-10T22:33:55',
          'P0002-01-10t22:33:55',
        ],
      });
    });
  });

  describe('alternative ordinal formats (5.5.2.4)', () => {
    it('should accept the basic and the extended format', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P0002178T223355',
          'P0001001T000000',
          'P0001365T235959',
          'P0010100T123045',
          'P0001000T000000',
          'P0002-178T22:33:55',
          'P0001-001T00:00:00',
          'P0001-365T23:59:59',
          'P0010-100T12:30:45',
          'P0001-000T00:00:00',
          'P0001000T235959.5',
          'P0001-365T23:59:59,5',
        ],
      });
    });

    it('should reject an ordinal day or clock field past its carry-over point', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P0005366T061530',
          'P0005-366T06:15:30',
          'P0002-367T22:33:55',
          'P0002178T243355',
          'P0002-178T22:60:55',
          'P0002-178T22:33:60',
        ],
      });
    });

    it('should reject a field of the wrong width and a mixed basic/extended form', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P000278T223355',
          'P00002178T223355',
          'P0002178T22335',
          'P0002-78T22:33:55',
          'P0002-1780T22:33:55',
          'P0002178T22:33:55',
          'P0002-178T223355',
          'P0002-17822:33:55',
          'P0002-178T22:33',
          'P0002-178',
        ],
      });
    });
  });

  describe('excluded representations', () => {
    it('should reject signed years and negative durations', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          '+0002-01-10T22:33:55',
          '-0002-01-10T22:33:55',
          '+00020110T223355',
          '-0002178T223355',
          '-P1D',
          '-P100D',
          '-P1Y3D',
          '-P2M1D',
          '-PT30M',
          'P-1D',
          'P-2M1D',
          'P1Y-2M',
          'PT-1H',
          'P1DT-1H',
        ],
      });
    });

    it('should reject time intervals and repeating intervals', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          '2007-03-01T13:00:00Z/2008-05-11T15:30:00Z',
          '2007-03-01T13:00:00Z/P1Y2M10DT2H30M',
          'P1Y2M10DT2H30M/2007-03-01T13:00:00Z',
          'P1Y2M/P1Y2M',
          '2007-03-01/P1Y2M',
          'P1Y2M/2007-03-01',
          'R5/2008-03-01T13:00:00Z/P1Y2M10DT2H30M',
          'R/2007-03-01/P1D',
          'R12/P1Y2M15DT12H30M0S/19850412T232050',
          'R5/P1D',
        ],
      });
    });

    it('should reject other ISO 8601-2 extensions covered by neither format', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          'P1YP3MP2D',
          'P-3MP2DP-1Y',
          'G11DU',
          'GT30MU',
          'G2DT6HU',
          'L1K1IN/P5D',
          'LL3K4IN/P5DN',
          'P2026-W10',
          'P2K',
          'P2026-XX-15',
        ],
      });
    });
  });

  describe('input hardening', () => {
    it('should bound the length of the input', () => {
      test({
        validator: 'isISO8601Duration',
        invalid: [
          `P${'1'.repeat(40)}D`,
          `P${'9'.repeat(1000)}Y`,
          `P${'1'.repeat(38)}.5Y`,
          `P${'0'.repeat(40)}W`,
          `P0002-01-10T22:33:55.${'1'.repeat(20)}`,
        ],
      });
    });

    it('should keep realistic long representations valid', () => {
      test({
        validator: 'isISO8601Duration',
        valid: [
          'P0002-01-10T22:33:55.123456789',
          'P00020110T223355.123456789',
          `P${'1'.repeat(38)}Y`,
        ],
      });
    });

    it('should reject non-string input', () => {
      [undefined, null, 1, {}, [], new Date()].forEach((input) => {
        assert.throws(() => validator.isISO8601Duration(input), TypeError);
      });
    });
  });
});
