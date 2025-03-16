import {Scope, subCodeKishu, subCodeSecondL, subCodeShoshu} from "../course-code.js";
import {isSpecificReport} from "../report.js";
import {Karui, KishuForeignLang, LanguageOption, ShoshuForeignLang, languageCodeMap} from "../type-utils.js";
import {unreachable} from "../utils.js";
import {Quota, CalculationConstraint, Requirements} from "./definition.js";

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
    return new Quota("既修外国語", n, new Scope([subCodeKishu(lang)]));
  };
  const createQuotaOfShoshu = (lang: ShoshuForeignLang) => {
    return new Quota("初修外国語", 6, new Scope([subCodeShoshu(lang)]));
  };
  const firstL = ((lang: LanguageOption['firstForeignLanguage']) => {
    const name = languageCodeMap[lang] + '中級，上級';
    const e = lang == 'en' ? 1 : lang == 'ja' ? 9 : void 0;
    if (e != null) {
      return new Quota(name, 3, new Scope([`GCL${e}`, `GCL${e}`]));
    } else {
      const c = subCodeSecondL(lang as Exclude<KishuForeignLang, 'en' | 'ja'>);
      const s = 'abcdefghijk'.split('').map(e => `${c}${e}`);
      return new Quota(name, 2, new Scope(s as any[]));
    }
  })(options.langOption.firstForeignLanguage);
  const secondL = (({lang,learned}: LanguageOption['secondForeignLanguage']) => {
    if (learned) {
      const name = languageCodeMap[lang] + '中級，上級';
      if (bunka) {
        switch (lang) {
          case 'en': return new Quota(name, options.forCalculation ? 4 : 5, new Scope(['GCL1'])); // 二外に英語を選択した場合要求単位数が重率計算の際の単位数と合致しないのでとりあえずnを出し分けたが，実際にどうなのかはわからない
          case 'ja': return new Quota(name, 4, new Scope(['GCL9', 'GCL9']));
          default: {
            const c = subCodeSecondL(lang);
            const s = 'abcdefghijk'.split('').map(e => `${c}${e}`);
            return new Quota(name, 4, new Scope(s as any[]));
          }
        }
      } else if (lang == 'en' && !options.forCalculation) {
        return new Quota(name, 1, new Scope(['GCL1']));
      }
    } else{
      const c = subCodeSecondL(lang);
      return !bunka ? void 0 : new Quota(languageCodeMap[lang] + '初級（演習）', 4, new Scope([`${c}2`, `${c}3`]));
    }
  })(options.langOption.secondForeignLanguage);

  const isSposhin = new Scope(['GCD41', 'GCD42', 'PGD10', 'PGD20']).pred;
  const sposhinConstraints: CalculationConstraint[] = [
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
  ];
  
  return {
    min: bunka ? 56 : rika ? 63 : unreachable("文科と理科のみ"),
    quotas: [
      new Quota('基礎科目', 0, new Scope(['FC'], bunka ? ['FC87', 'FC88', 'FC89'] : [])).withSub(3, [
        new Quota('外国語', 0, new Scope(['FC1', 'FC2'])).withSub(2, [
          createQuotaOfKishu(options.langOption.firstForeignLanguage),
          options.langOption.secondForeignLanguage.learned
          ? createQuotaOfKishu(options.langOption.secondForeignLanguage.lang)
          : createQuotaOfShoshu(options.langOption.secondForeignLanguage.lang)
          ,
        ]),
          new Quota('情報', 2, new Scope(['FC3'])),
        new Quota('身体運動・健康科学実習', 2, new Scope(['FC4'])),
      ]).withSub(1, [
        new Quota('初年次ゼミナール', bunka || !options.forCalculation ? 2 : 0, new Scope(['FC5'])).withForCalc([
          {
            description: '初年次ゼミナール理科は算入されない',
            references: ['p.57 ③'],
            verify: (_, r) => !new Scope(['FC52']).match(r.course.code),
          }
        ]),
      ]).withSub(3, [
        {
          HSS1: new Quota('社会科学', 8, new Scope(['FC6'])).withSub(1, [
            new Quota('法', 4, new Scope(['FC61'])),
            new Quota('政治', 4, new Scope(['FC62'])),
          ]),
          HSS2: new Quota('社会科学', 8, new Scope(['FC6'])).withSub(1, [
            new Quota('経済，数学', 4, new Scope(['FC63', 'FC65']))
          ]),
          HSS3: new Quota('社会科学', 4, new Scope(['FC6'])).withSub(2, [
            new Quota('法', void 0, new Scope(['FC61'])),
            new Quota('政治', void 0, new Scope(['FC62'])),
            new Quota('経済', void 0, new Scope(['FC63'])),
            new Quota('社会', void 0, new Scope(['FC64'])),
            new Quota('数学', void 0, new Scope(['FC65'])),
          ]),
        }[options.karui as `HSS${1|2|3}`],
        new Quota('人文科学', 4, new Scope(['FC7'])).withSub(2, [
          new Quota('哲学', void 0, new Scope(['FC71'])),
          new Quota('倫理', void 0, new Scope(['FC72'])),
          new Quota('歴史', void 0, new Scope(['FC73'])),
          new Quota('ことばと文学', void 0, new Scope(['FC74'])),
          new Quota('心理', void 0, new Scope(['FC75'])),
        ]),
        new Quota('基礎実験', 0, new Scope(['FC81', 'FC82', 'FC83', 'FC84', 'FC85', 'FC86'])).withForCalc([
          { description: '文科生が履修する基礎実験は算入されない', references: ['p.57 ③'], verify: () => false },
        ]),
      ], bunka).withSub(1, [
        new Quota('自然科学', 0, new Scope(['FC8'])).withSub(4, [
          new Quota('基礎実験', 3, new Scope(['FC81', 'FC82', 'FC83', 'FC84', 'FC85', 'FC86'])).withForCalc([
            {
              description: '任意選択科目は重率1に含めない',
              references: ['p.57 理科生 4)'],
              verify: (_, r, w) => !(w == 1 && new Scope(['FC814', 'FC824', 'FC860']).match(r.course.code)),
            },
          ]),
          new Quota('数理科学', rika1rui ? 12 : 10, new Scope(['FC87'])).withForCalc([
            {
              description: '任意選択科目は重率1に含めない',
              references: ['p.57 理科生 4)'],
              verify: (_, r, w) => !(w == 1 && new Scope(['FC877', 'FC878']).match(r.course.code)),
            },
          ], !rika1rui),
          new Quota('物質科学', 10, new Scope(['FC88'])),
          new Quota('生命科学', rika1rui ? 1 : 4, new Scope(['FC89'])),
        ]),
      ], !bunka).withForCalc([bunka
        ? {
            description: '余った基礎科目は**単位取得**していない場合重率0',
            references: ['p.56 文科生 8)'],
            verify: (_, r, w) => !(w == 0.1 && ['不可', '欠席', '未履修'].includes(r.grade)),
          }
        : {
            description: '任意選択の基礎科目は**単位取得**していない場合重率0',
            references: ['p.56 理科生 6)'],
            verify: (_, r, w) => !(w == 0.1 && ['不可', '欠席', '未履修'].includes(r.grade)),
          },
      ]),
      new Quota('展開科目', 0, new Scope(['IC', 'PI'])).withForCalc([
        {
          description: '展開科目は重率0.1',
          references: [bunka ? 'p.56 文科 9)' : 'p.56 理科 7)'],
          verify: (_, __, w) => w === 0.1,
        },
        {
          description: '社会科学ゼミナールは算入されない',
          references: ['p.56 ②'],
          verify: (_, r, __) => !new Scope(['IC1']).match(r.course.code),
        },
      ]),
      new Quota('総合科目', 0, new Scope([
        'GC', 'PF510', 'PF520', 'PF530', 'PF540', 'PF6', 'PG', ...bunka ? ['FC87', 'FC88', 'FC89'] as const : []
      ])).withSub(1, !bunka3rui ? [] : [
        new Quota('L, A, B, C', 2 + firstL.n! + secondL!.n! + 8, new Scope([
          'GCL', 'GCA', 'GCB', 'GCC',
          'PF510', 'PF520', 'PF530', 'PF540', // 社会科学（PEAK）※数学を除く
          'PF620', 'PF630', // 人文科学 歴史，こと文（PEAK）
          'PGA', 'PGB', 'PGC', // 総合科目A, B, C（PEAK）
        ])).withSub(3, [
          new Quota('L', 2 + firstL.n! + secondL!.n!, new Scope(['GCL'])).withSub(2, [firstL, secondL!]),
          new Quota('A', void 0, new Scope(['GCA', 'PF630', 'PGA'])),
          new Quota('B', void 0, new Scope(['GCB', 'PF540', 'PF620', 'PGB'])),
          new Quota('C', void 0, new Scope(['GCC', 'PF510', 'PF520', 'PF530', 'PGC'])),
        ]),
      ], bunka3rui).withSub(2, !bunka ? [] :  [
          new Quota('L', 2 + firstL.n! + secondL!.n!, new Scope(['GCL'])).withSub(2, [firstL, secondL!]),
          new Quota('A, B, C', 6, new Scope([
            'GCA', 'GCB', 'GCC',
            'PF510', 'PF520', 'PF530', 'PF540', // 社会科学（PEAK）※数学を除く
            'PF620', 'PF630', // 人文科学 歴史，こと文（PEAK）
            'PGA', 'PGB', 'PGC', // 総合科目A, B, C（PEAK）
          ])).withSub(2, [
            new Quota('A', void 0, new Scope(['GCA', 'PF630', 'PGA'])),
            new Quota('B', void 0, new Scope(['GCB', 'PF540', 'PF620', 'PGB'])),
            new Quota('C', void 0, new Scope(['GCC', 'PF510', 'PF520', 'PF530', 'PGC'])),
          ]),
      ], bunka && !bunka3rui).withSub(1, [
        new Quota('D, E, F', bunka3rui ? 8 : 6, new Scope([
          'GCD', 'GCE', 'GCF',
          'PF640',
          'PGD', 'PGE', 'PGF',
          'FC87', 'FC88', 'FC89', // 要求科目のために科類横断して履修した場合
        ])).withSub(2, [
          new Quota('D', void 0, new Scope(['GCD', 'PF640', 'PGD'])).withForCalc(sposhinConstraints),
          new Quota('E', void 0, new Scope(['GCE', 'PGE', 'FC88', 'FC89'])),
          new Quota('F', void 0, new Scope(['GCF', 'PGF', 'FC87'])),
        ]),
      ], bunka).withSub(3, [
        new Quota('L', 0, new Scope(['GCL'])).withSub(...(secondL ? [2, [firstL, secondL]] : [1, [firstL]]) satisfies Parameters<Quota['withSub']>),
        new Quota('A, B, C, D', 6, new Scope([
          'GCA', 'GCB', 'GCC', 'GCD',
          'PF510', 'PF520', 'PF530', 'PF540',
          'PF620', 'PF630', 'PF640',
          'PGA', 'PGB', 'PGC', 'PGD',
        ])).withSub(2, [
          new Quota('A', void 0, new Scope(['GCA', 'PF630', 'PGA'])),
          new Quota('B', void 0, new Scope(['GCB', 'PF540', 'PF620', 'PGB'])),
          new Quota('C', void 0, new Scope(['GCC', 'PF510', 'PF520', 'PF530', 'PGC'])),
          new Quota('D', void 0, new Scope(['GCD', 'PF640', 'PGD'])).withForCalc(sposhinConstraints),
        ]),
        new Quota('E, F', 6, new Scope([
          'GCE', 'GCF',
          'PGE', 'PGF',
        ])).withSub(2, [
          new Quota('E', void 0, new Scope(['GCE', 'PGE'])),
          new Quota('F', void 0, new Scope(['GCF', 'PGF'])),
        ]),
      ], !bunka),
      new Quota('主題科目', options.forCalculation ? 0 : 2, new Scope(['TC', 'PF550', 'PF7', 'PF8', 'PT'])).withForCalc([
        { description: '主題科目は算入されない', references: ['p.57 ②'], verify: () => false },
      ]),
    ],
    surplusMin: bunka ? 4 : rika1rui ? 3 : 2,
    surplusConstraints: [
      {
        description: '基礎科目［社会科学］は2単位まで（文科生のみ）',
        references: ['p.29 7.'],
        verify: (allocated, tobeAdded) => {
          const filter = new Scope(['FC6']).pred;
          return !(filter(tobeAdded.course.code) && allocated.some(c => filter(c.course.code)));
        },
      },
      {
        description: '基礎科目［人文科学］は2単位まで（文科生のみ）',
        references: ['p.29 7.'],
        verify: (allocated, tobeAdded) => {
          const filter = new Scope(['FC7']).pred;
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
