import {subCodeKishu, subCodeSecondL, subCodeShoshu} from "../course-code.js";
import {Karui, KishuForeignLang, LanguageOption, ShoshuForeignLang, languageCodeMap} from "../type-utils.js";
import {unreachable} from "../utils.js";
import {$quota, Requirements, withSub} from "./definition.js";

export type GenerateOptions = {
  karui: Karui;
  langOption: LanguageOption;
  exceptionalTreatmentForKisoji?: boolean;
};
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

  return {
    min: bunka ? 46 : rika ? 53 : unreachable("文科と理科のみ"), // もし科類が組み変わってここでエラーが出たらこの関数の実装全部見直す
    quotas: [
      [
        createQuotaOfKishu(options.langOption.firstForeignLanguage),
        options.langOption.secondForeignLanguage.learned
        ? createQuotaOfKishu(options.langOption.secondForeignLanguage.lang)
        : createQuotaOfShoshu(options.langOption.secondForeignLanguage.lang)
        ,
      ],
      bunka
      ? [
          $quota("初年次ゼミナール文科", 2, { include: ['FC510'] }),
          bunka3rui
          ? $quota("社会科学", 2, { include: ['FC6'] })
          : $quota("社会科学", 4, { include: ['FC6'] }, withSub(1,
              $quota('法Ⅰ，政治Ⅰ', 2, { include: ['FC611', 'FC621'] }),
            ))
          ,
          $quota("人文科学", 2, { include: ['FC7'] }),
          $quota("総合科目", bunka3rui ? 13 : 11,
            { include: ['GC', 'FC87', 'FC88', 'FC89', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG'] },
            withSub(1,
              $quota("L系列", 5, { include: ['GCL'] }, options.langOption.secondForeignLanguage.learned ? undefined : withSub(1,
                $quota(languageCodeMap[options.langOption.secondForeignLanguage.lang] + "語初級（演習）①", 2,
                  { include: [subCodeSecondL(options.langOption.secondForeignLanguage.lang)] },
                ),
              )),
            ),
          ),
        ]
      : rika
      ? [
          $quota("初年次ゼミナール理科", 2, { include: ['FC520'] }),
          $quota("自然科学", 16, { include: ['FC8'] },
            rika1rui
            ? withSub(4,
                options.exceptionalTreatmentForKisoji
                ? $quota('基礎実験', 1, { include: ['FC813', 'FC823'] })
                : $quota('基礎実験', 3, { include: ['FC81', 'FC82'], exclude: ['FC814', 'FC824'] }) // 任意科目は含めない
                ,
                $quota('数理科学', 6, { include: ['FC87'] }, withSub(1,
                  $quota('数理科学基礎演習', 1, { include: ['FC878'] }),
                  $quota('数学基礎理論演習', 1, { include: ['FC877'] }),
                )),
                $quota('物質科学', void 0, { include: ['FC88'] }, withSub(3,
                  $quota('力学', 2, { include: ['FC881', 'FC882'] }),
                  $quota('熱力学', 2, { include: ['FC885'] }),
                  $quota('物性化学', 2, { include: ['FC888'] }),
                )),
                $quota('生命科学', void 0, { include: ['FC89'] }, withSub(1,
                  $quota('生命科学', 1, { include: ['FC891'] }),
                )),
              )
            : withSub(4,
                options.exceptionalTreatmentForKisoji
                ? $quota('基礎実験', 1, { include: ['FC850'] })
                : $quota('基礎実験', 3, { include: ['FC830', 'FC840', 'FC850'] }) // 任意科目は含めない
                ,
                $quota('数理科学', 5, { include: ['FC87'], exclude: ['FC877', 'FC878'] }),
                $quota('物質科学', void 0, { include: ['FC88'] }, withSub(3,
                  $quota('力学', 2, { include: ['FC881', 'FC882'] }),
                  $quota('化学熱力学', 2, { include: ['FC886'] }),
                  $quota('物性化学', 2, { include: ['FC888'] }),
                )),
                $quota('生命科学', void 0, { include: ['FC89'] }, withSub(1,
                  $quota('生命科学Ⅰ', 2, { include: ['FC892'] }),
                )),
              )
            ,
          ),
          $quota("総合科目", 8, { include: ['GC', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG'] }, withSub(1,
            $quota("L系列", 2, { include: ['GCL'] }),
          )),
        ]
      : unreachable("文科と理科のみ")
      ,
    ].flat(),
    surplusMin: 0,
    surplusConstraints: [],
  };
};
