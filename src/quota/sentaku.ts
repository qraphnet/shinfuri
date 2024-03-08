import {$and, $not, isSubcourseOf} from "../course-code.js";
import {Karui, KishuForeignLang, ShoshuForeignLang, languageCodeMap} from "../type-utils.js";
import {unreachable} from "../utils.js";
import {$quota, Requirements, withSub} from "./definition.js";

export type GenerateOptions = {
  karui: Karui;
  firstForeignLanguage: KishuForeignLang;
  secondForeignLanguage:
    | { lang: KishuForeignLang; learned: true; }
    | { lang: ShoshuForeignLang; learned: false; }
  ;
  exceptionalTreatmentForKisoji?: boolean;
};
export const generateRequirements = (options: GenerateOptions): Requirements => {
  const bunka = ['HSS1' , 'HSS2' , 'HSS3'].includes(options.karui);
  const bunka3rui = options.karui === 'HSS3';
  const rika = ['NS1' , 'NS2' , 'NS3'].includes(options.karui);
  const rika1rui = options.karui === 'NS1';

  const createQuotaOfKishu = (lang: KishuForeignLang) => {
    const n = ['en', 'ja'].includes(lang) ? 5 : 6;
    const d = ({ en: 1, de: 2, fr: 3, zh: 4, ru: 5, es: 6, ko: 7, it: 8, ja: 9 } as const)[lang];
    return $quota("既修外国語", n, isSubcourseOf(`FC1${d}`));
  };
  const createQuotaOfShoshu = (lang: ShoshuForeignLang) => {
    const d = ({ de: 1, fr: 2, zh: 3, ru: 4, es: 5, ko: 6, it: 7 } as const)[lang];
    return $quota("初修外国語", 6, isSubcourseOf(`FC2${d}`))
  };

  return {
    min: bunka ? 46 : rika ? 53 : unreachable("文科と理科のみ"), // もし科類が組み変わってここでエラーが出たらこの関数の実装全部見直す
    quotas: [
      [
        createQuotaOfKishu(options.firstForeignLanguage),
        options.secondForeignLanguage.learned
        ? createQuotaOfKishu(options.secondForeignLanguage.lang)
        : createQuotaOfShoshu(options.secondForeignLanguage.lang)
        ,
      ],
      bunka
      ? [
          $quota("初年次ゼミナール文科", 2, isSubcourseOf('FC510')),
          bunka3rui
          ? $quota("社会科学", 2, isSubcourseOf('FC6'))
          : $quota("社会科学", 4, isSubcourseOf('FC6'), withSub(1,
              $quota('法Ⅰ，政治Ⅰ', 2, isSubcourseOf('FC611', 'FC621')),
            ))
          ,
          $quota("人文科学", 2, isSubcourseOf('FC7')),
          $quota("総合科目", bunka3rui ? 13 : 11,
            isSubcourseOf('GC', 'FC87', 'FC88', 'FC89', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG'),
            withSub(1,
              $quota("L系列", 5, isSubcourseOf('GCL'), options.secondForeignLanguage.learned ? undefined : withSub(1,
                $quota(languageCodeMap[options.secondForeignLanguage.lang] + "語初級（演習）①", 2,
                  isSubcourseOf(`GCL${({ de: 1, fr: 2, zh: 3, ru: 4, es: 5, ko: 6, it: 7 } as const)[options.secondForeignLanguage.lang]}`),
                ),
              )),
            ),
          ),
        ]
      : rika
      ? [
          $quota("初年次ゼミナール理科", 2, isSubcourseOf('FC520')),
          $quota("自然科学", 16, isSubcourseOf('FC8'),
            rika1rui
            ? withSub(4,
                options.exceptionalTreatmentForKisoji
                ? $quota('基礎実験', 1, isSubcourseOf('FC813', 'FC823'))
                : $quota('基礎実験', 3, $and(isSubcourseOf('FC81', 'FC82'), $not(isSubcourseOf('FC814', 'FC824')))) // 任意科目は含めない
                ,
                $quota('数理科学', 6, isSubcourseOf('FC87'), withSub(1,
                  $quota('数理科学基礎演習', 1, isSubcourseOf('FC878')),
                  $quota('数学基礎理論演習', 1, isSubcourseOf('FC877')),
                )),
                $quota('物質科学', void 0, isSubcourseOf('FC88'), withSub(3,
                  $quota('力学', 2, isSubcourseOf('FC881', 'FC882')),
                  $quota('熱力学', 2, isSubcourseOf('FC885')),
                  $quota('物性化学', 2, isSubcourseOf('FC888')),
                )),
                $quota('生命科学', void 0, isSubcourseOf('FC89'), withSub(1,
                  $quota('生命科学', 1, isSubcourseOf('FC891')),
                )),
              )
            : withSub(4,
                options.exceptionalTreatmentForKisoji
                ? $quota('基礎実験', 1, isSubcourseOf('FC850'))
                : $quota('基礎実験', 3, isSubcourseOf('FC830', 'FC840', 'FC850')) // 任意科目は含めない
                ,
                $quota('数理科学', 5, $and(isSubcourseOf('FC87'), $not(isSubcourseOf('FC877', 'FC878')))),
                $quota('物質科学', void 0, isSubcourseOf('FC88'), withSub(3,
                  $quota('力学', 2, isSubcourseOf('FC881', 'FC882')),
                  $quota('化学熱力学', 2, isSubcourseOf('FC886')),
                  $quota('物性化学', 2, isSubcourseOf('FC888')),
                )),
                $quota('生命科学', void 0, isSubcourseOf('FC89'), withSub(1,
                  $quota('生命科学Ⅰ', 2, isSubcourseOf('FC892')),
                )),
              )
            ,
          ),
          $quota("総合科目", 8, isSubcourseOf('GC', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG'), withSub(1,
            $quota("L系列", 2, isSubcourseOf('GCL')),
          )),
        ]
      : unreachable("文科と理科のみ")
      ,
    ].flat(),
    surplusMin: 0,
    surplusConstraints: [],
  };
};
