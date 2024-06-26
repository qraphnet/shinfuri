import {isSubcourseOf, subCodeKishu, subCodeSecondL, subCodeShoshu} from "../course-code.js";
import {isSpecificReport} from "../report.js";
import {Karui, KishuForeignLang, LanguageOption, ShoshuForeignLang, languageCodeMap} from "../type-utils.js";
import {unreachable} from "../utils.js";
import {$quota, mergeWithSubs, Requirements, withForCalculation, withSub} from "./definition.js";

export type GenerateOptions = {
  karui: Karui;
  langOption: LanguageOption;
  forCalculation: boolean;
};

/**
 * 修了要件を表現するRequirementsを返す
 */
export const generateRequirements = (options: GenerateOptions): Requirements => {
  const bunka = ['HSS1' , 'HSS2' , 'HSS3'].includes(options.karui);
  const bunka3rui = options.karui === 'HSS3';
  const rika = ['NS1' , 'NS2' , 'NS3'].includes(options.karui);
  const rika1rui = options.karui === 'NS1';

  const createQuotaOfKishu = (lang: KishuForeignLang) => {
    const n = ['en', 'ja'].includes(lang) ? 5 : 6;
    return $quota("既修外国語", n, { include: [subCodeKishu(lang)] });
  };
  const createQuotaOfShoshu = (lang: ShoshuForeignLang) => {
    return $quota("初修外国語", 6, { include: [subCodeShoshu(lang)] });
  };
  const firstL = ((lang: LanguageOption['firstForeignLanguage']) => {
    const name = languageCodeMap[lang] + '中級，上級';
    const e = lang == 'en' ? 1 : lang == 'ja' ? 9 : void 0;
    if (e != null) {
      return $quota(name, 3, { include: [`GCL${e}`, `GCL${e}`] });
    } else {
      const c = subCodeSecondL(lang as Exclude<KishuForeignLang, 'en' | 'ja'>);
      const s = 'abcdefghijk'.split('').map(e => `${c}${e}`);
      return $quota(name, 2, { include: s as any[] });
    }
  })(options.langOption.firstForeignLanguage);
  const secondL = (({lang,learned}: LanguageOption['secondForeignLanguage']) => {
    if (learned) {
      const name = languageCodeMap[lang] + '中級，上級';
      if (bunka) {
        switch (lang) {
          case 'en': return $quota(name, options.forCalculation ? 4 : 5, { include: ['GCL1'] }); // 二外に英語を選択した場合要求単位数が重率計算の際の単位数と合致しないのでとりあえずnを出し分けたが，実際にどうなのかはわからない
          case 'ja': return $quota(name, 4, { include: ['GCL9', 'GCL9'] });
          default: {
            const c = subCodeSecondL(lang);
            const s = 'abcdefghijk'.split('').map(e => `${c}${e}`);
            return $quota(name, 4, { include: s as any[] });
          }
        }
      } else if (lang == 'en' && !options.forCalculation) {
        return $quota(name, 1, { include: ['GCL1'] });
      }
    } else{
      const c = subCodeSecondL(lang);
      return !bunka ? void 0 : $quota(languageCodeMap[lang] + '初級（演習）', 4, { include: [`${c}2`, `${c}3`] });
    }
  })(options.langOption.secondForeignLanguage);

  const isSposhin = isSubcourseOf('GCD41', 'GCD42', 'PGD10', 'PGD20');
  const sposhinConstraints = withForCalculation(
    {
      description: 'スポーツ・身体運動実習が重率1で算入されるのは2単位まで',
      references: ['p.57 ⑤'],
      verify: (rs, r, w) => !(w == 1.0 && isSposhin(r.course.code) && rs.filter(r => isSpecificReport(r) && isSposhin(r.course.code)).length >= 2),
    },
    {
      description: 'スポーツ・身体運動実習が重率0.1で算入されるのは1単位まで',
      references: ['p.57 ⑤'],
      verify: (rs, r, w) => !(w == 0.1 && isSposhin(r.course.code) && rs.filter(r => isSpecificReport(r) && isSposhin(r.course.code)).length >= 1),
    },
  )
  
  return {
    min: bunka ? 56 : rika ? 63 : unreachable("文科と理科のみ"),
    quotas: [
      $quota('基礎科目', 0, { include: ['FC'], exclude: bunka ? ['FC87', 'FC88', 'FC89'] : [] }, mergeWithSubs(
        withSub(3,
          $quota('外国語', 0, { include: ['FC1', 'FC2'] }, withSub(2,
            createQuotaOfKishu(options.langOption.firstForeignLanguage),
            options.langOption.secondForeignLanguage.learned
            ? createQuotaOfKishu(options.langOption.secondForeignLanguage.lang)
            : createQuotaOfShoshu(options.langOption.secondForeignLanguage.lang)
            ,
          )),
            $quota('情報', 2, { include: ['FC3'] }),
          $quota('身体運動・健康科学実習', 2, { include: ['FC4'] }),
        ),
        withSub(1,
          $quota('初年次ゼミナール', bunka || !options.forCalculation ? 2 : 0, { include: ['FC5'] }, void 0, withForCalculation(
            { description: '初年次ゼミナール理科は算入されない', references: ['p.57 ③'], verify: (_, r) => !isSubcourseOf('FC52')(r.course.code) },
          )),
        ),
        bunka
        ? withSub(3,
            {
              HSS1: $quota('社会科学', 8, { include: ['FC6'] }, withSub(1,
                $quota('法', 4, { include: ['FC61'] }),
                $quota('政治', 4, { include: ['FC62'] }),
              )),
              HSS2: $quota('社会科学', 8, { include: ['FC6'] }, withSub(1,
                $quota('経済，数学', 4, { include: ['FC63', 'FC65'] })
              )),
              HSS3: $quota('社会科学', 4, { include: ['FC6'] }, withSub(2,
                $quota('法', void 0, { include: ['FC61'] }),
                $quota('政治', void 0, { include: ['FC62'] }),
                $quota('経済', void 0, { include: ['FC63'] }),
                $quota('社会', void 0, { include: ['FC64'] }),
                $quota('数学', void 0, { include: ['FC65'] }),
              )),
            }[options.karui as `HSS${1|2|3}`],
            $quota('人文科学', 4, { include: ['FC7'] }, withSub(2,
              $quota('哲学', void 0, { include: ['FC71'] }),
              $quota('倫理', void 0, { include: ['FC72'] }),
              $quota('歴史', void 0, { include: ['FC73'] }),
              $quota('ことばと文学', void 0, { include: ['FC74'] }),
              $quota('心理', void 0, { include: ['FC75'] }),
            )),
            $quota('基礎実験', 0, { include: ['FC81', 'FC82', 'FC83', 'FC84', 'FC85', 'FC86'] }, void 0, withForCalculation(
              { description: '文科生が履修する基礎実験は算入されない', references: ['p.57 ③'], verify: () => false },
            )),
          )
        : withSub(1,
            $quota('自然科学', 0, { include: ['FC8'] }, withSub(4,
              $quota('基礎実験', 3, { include: ['FC81', 'FC82', 'FC83', 'FC84', 'FC85', 'FC86'] }, void 0, withForCalculation(
                { description: '任意選択科目は重率1に含めない', references: ['p.57 理科生 4)'], verify: (_, r, w) => !(w == 1 && isSubcourseOf('FC814', 'FC824', 'FC860')(r.course.code)) },
              )),
              $quota('数理科学', rika1rui ? 12 : 10, { include: ['FC87'] }, void 0, rika1rui ? void 0 : withForCalculation(
                { description: '任意選択科目は重率1に含めない', references: ['p.57 理科生 4)'], verify: (_, r, w) => !(w == 1 && isSubcourseOf('FC877', 'FC878')(r.course.code)) }
              )),
              $quota('物質科学', 10, { include: ['FC88'] }),
              $quota('生命科学', rika1rui ? 1 : 4, { include: ['FC89'] }),
            )),
          )
        ,
      ), withForCalculation(
        bunka ? { description: '余った基礎科目は**単位取得**していない場合重率0', references: ['p.56 文科生 8)'], verify: (_, r, w) => !(w == 0.1 && ['不可', '欠席', '未履修'].includes(r.grade)) }
              : { description: '任意選択の基礎科目は**単位取得**していない場合重率0', references: ['p.56 理科生 6)'], verify: (_, r, w) => !(w == 0.1 && ['不可', '欠席', '未履修'].includes(r.grade)) },
      )),
      $quota('展開科目', 0, { include: ['IC', 'PI'] }, void 0, withForCalculation(
        { description: '展開科目は重率0.1', references: [bunka ? 'p.56 文科 9)' : 'p.56 理科 7)'], verify: (_, __, w) => w === 1.0 },
        { description: '社会科学ゼミナールは算入されない', references: ['p.56 ②'], verify: (_, r, __) => !isSubcourseOf('IC1')(r.course.code) },
      )),
      $quota('総合科目', 0,{ include: ['GC', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG', ...(bunka ? ['FC87', 'FC88', 'FC89'] as const : [])] },
        bunka
        ? mergeWithSubs(
            bunka3rui
            ? withSub(1,
                $quota(
                  'L, A, B, C',
                  17,
                  { include: [
                    'GCL', 'GCA', 'GCB', 'GCC',
                    'PF510', 'PF520', 'PF530', 'PF540', // 社会科学（PEAK）※数学を除く
                    'PF620', 'PF630', // 人文科学 歴史，こと文（PEAK）
                    'PGA', 'PGB', 'PGC', // 総合科目A, B, C（PEAK）
                  ] },
                  withSub(3,
                    $quota('L', 2 + firstL.n! + secondL!.n!, { include: ['GCL'] }, withSub(2, firstL, secondL!)),
                    $quota('A', void 0, { include: ['GCA', 'PF630', 'PGA'] }),
                    $quota('B', void 0, { include: ['GCB', 'PF540', 'PF620', 'PGB'] }),
                    $quota('C', void 0, { include: ['GCC', 'PF510', 'PF520', 'PF530', 'PGC'] }),
                  ),
                ),
              )
            : withSub(2,
                $quota('L', 2 + firstL.n! + secondL!.n!, { include: ['GCL'] }, withSub(2, firstL, secondL!)),
                $quota(
                  'A, B, C',
                  6,
                  { include: [
                    'GCA', 'GCB', 'GCC',
                    'PF510', 'PF520', 'PF530', 'PF540', // 社会科学（PEAK）※数学を除く
                    'PF620', 'PF630', // 人文科学 歴史，こと文（PEAK）
                    'PGA', 'PGB', 'PGC', // 総合科目A, B, C（PEAK）
                  ] },
                  withSub(2,
                    $quota('A', void 0, { include: ['GCA', 'PF630', 'PGA'] }),
                    $quota('B', void 0, { include: ['GCB', 'PF540', 'PF620', 'PGB'] }),
                    $quota('C', void 0, { include: ['GCC', 'PF510', 'PF520', 'PF530', 'PGC'] }),
                  ),
                ),
              )
            ,
            withSub(1,
              $quota(
                'D, E, F',
                bunka3rui ? 8 : 6,
                { include: [
                  'GCD', 'GCE', 'GCF',
                  'PF640',
                  'PGD', 'PGE', 'PGF',
                  'FC87', 'FC88', 'FC89', // 要求科目のために科類横断して履修した場合
                ] },
                withSub(2,
                  $quota('D', void 0, { include: ['GCD', 'PF640', 'PGD'] }, void 0, sposhinConstraints),
                  $quota('E', void 0, { include: ['GCE', 'PGE', 'FC88', 'FC89'] }),
                  $quota('F', void 0, { include: ['GCF', 'PGF', 'FC87'] }),
                ),
              ),
            )
          )
        : withSub(3,
            $quota('L', 0, { include: ['GCL'] }, secondL ? withSub(2, firstL, secondL) : withSub(1, firstL)),
            $quota(
              'A, B, C, D',
              6,
              { include: [
                'GCA', 'GCB', 'GCC', 'GCD',
                'PF510', 'PF520', 'PF530', 'PF540',
                'PF620', 'PF630', 'PF640',
                'PGA', 'PGB', 'PGC', 'PGD',
              ] },
              withSub(2,
                $quota('A', void 0, { include: ['GCA', 'PF630', 'PGA'] }),
                $quota('B', void 0, { include: ['GCB', 'PF540', 'PF620', 'PGB'] }),
                $quota('C', void 0, { include: ['GCC', 'PF510', 'PF520', 'PF530', 'PGC'] }),
                $quota('D', void 0, { include: ['GCD', 'PF640', 'PGD'] }, void 0, sposhinConstraints),
              ),
            ),
            $quota(
              'E, F',
              6,
              { include: [
                'GCE', 'GCF',
                'PGE', 'PGF',
              ] },
              withSub(2,
                $quota('E', void 0, { include: ['GCE', 'PGE'] }),
                $quota('F', void 0, { include: ['GCF', 'PGF'] }),
              ),
            ),
          )
        ,
      ),
      $quota('主題科目', options.forCalculation ? 0 : 2, { include: ['TC', 'PF550', 'PF7', 'PF8', 'PT'] }, void 0, withForCalculation(
        { description: '主題科目は算入されない', references: ['p.57 ②'], verify: () => false },
      )),
    ],
    surplusMin: bunka ? 4 : rika1rui ? 3 : 2,
    surplusConstraints: [
      {
        description: '基礎科目［社会科学］は2単位まで（文科生のみ）',
        references: ['p.29 7.'],
        verify: (allocated, tobeAdded) => {
          const filter = isSubcourseOf('FC6');
          return !(filter(tobeAdded.course.code) && allocated.some(c => filter(c.course.code)));
        },
      },
      {
        description: '基礎科目［人文科学］は2単位まで（文科生のみ）',
        references: ['p.29 7.'],
        verify: (allocated, tobeAdded) => {
          const filter = isSubcourseOf('FC7');
          return !(filter(tobeAdded.course.code) && allocated.some(c => filter(c.course.code)));
        },
      },
      {
        description: 'スポ身は1単位まで',
        references: ['p.29 7.'],
        verify: (allocated, tobeAdded) => {
          const predicate = isSposhin;
          return !(predicate(tobeAdded.course.code) && allocated.some(c => predicate(c.course.code)));
        },
      },
    ],
  };
};
