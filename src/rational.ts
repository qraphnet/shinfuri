const gcd = (a: number, b: number): number => {
  while (b) [a, b] = [b, a % b];
  return a;
};

/**
 * 精度を失わないで有理数の計算をするためのクラス
 */
export class Rational {
  #numerator: number;
  #denominator: number;

  // numeratorやdenominatorに非整数が与えられると面倒だから，外部からはRational.intでしかインスタンスを作れないようにprivateとしている
  private constructor(numerator: number, denominator: number) {
    const d = gcd(Math.abs(numerator), Math.abs(denominator));
    this.#numerator = numerator / d;
    this.#denominator = denominator / d;
  }

  static int(n: number): Rational {
    if (n % 1 !== 0) throw new Error("the given number is not integer");
    return new Rational(n, 1);
  }
  
  // 重率等で0.1の整数倍が多いので，0.1に対応するRationalを定義
  static deci: Rational;
  static {
    this.deci = new Rational(1, 10);
  }

  toNumber(): number {
    return this.#numerator / this.#denominator;
  }

  add(rhs: Rational): Rational {
    return new Rational(
      this.#numerator * rhs.#denominator + rhs.#numerator * this.#denominator,
      this.#denominator * rhs.#denominator,
    );
  }
  sub(rhs: Rational): Rational {
    return new Rational(
      this.#numerator * rhs.#denominator - rhs.#numerator * this.#denominator,
      this.#denominator * rhs.#denominator,
    );
  }
  mul(rhs: Rational): Rational {
    return new Rational(
      this.#numerator * rhs.#numerator,
      this.#denominator * rhs.#denominator,
    );
  }
  div(rhs: Rational): Rational {
    return new Rational(
      this.#numerator * rhs.#denominator,
      this.#denominator * rhs.#numerator,
    );
  }
}
