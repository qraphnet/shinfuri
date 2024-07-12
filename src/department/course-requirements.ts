import {CourseCode, getTitle} from "../course-code.js";
import {Credit} from "../course.js";
import {SpecificReport} from "../report.js";
import {Karui} from "../type-utils.js";

// 要求科目を表現するためのユーティリティを定義する
abstract class Rule<T> {
  // 要求を満たすパターンを全列挙する
  abstract satisfy(): T[][];

  // 一部の進学単位の指定重率では要求科目を参照するので，含まれてるやつを全部集める関数を定義した．
  public abstract collect(): T[];
}

class Value<T> extends Rule<T> {
  constructor(readonly value: T) { super(); }
  satisfy(): T[][] {
    return [[this.value]];
  }
  collect(): T[] {
    return [this.value];
  }
}

class All<T> extends Rule<T> {
  constructor(readonly choices: (Value<T> | Any<T>)[]) { super(); }

  satisfy(): T[][] {
    const anys = this.choices.map(p => p.satisfy())
    anys.reverse();
    const n = anys.reduce((p, c) => p * c.length, 1);
    const res: T[][] = [];
    for (let i = 0; i < n; ++i) {
      const r: T[] = [];
      let j = i;
      for (const a of anys) {
        r.push(...a[j % a.length]);
        j = Math.floor(j / a.length);
      }
      res.push(r);
    }
    return res;
  }

  collect(): T[] {
    return this.choices.flatMap(c => c.collect());
  }
}

class PickN<T> extends Rule<T> {
  constructor(readonly n: number, readonly choices: (Value<T> | Any<T>)[]) { super(); }

  satisfy(): T[][] {
    return [...iterateCombination(this.n, this.choices)].flatMap(ch => new All(ch).satisfy())
  }

  collect(): T[] {
    return this.choices.flatMap(c => c.collect());
  }
}

class Any<T> extends Rule<T> {
  constructor(readonly choices: (Value<T> | All<T> | PickN<T>)[]) { super(); }

  satisfy(): T[][] {
    return this.choices.flatMap(p => p.satisfy())
  }

  collect(): T[] {
    return this.choices.flatMap(c => c.collect());
  }
}

const iterateCombination = function*<T>(n: number, source: T[], picked: T[] = []): Generator<T[]> {
  if (n === 0) yield picked;
  else for (let i = 0; i <= source.length - n; ++i) {
    yield* iterateCombination(n - 1, source.slice(i + 1), picked.concat([source[i]]));
  }
};




export type RequiredCourse = { code: CourseCode; credit: Credit; };
const $course = (code: CourseCode, credit: Credit): Value<RequiredCourse> => new Value({ code, credit });

export const apply = (requiredCourse: RequiredCourse[], to: readonly SpecificReport[]): SpecificReport[] => {
  const yet = requiredCourse.filter(c => !to.some(r => r.course.code == c.code));
  return to.concat(yet.map<SpecificReport>(course => ({ course, grade: '未履修', point: 0, descriotion: '要求科目' })));
};

export type CourseRequirement = All<RequiredCourse>;
export type CourseRequirementsGenerator = (karui: Karui) => CourseRequirement;

// 履修の手引きp.90にあるような説明文を生成する
export const describe = (requirement: CourseRequirement): string =>
  requirement.choices.map((p, i) => `(${ i }) ${ p instanceof Value ? getTitle(p.value.code) : describeAny(p) }`).join('\n')
;
const describeAll = (condition: All<RequiredCourse>): string =>
  `「${ condition.choices.map(p => p instanceof Value ? getTitle(p.value.code) : describeAny(p)).join('、') }」`
;
const describePickN = (condition: PickN<RequiredCourse>): string =>
  `「${ condition.choices.map(p => p instanceof Value ? getTitle(p.value.code) : describeAny(p)).join('、') }」から${ condition.n }科目`
;
const describeAny = (condition: Any<RequiredCourse>): string => {
  if (condition.choices.every(c => c instanceof Value)) {
    const titles = condition.choices.map(c => getTitle((c as Value<RequiredCourse>).value.code));

    let i = 0;
    while (new Set(titles.map(title => title.charAt(i))).size == 1) i += 1;

    if (i == 0) return titles.join('または');
    else return titles[0].slice(0, i);
  }
  return condition.choices.map(p => p instanceof Value ? getTitle(p.value.code) : p instanceof PickN ? describePickN(p) : describeAll(p)).join('または')
};

