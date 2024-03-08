import {CourseCode, getTitle} from "../course-code.js";
import {Credit} from "../course.js";
import {SpecificReport} from "../report.js";
import {Karui} from "../type-utils.js";

// 要求科目を表現するためのユーティリティを定義する
type Value<T> = { type: 'value'; value: T };
type All<T> = { type: 'all'; choices: (Value<T> | Any<T>)[]; };
type PickN<T> = { type: 'pickN'; n: number; choices: (Value<T> | Any<T>)[]; };
type Any<T> = { type: 'any'; choices: (Value<T> | All<T> | PickN<T>)[] };

const $v = <T>(value: T): Value<T> => ({ type: 'value', value });
const $all = <T>(choices: All<T>['choices']): All<T> => ({ type: 'all', choices });
const $pickN = <T>(n: number, choices: PickN<T>['choices']): PickN<T> => ({ type: 'pickN', n, choices });
const $any = <T>(choices: Any<T>['choices']): Any<T> => ({ type: 'any', choices });

// 一部の進学単位の指定重率では要求科目を参照するので，含まれてるやつを全部集める関数を定義した．
export const collectAllChoices = <T>(condition: Value<T> | All<T> | PickN<T> | Any<T>): T[] => {
  switch (condition.type) {
    case 'value': return [condition.value];
    default: return condition.choices.flatMap<T>(collectAllChoices);
  }
};

// 要求を満たすパターンを全列挙する
export const satisfy = <T>(condition: All<T>): T[][] => {
  const anys = condition.choices.map(p => p.type == 'any' ? choose(p) : [[p.value]]);
  anys.reverse();
  const n = anys.reduce((p, c) => p + c.length, 0);
  const res: T[][] = [];
  for (let i = 0; i < n; ++i) {
    const r: T[] = [];
    let j = i;
    for (const a of anys) {
      r.push(...a[j % a.length]);
      j /= a.length;
    }
    res.push(r);
  }
  return res;
};
const pick = <T>(condition: PickN<T>): T[][] => {
  return [...iterateCombination(condition.n, condition.choices)].flatMap(ch => satisfy($all(ch)));
}
const iterateCombination = function*<T>(n: number, source: T[], picked: T[] = []): Generator<T[]> {
  if (n === 0) yield picked;
  else for (let i = 0; i <= source.length - n; ++i) {
    yield* iterateCombination(n - 1, source.slice(i + 1), picked.concat([source[i]]));
  }
};
const choose = <T>(condition: Any<T>): T[][] => {
  return condition.choices.flatMap(p => p.type == 'all' ? satisfy(p) : p.type == 'pickN' ? pick(p) : [[p.value]]);
}

export type RequiredCourse = { code: CourseCode; credit: Credit; };
const $course = (code: CourseCode, credit: Credit): Value<RequiredCourse> => $v({ code, credit });

export const apply = (requiredCourse: RequiredCourse[], to: readonly SpecificReport[]): SpecificReport[] => {
  const yet = requiredCourse.filter(c => !to.some(r => r.course.code == c.code));
  return to.concat(yet.map<SpecificReport>(course => ({ type: 'unenrolled-specific', course, grade: '未履修', point: 0, descriotion: '要求科目' })));
};

export type CourseRequirement = All<RequiredCourse>;
export type CourseRequirementsGenerator = (karui: Karui) => CourseRequirement;

// 履修の手引きp.90にあるような説明文を生成する
export const describe = (requirement: CourseRequirement): string =>
  requirement.choices.map((p, i) => `(${ i }) ${ p.type == 'value' ? getTitle(p.value.code) : describeAny(p) }`).join('\n')
;
const describeAll = (condition: All<RequiredCourse>): string =>
  `「${ condition.choices.map(p => p.type == 'value' ? getTitle(p.value.code) :  describeAny(p)).join('、') }」`
;
const describePickN = (condition: PickN<RequiredCourse>): string =>
  `「${ condition.choices.map(p => p.type == 'value' ? getTitle(p.value.code) :  describeAny(p)).join('、') }」から${ condition.n }科目`
;
const describeAny = (condition: Any<RequiredCourse>): string => {
  if (condition.choices.every(c => c.type == 'value')) {
    const titles = condition.choices.map(c => getTitle((c as Value<RequiredCourse>).value.code));

    let i = 0;
    while (new Set(titles.map(title => title.charAt(i))).size == 1) i += 1;

    if (i == 0) return titles.join('または');
    else return titles[0].slice(0, i);
  }
  return condition.choices.map(p => p.type == 'value' ? getTitle(p.value.code) : p.type == 'pickN' ? describePickN(p) : describeAll(p)).join('または')
};

