import { describe, expect, test } from '@jest/globals';
import {Rational} from './rational.js';

describe('check the behavior of the operators of Rational', () => {
  test('addition', () => {
    const a = Rational.int(1).div(Rational.int(2)), b = Rational.int(1).div(Rational.int(3));
    expect(a.add(b).toNumber()).toBe(5/6);
  });
  test('subtraction', () => {
    const a = Rational.int(1).div(Rational.int(2)), b = Rational.int(1).div(Rational.int(3));
    expect(a.sub(b).toNumber()).toBe(1/6);
  });
  test('multiplication', () => {
    const p1 = 99971, p2 = 99989, p3 = 99991;
    const a = Rational.int(p1).div(Rational.int(p2)), b = Rational.int(p2).div(Rational.int(p3)), c = Rational.int(p3).div(Rational.int(p1));
    expect(a.mul(b).mul(c).toNumber()).toBe(1);
  });
  test('division', () => {
    const p1 = 399983, p2 = 399989;
    const a = Rational.int(p1).div(Rational.int(p2));
    expect(a.div(a).toNumber()).toBe(1);
  });
});