const allExpe = new Any([
  new All([
    new Any([$course('FC811', 1), $course('FC821', 1)]),
    new Any([$course('FC812', 1), $course('FC822', 1)]),
    new Any([$course('FC813', 1), $course('FC823', 1)]),
  ]),
  new All([
    $course('FC830', 1),
    $course('FC840', 1),
    $course('FC850', 1),
  ]),
]);
const allMath = new All([
  $course('FC871', 2),
  $course('FC873', 1), $course('FC874', 2),
  $course('FC875', 1), $course('FC876', 2),
  $course('FC879', 1), $course('FC87a', 1),
]);
const allMathWithoutP = new All([
  $course('FC871', 2),
  $course('FC873', 1), $course('FC874', 2),
  $course('FC875', 1), $course('FC876', 2),
]);
const math1 = new Any([
  $course('FC651', 2),
  new All([$course('FC873', 1), $course('FC874', 2)]),
]);
const math2 = new Any([
  $course('FC652', 2),
  new All([$course('FC875', 1), $course('FC876', 2)]),
]);
const allMate = new All([
  new Any([$course('FC881', 2), $course('FC882', 2)]),
  new Any([$course('FC883', 2), $course('FC884', 2)]),
  new Any([$course('FC885', 2), $course('FC886', 2)]),
  $course('FC887', 2),
  $course('FC888', 2),
]);
const pickBio = new PickN(1, [
  $course('FC891', 1),
  $course('FC892', 2),
  $course('FC893', 2),
]);

export const none: CourseRequirementsGenerator = () => new All([]);
export const integrated_mathsci: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([ $course('GCF11', 2), $course('GCF12', 2) ])
  : new All([])

export const eeic: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([ math1, math2 ])
  : new All([])


export const ap: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([
        new All([
          $course('FC873', 1),
          $course('FC874', 2),
          $course('FC875', 1),
          $course('FC876', 2),
        ]),
      ]),
      new Any([
        new All([
          new Any([$course('FC881', 2), $course('FC882', 2)]),
          new Any([$course('FC883', 2), $course('FC884', 2)]),
        ]),
      ]),
    ])
  : new All([])


export const appchem: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      allExpe,
      new Any([ new PickN(4, allMate.choices.slice(0, -1)) ]),
      math1,
      math2,
    ])
  : new All([])


export const ms: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([ allMath ]),
      new Any([ new All(allMate.choices.slice(0, -1)) ]),
    ])
  : new All([])

export const phys: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      allExpe,
      new Any([ allMath ]),
      new Any([ allMate ]),
      new Any([ pickBio ]),
    ])
  : new All([])

export const epp: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([ allMathWithoutP ]),
      new Any([
        new All([
          new Any([$course('FC881', 2), $course('FC882', 2)]),
          new Any([$course('FC883', 2), $course('FC884', 2)]),
          new Any([$course('FC885', 2), $course('FC886', 2)]),
        ]),
      ]),
    ])
  : new All([])

export const epe: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([
        allMathWithoutP,
        new All([ $course('GCF15', 2), $course('GCF16', 2) ]),
        new All([ $course('GCF15', 2), $course('FC652', 2) ]),
      ]),
      new Any([
        new PickN(4, allMate.choices.slice(0, -1)),
        new PickN(2, [
          new Any([$course('FC881', 2), $course('FC882', 2)]),
          new Any([$course('FC883', 2), $course('FC884', 2)]),
          $course('GCE1d', 2),
          $course('GCE17', 2),
          $course('GCE44', 2),
        ]),
      ]),
      new Any([
        pickBio,
        new PickN(1, [
          $course('GCE34', 1),
          $course('GCE35', 1),
          $course('GCE51', 2),
          $course('GCE33', 2),
        ]),
      ]),
    ])
  : new All([])

export const biochem: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      allExpe,
      new Any([ allMath ]),
      new Any([ new PickN(4, allMate.choices.slice(0, -1)) ]),
      new Any([ pickBio ]),
    ])
  : new All([])

export const seimeikagaku: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([
        pickBio,
        new PickN(1, [
          $course('GCE34', 1),
          $course('GCE35', 1),
        ]),
      ]),
      new Any([
        new PickN(1, [ $course('FC840', 1), $course('FC850', 1) ]),
      ]),
    ])
  : new All([])

export const veterinary: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([ pickBio ]),
    ])
  : new All([])

export const pharm: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([
        new PickN(2, [
          $course('FC888', 2),
          new Any([$course('FC885', 2), $course('FC886', 2)]),
          $course('FC891', 1),
          $course('FC892', 2),
        ]),
      ]),
    ])
  : new All([])

export const med: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? new All([
      new Any([
        new PickN(1, [ $course('FC892', 2), $course('FC893', 2) ])
      ]),
      allExpe,
    ])
  : karui === 'NS1'
  ? new All([
      new Any([
        new PickN(1, [ $course('FC892', 2), $course('FC893', 2) ])
      ]),
    ])
  : new All([])

