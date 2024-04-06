import {CourseCode, isSubcourseOf, subCodeKishu, subCodeShoshu} from "./course-code.js";
import {Credit} from "./course.js";
import {SpecificScoredReport} from "./report.js";
import {LanguageOption} from "./type-utils.js";

const averagePointOf = (reports: SpecificScoredReport[]) =>
  reports.reduce((s, r) => s + r.point * r.course.credit, 0) / reports.reduce((s, r) => s + r.course.credit, 0);
const isNotTaken = (report: SpecificScoredReport) => ['不可', '欠席', '未履修'].includes(report.grade);

export const collectCreditedAvg = (reports: SpecificScoredReport[], languageOption: LanguageOption, group: 1 | 2 | 3 | 4): Set<SpecificScoredReport> => {
  const res = new Set<SpecificScoredReport>;
  // 第一外国語
  {
    const { firstForeignLanguage: lang } = languageOption, subcode = subCodeKishu(lang);
    const rules: Rule[] =
      lang == 'en' ? [
        { scope: isSubcourseOf(subcode), n: 4, threshold: 50 },
        { scope: isSubcourseOf(`${subcode}2`, `${subcode as 'FC11'}${group === 1 || group === 3 ? 4 : 3}`), n: 2, threshold: 50 },
      ] :
      lang == 'ja' ? [
        { scope: isSubcourseOf(subcode), n: 3, threshold: 50 },
        { scope: isSubcourseOf(`${subcode}2`), n: 1, threshold: 50 },
      ] :
      [
        { scope: isSubcourseOf(`${subcode}1`, `${subcode}3`), n: 2, threshold: 40 },
        { scope: isSubcourseOf(`${subcode}2`), n: 1, threshold: 40 },
        { scope: isSubcourseOf(subcode), n: 3, threshold: 50 },
      ]
    ;
    collect(rules, reports).forEach(r => res.add(r));
  }
  
  // 第二外国語
  {
    const { secondForeignLanguage: { lang } } = languageOption;
    let rules: Rule[];
    if (lang == 'en') {
      const subcode = subCodeKishu(lang);
      if (subcode !== 'FC11') throw new Error('壊れてるよ！');
      rules = [
        { scope: isSubcourseOf(`${subcode}2`, `${subcode}${group === 1 || group === 3 ? 4 : 3}`), n: 2, threshold: 50 },
        { scope: isSubcourseOf(subcode), n: 3, threshold: 50 },
      ];
    } else if (lang == 'ja') {
      const subcode = subCodeKishu(lang);
      if (subcode !== 'FC19') throw new Error('壊れてるよ！');
      rules = [
        { scope: isSubcourseOf(`${subcode}1`, `${subcode}3`, `${subcode}4`), n: 2, threshold: 40 },
        { scope: isSubcourseOf(`${subcode}2`), n: 1, threshold: 40 },
        { scope: isSubcourseOf(subcode), n: 3, threshold: 50 },
      ];
    } else {
      const subcode = subCodeShoshu(lang);
      rules = [
        { scope: isSubcourseOf(`${subcode}1`, `${subcode}3`), n: 2, threshold: 40 },
        { scope: isSubcourseOf(`${subcode}2`), n: 1, threshold: 40 },
        { scope: isSubcourseOf(subcode), n: 3, threshold: 50 },
      ];
    }
    collect(rules, reports).forEach(r => res.add(r));
  }

  // 身体運動・健康科学実習
  {
    const rules = [
        { scope: isSubcourseOf('FC4'), n: 2, threshold: 50 },
    ];
    collect(rules, reports).forEach(r => res.add(r));
  }

  return res;
};

type Rule = {
  scope: (code: CourseCode) => boolean;
  n: number;
  threshold: number;
};

const collect = (rules: Rule[], reports: SpecificScoredReport[]): SpecificScoredReport[] => {
  const flag = rules.every(({ scope, n, threshold }) => {
    const target = reports.filter(r => scope(r.course.code));
    return target.length === n && averagePointOf(target) >= threshold;
  });
  return flag ? reports.filter(isNotTaken).filter(re => rules.some(ru => ru.scope(re.course.code))) : [];
}

const one = isSubcourseOf(
  'FC111', 'FC112', 'FC113',
  'FC193', 'FC194',
  'FC4',
  'FC81', 'FC82', 'FC83', 'FC84', 'FC85', 'FC86',
  'FC873', 'FC875', 'FC877', 'FC878', 'FC879', 'FC87a',
  'FC891'
);
const fc = isSubcourseOf('FC');
export const creditOfCourse = (code: CourseCode): Credit | undefined => {
  return one(code) ? 1 : fc(code) ? 2 : undefined;
};