const allExpe = $any([
  $all([
    $any([$course('FC811', 1), $course('FC821', 1)]),
    $any([$course('FC812', 1), $course('FC822', 1)]),
    $any([$course('FC813', 1), $course('FC823', 1)]),
  ]),
  $all([
    $course('FC830', 1),
    $course('FC840', 1),
    $course('FC850', 1),
  ]),
]);
const allMath = $all([
  $course('FC871', 2),
  $course('FC873', 1), $course('FC874', 2),
  $course('FC875', 1), $course('FC876', 2),
  $course('FC879', 1), $course('FC87a', 1),
]);
const allMathWithoutP = $all([
  $course('FC871', 2),
  $course('FC873', 1), $course('FC874', 2),
  $course('FC875', 1), $course('FC876', 2),
]);
const math1 = $any([
  $course('FC651', 2),
  $all([$course('FC873', 1), $course('FC874', 2)]),
]);
const math2 = $any([
  $course('FC652', 2),
  $all([$course('FC875', 1), $course('FC876', 2)]),
]);
const allMate = $all([
  $any([$course('FC881', 2), $course('FC882', 2)]),
  $any([$course('FC883', 2), $course('FC884', 2)]),
  $any([$course('FC885', 2), $course('FC886', 2)]),
  $course('FC887', 2),
  $course('FC888', 2),
]);
const pickBio = $pickN(1, [
  $course('FC891', 1),
  $course('FC892', 2),
  $course('FC893', 2),
]);

export const none: CourseRequirementsGenerator = () => $all([]);
export const integrated_mathsci: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([ $course('GCF11', 2), $course('GCF12', 2) ])
  : $all([])

export const eeic: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([ math1, math2 ])
  : $all([])


export const ap: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([
        $all([
          $course('FC873', 1),
          $course('FC874', 2),
          $course('FC875', 1),
          $course('FC876', 2),
        ]),
      ]),
      $any([
        $all([
          $any([$course('FC881', 2), $course('FC882', 2)]),
          $any([$course('FC883', 2), $course('FC884', 2)]),
        ]),
      ]),
    ])
  : $all([])


export const appchem: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      allExpe,
      $any([ $pickN(4, allMate.choices.slice(0, -1)) ]),
      math1,
      math2,
    ])
  : $all([])


export const ms: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([ allMath ]),
      $any([ $all(allMate.choices.slice(0, -1)) ]),
    ])
  : $all([])

export const phys: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      allExpe,
      $any([ allMath ]),
      $any([ allMate ]),
      $any([ pickBio ]),
    ])
  : $all([])

export const epp: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([ allMathWithoutP ]),
      $any([
        $all([
          $any([$course('FC881', 2), $course('FC882', 2)]),
          $any([$course('FC883', 2), $course('FC884', 2)]),
          $any([$course('FC885', 2), $course('FC886', 2)]),
        ]),
      ]),
    ])
  : $all([])

export const epe: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([
        allMathWithoutP,
        $all([ $course('GCF15', 2), $course('GCF16', 2) ]),
        $all([ $course('GCF15', 2), $course('FC652', 2) ]),
      ]),
      $any([
        $pickN(4, allMate.choices.slice(0, -1)),
        $pickN(2, [
          $any([$course('FC881', 2), $course('FC882', 2)]),
          $any([$course('FC883', 2), $course('FC884', 2)]),
          $course('GCE1d', 2),
          $course('GCE17', 2),
          $course('GCE44', 2),
        ]),
      ]),
      $any([
        pickBio,
        $pickN(1, [
          $course('GCE34', 1),
          $course('GCE35', 1),
          $course('GCE51', 2),
          $course('GCE33', 2),
        ]),
      ]),
    ])
  : $all([])

export const biochem: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      allExpe,
      $any([ allMath ]),
      $any([ $pickN(4, allMate.choices.slice(0, -1)) ]),
      $any([ pickBio ]),
    ])
  : $all([])

export const seimeikagaku: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([
        pickBio,
        $pickN(1, [
          $course('GCE34', 1),
          $course('GCE35', 1),
        ]),
      ]),
      $any([
        $pickN(1, [ $course('FC840', 1), $course('FC850', 1) ]),
      ]),
    ])
  : $all([])

export const veterinary: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([ pickBio ]),
    ])
  : $all([])

export const pharm: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([
        $pickN(2, [
          $course('FC888', 2),
          $any([$course('FC885', 2), $course('FC886', 2)]),
          $course('FC891', 1),
          $course('FC892', 2),
        ]),
      ]),
    ])
  : $all([])

export const med: CourseRequirementsGenerator = karui =>
  karui.startsWith('HSS')
  ? $all([
      $any([
        $pickN(1, [ $course('FC892', 2), $course('FC893', 2) ])
      ]),
      allExpe,
    ])
  : karui === 'NS1'
  ? $all([
      $any([
        $pickN(1, [ $course('FC892', 2), $course('FC893', 2) ])
      ]),
    ])
  : $all([])

