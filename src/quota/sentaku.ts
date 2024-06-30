import {Scope, subCodeKishu, subCodeSecondL, subCodeShoshu} from "../course-code.js";
import {Karui, KishuForeignLang, LanguageOption, ShoshuForeignLang, languageCodeMap} from "../type-utils.js";
import {unreachable} from "../utils.js";
import {Quota, Requirements} from "./definition.js";

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
  const { firstForeignLanguage, secondForeignLanguage } = options.langOption;

  const createQuotaOfKishu = (lang: KishuForeignLang) => {
    const n = ['en', 'ja'].includes(lang) ? 5 : 6;
    return new Quota("既修外国語", n, new Scope([subCodeKishu(lang)]));
  };
  const createQuotaOfShoshu = (lang: ShoshuForeignLang) => {
    return new Quota("初修外国語", 6, new Scope([subCodeShoshu(lang)]));
  };

  return {
    min: bunka ? 46 : rika ? 53 : unreachable("文科と理科のみ"), // もし科類が組み変わってここでエラーが出たらこの関数の実装全部見直す
    quotas: [
      [
        createQuotaOfKishu(firstForeignLanguage),
        secondForeignLanguage.learned
        ? createQuotaOfKishu(secondForeignLanguage.lang)
        : createQuotaOfShoshu(secondForeignLanguage.lang)
        ,
      ],
      bunka
      ? [
          new Quota("初年次ゼミナール文科", 2, new Scope(['FC510'])),
          bunka3rui
          ? new Quota("社会科学", 2, new Scope(['FC6']))
          : new Quota("社会科学", 4, new Scope(['FC6'])).withSub(1, [
              new Quota('法Ⅰ，政治Ⅰ', 2, new Scope(['FC611', 'FC621'])),
          ])
          ,
          new Quota("人文科学", 2, new Scope(['FC7'])),
          new Quota("総合科目", bunka3rui ? 13 : 11, new Scope(['GC', 'FC87', 'FC88', 'FC89', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG'])).withSub(1, [
              new Quota("L系列", 5, new Scope(['GCL'])).withSub(1, secondForeignLanguage.learned ? [] : [
                new Quota(languageCodeMap[secondForeignLanguage.lang] + "語初級（演習）①", 2, new Scope([subCodeSecondL(secondForeignLanguage.lang)])),
              ]),
          ]),
        ]
      : rika
      ? [
          new Quota("初年次ゼミナール理科", 2, new Scope(['FC520'])),
          new Quota("自然科学", 16, new Scope(['FC8'])).withSub(4, rika1rui ? [
            options.exceptionalTreatmentForKisoji
            ? new Quota('基礎実験', 1, new Scope(['FC813', 'FC823']))
            : new Quota('基礎実験', 3, new Scope(['FC81', 'FC82'], ['FC814', 'FC824'])) // 任意科目は含めない
            ,
            new Quota('数理科学', 6, new Scope(['FC87'])).withSub(1, [
              new Quota('数理科学基礎演習', 1, new Scope(['FC878'])),
              new Quota('数学基礎理論演習', 1, new Scope(['FC877'])),
            ]),
            new Quota('物質科学', void 0, new Scope(['FC88'])).withSub(3, [
              new Quota('力学', 2, new Scope(['FC881', 'FC882'])),
              new Quota('熱力学', 2, new Scope(['FC885'])),
              new Quota('物性化学', 2, new Scope(['FC888'])),
            ]),
            new Quota('生命科学', void 0, new Scope(['FC89'])).withSub(1, [
              new Quota('生命科学', 1, new Scope(['FC891'])),
            ]),
          ] : [
            options.exceptionalTreatmentForKisoji
            ? new Quota('基礎実験', 1, new Scope(['FC850']))
            : new Quota('基礎実験', 3, new Scope(['FC830', 'FC840', 'FC850'])) // 任意科目は含めない
            ,
            new Quota('数理科学', 5, new Scope(['FC87'], ['FC877', 'FC878'])),
            new Quota('物質科学', void 0, new Scope(['FC88'])).withSub(3, [
              new Quota('力学', 2, new Scope(['FC881', 'FC882'])),
              new Quota('化学熱力学', 2, new Scope(['FC886'])),
              new Quota('物性化学', 2, new Scope(['FC888'])),
            ]),
            new Quota('生命科学', void 0, new Scope(['FC89'])).withSub(1, [
              new Quota('生命科学Ⅰ', 2, new Scope(['FC892'])),
            ]),
          ]),
          new Quota("総合科目", 8, new Scope(['GC', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG'])).withSub(1, [
            new Quota("L系列", 2, new Scope(['GCL'])),
          ]),
        ]
      : unreachable("文科と理科のみ")
      ,
    ].flat(),
    surplusMin: 0,
    surplusConstraints: [],
  };
};
