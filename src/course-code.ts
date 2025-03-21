// by reference of https://www.u-tokyo.ac.jp/ja/students/classes/course-numbering.html

import {Digit, SmallAlphabet, FirstNChars, KishuForeignLang, ShoshuForeignLang, LanguageOption} from "./type-utils.js";

// 開講学科・専攻等コード
type DepartmentCode = 'FC' | 'IC' | 'GC' | 'TC' | 'PF' | 'PI' | 'PG' | 'PT';
// 整理番号
type SerialNumber = `${Exclude<Digit, '0'> | 'L' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' }${Digit | SmallAlphabet}${Digit | SmallAlphabet}`;
// 共通科目コードのうち，開講学科コード（実質的には科目区分）と整理番号のみとりだしてつなげて，このプログラム内での科目コードとした
export type CourseCode = { [K in keyof SerialNumberMap]: `${K}${ SerialNumberMap[K] extends infer T ? {[L in keyof T]: L }[keyof T] : never }` }[keyof SerialNumberMap];
export type CourseCodePrefix = FirstNChars<CourseCode>;
export class Scope {
  constructor(readonly include: CourseCodePrefix[], readonly exclude: CourseCodePrefix[] = []) {}
  match(code: CourseCodePrefix): boolean {
    return this.include.some(prefix => code.startsWith(prefix)) && this.exclude.every(prefix => !code.startsWith(prefix));
  }
  includes(inner: Scope): boolean {
    return inner.include.every(prefix => this.match(prefix as any)) && this.exclude.every(prefix => !inner.match(prefix as any));
  }
  get pred(): (code: CourseCodePrefix) => boolean {
    return this.match.bind(this);
  }
}

// 科目コードの順序を定義（整理番号表（https://www.c.u-tokyo.ac.jp/zenki/z-numbercode2024.pdf）に基づく）
const departmentOrder = Object.fromEntries([...['FC','IC','GC','TC','PF','PI','PG','PT'].entries()].map(([k,v])=>[v,k])) as Record<DepartmentCode, number>;
const middleDivisionOrder = Object.fromEntries([...'0123456789LABCDEF'.split('').entries()].map(([k,v])=>[v,k]));
const smallDivisionOrder = Object.fromEntries([...'0123456789abcdefghijklmnopqrstuvwxyz'.split('').entries()].map(([k,v])=>[v,k]));
export const courseCodeToInt = (code: CourseCode) => 0
  + departmentOrder[code.slice(0, 2) as DepartmentCode] * 100000
  + middleDivisionOrder[code.charAt(2)] * 10000
  + smallDivisionOrder[code.charAt(3)] * 36
  + smallDivisionOrder[code.charAt(4)]
;

/**
 * CourseCodeの先頭n文字を可変長引数で受け取り，それらのいずれかに一致するかどうかを判定する関数を返す
 */
export const isSubcourseOf = (...codes: CourseCodePrefix[]) => {
  if (codes.length == 1) {
    const [n] = codes;
    return (code: CourseCode) => code.startsWith(n);
  } else {
    return (code: CourseCode) => codes.some(c => code.startsWith(c));
  }
}
type Pred = (code: CourseCode) => boolean;
export const $not = (pred: Pred): Pred => code => !pred(code);
export const $and = (...preds: Pred[]): Pred => code => preds.every(p => p(code));
export const $or = (...preds: Pred[]): Pred => code => preds.some(p => p(code));

export const subCodeKishu = (lang: KishuForeignLang) => {
  const d = ({ en: 1, de: 2, fr: 3, zh: 4, ru: 5, es: 6, ko: 7, it: 8, ja: 9 } as const)[lang];
  return `FC1${d}` as const;
};
export const subCodeShoshu = (lang: ShoshuForeignLang) => {
  const d = ({ de: 1, fr: 2, zh: 3, ru: 4, es: 5, ko: 6, it: 7 } as const)[lang];
  return `FC2${d}` as const;
};
export const subCodeSecondL = (lang: ShoshuForeignLang) => {
  const d = ({ de: 2, fr: 3, zh: 4, ru: 5, es: 6, ko: 7, it: 8 } as const)[lang];
  return `GCL${d}` as const;
};

/**
 * 与えられたCourseCodeに対応する科目名を返す
 */
export const getTitle = (code: CourseCode): string => {
  // @ts-ignore
  return serialNumberMap[code.slice(0, 2)][code.slice(2)][0];
};

/**
 * 与えられた科目名に対応するCourseCodeを返す
 */
export const getCourseCode = (title: string, option: LanguageOption): CourseCode | undefined => {
  const kishuSubCode = subCodeKishu(option.firstForeignLanguage);
  const shoshuSubCode = option.secondForeignLanguage.learned ? subCodeKishu(option.secondForeignLanguage.lang) : subCodeShoshu(option.secondForeignLanguage.lang);
  const predLang = isSubcourseOf('FC1', 'FC2'), predShu = isSubcourseOf(kishuSubCode, shoshuSubCode);
  const it = Object.entries(serialNumberMap) as { [K in keyof SerialNumberMap]: [K, SerialNumberMap[K]] }[keyof SerialNumberMap][];
  for (const [k, v] of it) {
    type That<V = typeof v> = V extends infer T ? { [K in keyof T]: [K, string] }[keyof T][] : never;
    const that = Object.entries(v) as That;
    for (const [l, w] of that) {
      const code = (k + l) as CourseCode;
      if (predLang(code) && !predShu(code)) continue;
      if (w.includes(title)) return code;
    }
  }
};

type SerialNumberMap = typeof serialNumberMap;
// 東京大学授業カタログ（https://catalog.he.u-tokyo.ac.jp/）参照
export const serialNumberMap = {
  FC:{'111': ['英語一列①'],
      '112': ['英語一列②'],
      '113': ['英語二列Ｓ', '英語二列Ｓ（FLOW）'],
      '114': ['英語二列Ｗ', '英語二列Ｗ（ALESA）', '英語二列Ｗ（ALESS）'],
      '121': ['ドイツ語一列①'],
      '122': ['ドイツ語一列②'],
      '123': ['ドイツ語二列'],
      '129': ['ドイツ語特修'],
      '131': ['フランス語一列①'],
      '132': ['フランス語一列②'],
      '133': ['フランス語二列'],
      '139': ['フランス語特修'],
      '141': ['中国語一列①'],
      '142': ['中国語一列②'],
      '143': ['中国語二列'],
      '149': ['中国語特修'],
      '151': ['ロシア語一列①'],
      '152': ['ロシア語一列②'],
      '153': ['ロシア語二列'],
      '159': ['ロシア語特修'],
      '161': ['スペイン語一列①'],
      '162': ['スペイン語一列②'],
      '163': ['スペイン語二列'],
      '169': ['スペイン語特修'],
      '171': ['韓国朝鮮語一列①'],
      '172': ['韓国朝鮮語一列②'],
      '173': ['韓国朝鮮語二列'],
      '179': ['韓国朝鮮語特修'],
      '181': ['イタリア語一列①'],
      '182': ['イタリア語一列②'],
      '183': ['イタリア語二列'],
      '189': ['イタリア語特修'],
      '191': ['日本語一列①'],
      '192': ['日本語一列②'],
      '193': ['日本語二列Ｃ'],
      '194': ['日本語二列Ｐ'],
      '211': ['ドイツ語一列①'],
      '212': ['ドイツ語一列②'],
      '213': ['ドイツ語二列'],
      '219': ['ドイツ語特修'],
      '221': ['フランス語一列①'],
      '222': ['フランス語一列②'],
      '223': ['フランス語二列'],
      '229': ['フランス語特修'],
      '231': ['中国語一列①'],
      '232': ['中国語一列②'],
      '233': ['中国語二列'],
      '239': ['中国語特修'],
      '241': ['ロシア語一列①'],
      '242': ['ロシア語一列②'],
      '243': ['ロシア語二列'],
      '249': ['ロシア語特修'],
      '251': ['スペイン語一列①'],
      '252': ['スペイン語一列②'],
      '253': ['スペイン語二列'],
      '259': ['スペイン語特修'],
      '261': ['韓国朝鮮語一列①'],
      '262': ['韓国朝鮮語一列②'],
      '263': ['韓国朝鮮語二列'],
      '269': ['韓国朝鮮語特修'],
      '271': ['イタリア語一列①'],
      '272': ['イタリア語一列②'],
      '273': ['イタリア語二列'],
      '279': ['イタリア語特修'],
      '300': ['情報', '情報α'],
      '410': ['身体運動・健康科学実習Ⅰ', '身体運動・健康科学実習Ⅰ（ﾒﾃﾞｨｶﾙｹｱ1）', '身体運動・健康科学実習Ⅰ（ﾒﾃﾞｨｶﾙｹｱ2）', '身体運動・健康科学実習Ⅰ（ﾒﾃﾞｨｶﾙｹｱ3）'],
      '420': ['身体運動・健康科学実習Ⅱ', '身体運動・健康科学実習Ⅱ（ﾒﾃﾞｨｶﾙｹｱ3）', '身体運動・健康科学実習Ⅱ（ﾒﾃﾞｨｶﾙｹｱ1）', '身体運動・健康科学実習Ⅱ（ﾒﾃﾞｨｶﾙｹｱ2）', '身体運動・健康科学実習Ⅱ(2S)'],
      '510': ['初年次ゼミナール文科'],
      '520': ['初年次ゼミナール理科'],
      '611': ['法Ⅰ'],
      '612': ['法Ⅱ'],
      '621': ['政治Ⅰ'],
      '622': ['政治Ⅱ'],
      '631': ['経済Ⅰ'],
      '632': ['経済Ⅱ'],
      '641': ['社会Ⅰ'],
      '642': ['社会Ⅱ'],
      '651': ['数学Ⅰ'],
      '652': ['数学Ⅱ'],
      '711': ['哲学Ⅰ'],
      '712': ['哲学Ⅱ'],
      '721': ['倫理Ⅰ'],
      '722': ['倫理Ⅱ'],
      '731': ['歴史Ⅰ'],
      '732': ['歴史Ⅱ'],
      '741': ['ことばと文学Ⅰ'],
      '742': ['ことばと文学Ⅱ'],
      '743': ['ことばと文学Ⅲ'],
      '744': ['ことばと文学Ⅳ'],
      '751': ['心理Ⅰ'],
      '752': ['心理Ⅱ'],
      '811': ['基礎実験Ⅰ(物理学)', '基礎実験Ⅰ(物理学)α'],
      '812': ['基礎実験Ⅱ(物理学)', '基礎実験Ⅱ(物理学)α'],
      '813': ['基礎実験Ⅲ(物理学)'],
      '814': ['基礎実験Ⅳ(物理学)'],
      '821': ['基礎実験Ⅰ(化学)', '基礎実験Ⅰ(化学)α'],
      '822': ['基礎実験Ⅱ(化学)', '基礎実験Ⅱ(化学)α'],
      '823': ['基礎実験Ⅲ(化学)'],
      '824': ['基礎実験Ⅳ(化学)'],
      '830': ['基礎物理学実験'],
      '840': ['基礎化学実験'],
      '850': ['基礎生命科学実験', '基礎生命科学実験α'],
      '860': ['生命科学実験', '生命科学実験α'],
      '871': ['数理科学基礎'],
      '872': ['数理科学基礎（補修）'],
      '873': ['微分積分学①'],
      '874': ['微分積分学②'],
      '875': ['線型代数学①'],
      '876': ['線型代数学②'],
      '877': ['数理科学基礎演習'],
      '878': ['数学基礎理論演習'],
      '879': ['微分積分学演習'],
      '87a': ['線型代数学演習'],
      '881': ['力学Ａ'],
      '882': ['力学Ｂ'],
      '883': ['電磁気学Ａ'],
      '884': ['電磁気学Ｂ'],
      '885': ['熱力学'],
      '886': ['化学熱力学'],
      '887': ['構造化学', '構造化学α'],
      '888': ['物性化学'],
      '891': ['生命科学'],
      '892': ['生命科学Ⅰ'],
      '893': ['生命科学Ⅱ'],
  },
  IC:{'110': ['社会科学ゼミナール（法・政治）'],
      '120': ['社会科学ゼミナール（経済・統計）'],
      '130': ['社会科学ゼミナール（社会・社会思想史）'],
      '140': ['社会科学ゼミナール（国際関係）'],
      '210': ['人文科学ゼミナール（哲学・科学史）'],
      '220': ['人文科学ゼミナール（歴史学）'],
      '230': ['人文科学ゼミナール（文化人類学）'],
      '250': ['人文科学ゼミナール（データ分析）'],
      '260': ['人文科学ゼミナール（ことばと文化）'],
      '310': ['自然科学ゼミナール（身体運動科学）'],
      '320': ['自然科学ゼミナール（生命科学）'],
      '330': ['自然科学ゼミナール（化学）'],
      '350': ['自然科学ゼミナール（数理科学）'],
      '360': ['自然科学ゼミナール（情報科学）'],
      '410': ['文理融合ゼミナール（認知と芸術）'],
      '420': ['文理融合ゼミナール（身体と芸術）'],
      '430': ['文理融合ゼミナール（メディアと芸術）'],
      '440': ['文理融合ゼミナール（研究入門）'],
  },
  GC:{'L11': ['英語中級', '英語中級（クラス指定セメスター型）', '英語中級（クラス指定ターム型）'],
      'L12': ['英語上級'],
      'L21': ['ドイツ語初級（演習）'],
      'L22': ['ドイツ語初級（演習）①'],
      'L23': ['ドイツ語初級（演習）②'],
      'L24': ['ドイツ語初級（会話）'],
      'L25': ['ドイツ語初級（作文）'],
      'L26': ['ドイツ語初級（表現練習）'],
      'L28': ['ドイツ語初級（インテンシヴ）'],
      'L29': ['ドイツ語初級（第三外国語）'],
      'L2a': ['ドイツ語中級（演習）'],
      'L2b': ['ドイツ語中級（会話）'],
      'L2c': ['ドイツ語中級（作文）'],
      'L2f': ['ドイツ語中級（インテンシヴ）'],
      'L2h': ['ドイツ語上級（演習）'],
      'L2i': ['ドイツ語上級（会話）'],
      'L2k': ['ドイツ語上級（読解）'],
      'L31': ['フランス語初級（演習）'],
      'L32': ['フランス語初級（演習）①'],
      'L33': ['フランス語初級（演習）②'],
      'L34': ['フランス語初級（会話）'],
      'L35': ['フランス語初級（作文）'],
      'L36': ['フランス語初級（表現練習）'],
      'L37': ['フランス語初級（読解）'],
      'L38': ['フランス語初級（インテンシヴ）'],
      'L39': ['フランス語初級（第三外国語）'],
      'L3a': ['フランス語中級（演習）'],
      'L3b': ['フランス語中級（会話）'],
      'L3c': ['フランス語中級（作文）'],
      'L3d': ['フランス語中級（表現練習）'],
      'L3e': ['フランス語中級（読解）'],
      'L3f': ['フランス語中級（インテンシヴ）'],
      'L3i': ['フランス語上級（会話）'],
      'L3k': ['フランス語上級（読解）'],
      'L41': ['中国語初級（演習）'],
      'L42': ['中国語初級（演習）①'],
      'L43': ['中国語初級（演習）②'],
      'L45': ['中国語初級（作文）'],
      'L46': ['中国語初級（表現練習）'],
      'L48': ['中国語初級（インテンシヴ）'],
      'L49': ['中国語初級（第三外国語）'],
      'L4a': ['中国語中級（演習）'],
      'L4b': ['中国語中級（会話）'],
      'L4c': ['中国語中級（作文）'],
      'L4e': ['中国語中級（読解）'],
      'L4f': ['中国語中級（インテンシヴ）'],
      'L4h': ['中国語上級（演習）'],
      'L4i': ['中国語上級（会話）'],
      'L4j': ['中国語上級（作文）'],
      'L4k': ['中国語上級（読解）'],
      'L51': ['ロシア語初級（演習）'],
      'L52': ['ロシア語初級（演習）①'],
      'L53': ['ロシア語初級（演習）②'],
      'L54': ['ロシア語初級（会話）'],
      'L55': ['ロシア語初級（作文）'],
      'L58': ['ロシア語初級（インテンシヴ）'],
      'L59': ['ロシア語初級（第三外国語）'],
      'L5a': ['ロシア語中級（演習）'],
      'L5b': ['ロシア語中級（会話）'],
      'L5c': ['ロシア語中級（作文）'],
      'L5e': ['ロシア語中級（読解）'],
      'L5f': ['ロシア語中級（インテンシヴ）'],
      'L5h': ['ロシア語上級（演習）'],
      'L5i': ['ロシア語上級（会話）'],
      'L5j': ['ロシア語上級（作文）'],
      'L5k': ['ロシア語上級（読解）'],
      'L61': ['スペイン語初級（演習）'],
      'L62': ['スペイン語初級（演習）①'],
      'L63': ['スペイン語初級（演習）②'],
      'L64': ['スペイン語初級（会話）'],
      'L65': ['スペイン語初級（作文）'],
      'L68': ['スペイン語初級（インテンシヴ）'],
      'L69': ['スペイン語初級（第三外国語）'],
      'L6a': ['スペイン語中級（演習）'],
      'L6b': ['スペイン語中級（会話）'],
      'L6c': ['スペイン語中級（作文）'],
      'L6e': ['スペイン語中級（読解）'],
      'L6f': ['スペイン語中級（インテンシヴ）'],
      'L6h': ['スペイン語上級（演習）'],
      'L6i': ['スペイン語上級（会話）'],
      'L6j': ['スペイン語上級（作文）'],
      'L71': ['韓国朝鮮語初級（演習）'],
      'L72': ['韓国朝鮮語初級（演習）①'],
      'L73': ['韓国朝鮮語初級（演習）②'],
      'L74': ['韓国朝鮮語初級（会話）'],
      'L75': ['韓国朝鮮語初級（作文）'],
      'L78': ['韓国朝鮮語初級（インテンシヴ）'],
      'L79': ['韓国朝鮮語初級（第三外国語）'],
      'L7a': ['韓国朝鮮語中級（演習）'],
      'L7b': ['韓国朝鮮語中級（会話）'],
      'L7c': ['韓国朝鮮語中級（作文）'],
      'L7d': ['韓国朝鮮語中級（表現練習）'],
      'L7e': ['韓国朝鮮語中級（読解）'],
      'L7f': ['韓国朝鮮語中級（インテンシヴ）'],
      'L7i': ['韓国朝鮮語上級（会話）'],
      'L7j': ['韓国朝鮮語上級（作文）'],
      'L81': ['イタリア語初級（演習）'],
      'L82': ['イタリア語初級（演習）①'],
      'L83': ['イタリア語初級（演習）②'],
      'L84': ['イタリア語初級（会話）'],
      'L85': ['イタリア語初級（作文）'],
      'L86': ['イタリア語初級（表現練習）'],
      'L87': ['イタリア語初級（読解）'],
      'L88': ['イタリア語初級（インテンシヴ）'],
      'L89': ['イタリア語初級（第三外国語）'],
      'L8b': ['イタリア語中級（会話）'],
      'L8d': ['イタリア語中級（表現練習）'],
      'L8e': ['イタリア語中級（読解）'],
      'L8f': ['イタリア語中級（インテンシヴ）'],
      'L8i': ['イタリア語上級（会話）'],
      'L8j': ['イタリア語上級（作文）'],
      'L91': ['日本語中級'],
      'L92': ['日本語上級'],
      'La7': ['アラビア語初級（第三外国語）'],
      'Lae': ['アラビア語中級（第三外国語）'],
      'Lb7': ['ヒンディー語初級（第三外国語）'],
      'Lbe': ['ヒンディー語中級（第三外国語）'],
      'Lc7': ['インドネシア語初級（第三外国語）'],
      'Lce': ['インドネシア語中級（第三外国語）'],
      'Ld7': ['ベトナム語初級（第三外国語）'],
      'Lde': ['ベトナム語中級（第三外国語）'],
      'Le7': ['広東語初級（第三外国語）'],
      'Lee': ['広東語中級（第三外国語）'],
      'Lf7': ['ヘブライ語初級（第三外国語）'],
      'Lg7': ['上海語初級（第三外国語）'],
      'Lh7': ['ペルシア語初級（第三外国語）'],
      'Li7': ['セルビア・クロアチア語初級（第三外国語）'],
      'Lie': ['セルビア・クロアチア語中級（第三外国語）'],
      'Lj7': ['ポーランド語初級（第三外国語）'],
      'Lk7': ['タイ語初級（第三外国語）'],
      'Ll7': ['ポルトガル語初級（第三外国語）'],
      'Lle': ['ポルトガル語中級（第三外国語）'],
      'Lm7': ['台湾語初級（第三外国語）'],
      'Lme': ['台湾語中級（第三外国語）'],
      'Ln7': ['モンゴル語初級（第三外国語）'],
      'Lo7': ['トルコ語初級（第三外国語）'],
      'Loe': ['トルコ語中級（第三外国語）'],
      'Lu1': ['古典語初級（ギリシア語）Ⅰ'],
      'Lu2': ['古典語初級（ギリシア語）Ⅱ'],
      'Lu3': ['古典語中級（ギリシア語）Ⅰ'],
      'Lu4': ['古典語中級（ギリシア語）Ⅱ'],
      'Lv1': ['古典語初級（ラテン語）Ⅰ'],
      'Lv2': ['古典語初級（ラテン語）Ⅱ'],
      'Lv3': ['古典語中級（ラテン語）Ⅰ'],
      'Lv4': ['古典語中級（ラテン語）Ⅱ'],
      'Lw1': ['古典語初級（サンスクリット語）Ⅰ'],
      'Lw2': ['古典語初級（サンスクリット語）Ⅱ'],
      'Lx1': ['古典語初級（ヘブライ語）Ⅰ'],
      'Ly1': ['古典日本語'],
      'Lz1': ['古典中国語'],
      'A11': ['言語構造論'],
      'A12': ['言語比較論'],
      'A13': ['言語応用論'],
      'A14': ['記号論'],
      'A15': ['翻訳論'],
      'A16': ['言語態理論'],
      'A17': ['外国文学'],
      'A18': ['言語文化論'],
      'A19': ['批評理論'],
      'A1a': ['文化横断論'],
      'A1b': ['テクスト文化論'],
      'A21': ['現代哲学'],
      'A22': ['科学哲学'],
      'A23': ['現代思想'],
      'A24': ['記号論理学Ⅰ（理科生）'],
      'A25': ['記号論理学Ⅰ（文科生）'],
      'A26': ['記号論理学Ⅱ'],
      'A27': ['精神分析学'],
      'A31': ['表象文化論'],
      'A34': ['美術論'],
      'A35': ['映画論'],
      'A36': ['音楽論'],
      'A37': ['演劇論'],
      'A38': ['性の政治Ⅰ'],
      'A39': ['社会正義論'],
      'A41': ['比較文化論'],
      'A42': ['比較文学'],
      'A43': ['比較思想'],
      'A44': ['比較芸術'],
      'A51': ['東洋思想史'],
      'A52': ['西洋思想史'],
      'A53': ['経済思想史'],
      'A54': ['社会思想史'],
      'A55': ['科学史'],
      'B11': ['国際関係論'],
      'B12': ['国際関係史'],
      'B13': ['現代国際社会論'],
      'B14': ['平和構築論'],
      'B21': ['地域文化論Ⅰ'],
      'B22': ['地域文化論Ⅱ'],
      'B23': ['比較地域史'],
      'B24': ['人種とジェンダー'],
      'B31': ['日本文化論Ⅰ'],
      'B32': ['日本文化論Ⅱ'],
      'B33': ['日本語日本文学Ⅰ（理科生）'],
      'B34': ['日本語日本文学Ⅱ'],
      'B41': ['東洋古典学'],
      'B42': ['西洋古典学'],
      'B51': ['歴史社会論'],
      'B52': ['近現代史'],
      'B53': ['歴史と文化'],
      'B54': ['世界史論'],
      'B61': ['文化人類学Ⅰ'],
      'B62': ['文化人類学Ⅱ'],
      'B63': ['民族文化論'],
      'B64': ['現代文化人類学'],
      'C11': ['法と社会'],
      'C12': ['日本国憲法'],
      'C13': ['現代と法'],
      'C14': ['ダイバーシティと法'],
      'C21': ['現代社会論'],
      'C22': ['比較社会論'],
      'C23': ['ジェンダー論'],
      'C24': ['日本の政治'],
      'C25': ['ジェンダー論【社会科学】'],
      'C26': ['ジェンダー論【人文学】'],
      'C27': ['現代と政治'],
      'C28': ['性と身体Ⅰ'],
      'C32': ['政治経済学'],
      'C33': ['計量社会科学'],
      'C41': ['現代経済理論'],
      'C42': ['経済政策'],
      'C51': ['現代教育論'],
      'C52': ['教育臨床心理学'],
      'C54': ['高等教育論入門'],
      'C55': ['教育実践・政策学入門'],
      'C56': ['教育学のフロンティア'],
      'D12': ['環境物質科学'],
      'D13': ['生態学'],
      'D14': ['社会環境論'],
      'D21': ['社会生態学'],
      'D22': ['地域生態学'],
      'D31': ['人間行動基礎論（理科生）'],
      'D32': ['情報認知科学'],
      'D33': ['認知脳科学'],
      'D34': ['適応行動論'],
      'D35': ['社会行動論'],
      'D41': ['スポーツ・身体運動実習', 'スポーツ・身体運動実習（ﾒﾃﾞｨｶﾙｹｱ1）', 'スポーツ・身体運動実習（ﾒﾃﾞｨｶﾙｹｱ2）', 'スポーツ・身体運動実習（ﾒﾃﾞｨｶﾙｹｱ3）'],
      'D42': ['スポーツ・身体運動実習Ⅱ'],
      'D43': ['身体運動科学'],
      'D44': ['健康スポーツ医学'],
      'D45': ['身体生命科学'],
      'D46': ['身体運動メカニクス'],
      'D51': ['情報メディア基礎論'],
      'D52': ['情報メディア伝達論'],
      'D53': ['情報メディア表現論'],
      'D61': ['科学技術基礎論Ⅰ'],
      'D62': ['科学技術基礎論Ⅱ'],
      'D63': ['現代倫理'],
      'D64': ['フェミニズム科学論'],
      'D71': ['科学技術社会論'],
      'D72': ['システム論'],
      'D81': ['現代工学概論'],
      'D82': ['現代工学基礎Ⅰ'],
      'D83': ['現代工学基礎Ⅱ'],
      'D84': ['社会システム工学基礎Ⅰ'],
      'D85': ['社会システム工学基礎Ⅱ'],
      'D86': ['総合工学基礎Ⅰ'],
      'D87': ['総合工学基礎Ⅱ'],
      'D88': ['生体医工学基礎Ⅰ'],
      'D89': ['生体医工学基礎Ⅱ'],
      'D91': ['環境・エネルギー工学概論'],
      'D92': ['環境・エネルギー工学基礎Ⅰ'],
      'D93': ['環境・エネルギー工学基礎Ⅱ'],
      'Da2': ['ヘルス・サイエンス概論'],
      'Da3': ['看護学概論Ⅰ'],
      'Da4': ['看護学概論Ⅱ'],
      'Db1': ['環境と生物資源'],
      'Db2': ['食糧と環境'],
      'Db3': ['森林環境資源学'],
      'Db4': ['水と土の環境科学'],
      'Db5': ['放射線環境科学'],
      'Db6': ['住環境の科学'],
      'Dc1': ['教育心理学の世界'],
      'Dc2': ['心身の実践科学'],
      'E11': ['振動・波動論'],
      'E12': ['解析力学'],
      'E13': ['相対論'],
      'E14': ['量子論'],
      'E15': ['統計物理学'],
      'E16': ['現代物理学'],
      'E17': ['物理科学Ⅰ（文科生）'],
      'E18': ['物理科学Ⅱ（文科生）'],
      'E19': ['有機反応化学'],
      'E1a': ['化学平衡と反応速度'],
      'E1b': ['物質化学（文科生）'],
      'E1c': ['分子システムの化学'],
      'E1d': ['基礎方程式とその意味'],
      'E1e': ['分子化学概論'],
      'E1f': ['化学薬学概論'],
      'E1g': ['超分子化学'],
      'E1h': ['基礎化学'],
      'E21': ['物質・生命工学概論'],
      'E22': ['物質・生命工学基礎ⅠＡ'],
      'E23': ['物質・生命工学基礎ⅠＢ'],
      'E24': ['物質・生命工学基礎Ⅱ'],
      'E31': ['動物科学'],
      'E32': ['植物科学'],
      'E33': ['進化学'],
      'E34': ['現代生命科学Ⅰ（文科生、理一生）'],
      'E35': ['現代生命科学Ⅱ（文科生、理一生）'],
      'E36': ['分子生命科学'],
      'E37': ['現代生物学'],
      'E38': ['人類科学'],
      'E39': ['生物情報科学'],
      'E3a': ['生物薬学概論'],
      'E41': ['惑星地球科学Ⅰ(理科生)'],
      'E42': ['惑星地球科学Ⅱ(理科生)'],
      'E43': ['地球惑星物理学入門'],
      'E44': ['地球惑星環境学入門'],
      'E45': ['惑星地球科学実習'],
      'E46': ['宇宙科学Ⅰ（理科生）'],
      'E47': ['宇宙科学Ⅱ（理科生）'],
      'E48': ['宇宙科学実習Ⅰ'],
      'E49': ['宇宙科学実習Ⅱ'],
      'E4a': ['惑星地球科学Ⅰ（文科生）'],
      'E4b': ['惑星地球科学Ⅱ（文科生）'],
      'E4c': ['宇宙科学Ⅰ（文科生）'],
      'E51': ['微生物の科学'],
      'E52': ['アグリバイオロジー'],
      'E53': ['植物医科学'],
      'E54': ['応用動物科学Ⅰ'],
      'E55': ['応用動物科学Ⅱ'],
      'E56': ['食の科学'],
      'E57': ['海の生命科学'],
      'E58': ['天然物の科学'],
      'E59': ['生物素材の科学'],
      'E5a': ['森の生物学'],
      'E61': ['自然現象とモデル'],
      'E62': ['生物物理学'],
      'E71': ['先進科学Ⅰα'],
      'E72': ['先進科学Ⅱα'],
      'E73': ['先進科学Ⅲα'],
      'E74': ['先進科学Ⅳα'],
      'F11': ['微分積分学続論'],
      'F12': ['常微分方程式'],
      'F13': ['ベクトル解析'],
      'F14': ['解析学基礎'],
      'F15': ['数理科学概論Ⅰ(文科生)'],
      'F16': ['数理科学概論Ⅱ(文科生)'],
      'F17': ['数理科学概論Ⅲ(文科生)'],
      'F18': ['数理工学入門'],
      'F19': ['統計データ解析Ⅰ'],
      'F1a': ['統計データ解析Ⅱ'],
      'F21': ['図形科学Ａ'],
      'F22': ['図形科学Ｂ'],
      'F23': ['図形科学演習Ⅰ'],
      'F24': ['図形科学演習Ⅱ'],
      'F31': ['基礎統計'],
      'F32': ['統計分析'],
      'F41': ['アルゴリズム入門'],
      'F42': ['計算機プログラミング'],
      'F43': ['計算機システム概論'],
      'F44': ['計算の理論'],
      'F45': ['情報・システム工学概論'],
      'F46': ['情報システム基礎Ⅰ'],
      'F47': ['情報システム基礎Ⅱ'],
      'F48': ['モデリングとシミュレーション基礎Ⅰ'],
      'F49': ['モデリングとシミュレーション基礎Ⅱ'],
  },
  TC:{'100': ['学術フロンティア講義'],
      '200': ['全学自由研究ゼミナール'],
      '300': ['全学体験ゼミナール'],
      '400': ['国際研修'],
  },
  PF:{'111': ['英語一列(PEAK)'],
      '121': ['日本語ｲﾝﾃﾝｼﾌﾞⅠ(PEAK)', '日本語ｲﾝﾃﾝｼﾌﾞⅠ(PEAK)G1', '日本語ｲﾝﾃﾝｼﾌﾞⅠ(PEAK)G2', '日本語ｲﾝﾃﾝｼﾌﾞⅠ(PEAK)G3', '日本語ｲﾝﾃﾝｼﾌﾞⅠ(PEAK)G4', '日本語ｲﾝﾃﾝｼﾌﾞⅠ(PEAK)G5'],
      '122': ['日本語ｲﾝﾃﾝｼﾌﾞⅡ(PEAK)', '日本語ｲﾝﾃﾝｼﾌﾞⅡ(PEAK)G1', '日本語ｲﾝﾃﾝｼﾌﾞⅡ(PEAK)G2', '日本語ｲﾝﾃﾝｼﾌﾞⅡ(PEAK)G3', '日本語ｲﾝﾃﾝｼﾌﾞⅡ(PEAK)G4', '日本語ｲﾝﾃﾝｼﾌﾞⅡ(PEAK)G5'],
      '123': ['日本語ｲﾝﾃﾝｼﾌﾞⅢ(PEAK)', '日本語ｲﾝﾃﾝｼﾌﾞⅢ(PEAK)G1', '日本語ｲﾝﾃﾝｼﾌﾞⅢ(PEAK)G2', '日本語ｲﾝﾃﾝｼﾌﾞⅢ(PEAK)G3', '日本語ｲﾝﾃﾝｼﾌﾞⅢ(PEAK)G4', '日本語ｲﾝﾃﾝｼﾌﾞⅢ(PEAK)G5'],
      '129': ['日本語特修(PEAK)'],
      '200': ['情報(PEAK)'],
      '310': ['身体運動・健康科学実習Ⅰ(PEAK)'],
      '320': ['身体運動・健康科学実習Ⅱ(PEAK)'],
      '410': ['初年次ゼミナールⅠ(PEAK)'],
      '420': ['初年次ゼミナールⅡ(PEAK)'],
      '510': ['法・政治(PEAK)'],
      '520': ['経済・統計(PEAK)'],
      '530': ['社会・社会思想(PEAK)'],
      '540': ['国際関係(PEAK)'],
      '550': ['数学(PEAK)'],
      '620': ['歴史(PEAK)'],
      '630': ['ことばと文学(PEAK)'],
      '640': ['心理(PEAK)'],
      '711': ['数学Ⅰ①(PEAK)'],
      '712': ['数学Ⅰ②(PEAK)'],
      '721': ['数学Ⅱ①(PEAK)'],
      '722': ['数学Ⅱ②(PEAK)'],
      '810': ['物理学基礎(PEAK)'],
      '820': ['化学基礎(PEAK)'],
      '830': ['地球科学(PEAK)'],
      '840': ['生命科学(PEAK)'],
  },
  PI:{'100': ['人文・社会科学ゼミナール(PEAK)', '社会科学ゼミナール(PEAK)'],
      '200': ['自然科学ゼミナール(PEAK)'],
  },
  PG:{'L11': ['応用日本語(1)(PEAK)'],
      'L12': ['応用日本語(2)(PEAK)'],
      'L13': ['応用日本語(3)(PEAK)'],
      'L14': ['応用日本語(4)(PEAK)'],
      'L15': ['応用日本語(5)(PEAK)'],
      'L16': ['応用日本語(6)(PEAK)'],
      'L17': ['応用日本語(7)(PEAK)'],
      'L18': ['応用日本語(8)(PEAK)'],
      'L19': ['応用日本語(9)(PEAK)'],
      'L1a': ['応用日本語(10)(PEAK)'],
      'L1b': ['応用日本語(11)(PEAK)'],
      'L1c': ['応用日本語(12)(PEAK)'],
      'A10': ['思想・芸術Ⅰ(PEAK)'],
      'A20': ['思想・芸術Ⅱ(PEAK)'],
      'A30': ['思想・芸術Ⅲ(PEAK)'],
      'B10': ['国際・地域Ⅰ(PEAK)'],
      'B20': ['国際・地域Ⅱ(PEAK)'],
      'C10': ['社会・制度Ⅰ(PEAK)'],
      'C20': ['社会・制度Ⅱ(PEAK)'],
      'C30': ['社会・制度Ⅲ(PEAK)'],
      'D10': ['スポーツ・身体運動実習Ｉ(PEAK)'],
      'D20': ['スポーツ・身体運動実習Ⅱ(PEAK)'],
      'D30': ['科学技術基礎論(PEAK)'],
      'D40': ['身体運動科学(PEAK)'],
      'D50': ['エネルギー工学の基礎(PEAK)'],
      'D60': ['地球環境(PEAK)'],
      'E10': ['電磁気学の基礎(PEAK)'],
      'E20': ['分析化学(PEAK)'],
      'E30': ['生態学の基礎(PEAK)'],
      'F10': ['情報科学(PEAK)'],
      'F20': ['統計学(PEAK)'],
      'F30': ['意思決定の数理(PEAK)'],
      'F40': ['コンピューティングの基礎(PEAK)'],
  },
  PT:{'100': ['学術フロンティア講義(PEAK)'],
      '200': ['全学自由研究ゼミナール(PEAK)'],
  },
} as const satisfies Record<DepartmentCode, Partial<Record<SerialNumber, readonly string[]>>>;

let courseCodes: CourseCode[];
export const getCourseCodes = (): CourseCode[] => {
  if (courseCodes == null) {
    const codes: CourseCode[] = [];
    for (const [k, v] of Object.entries(serialNumberMap)) {
      for (const l of Object.keys(v)) {
        codes.push((k + l) as CourseCode);
      }
    }
    courseCodes = codes;
  }
  return courseCodes;
};

let courseCodeMap: Record<CourseCode, string[]>;
export const getCourseCodeMap = (): Record<CourseCode, string[]> => {
  if (courseCodeMap == null) {
    const map = {} as Record<string, string[]>;
    for (const [k, v] of Object.entries(serialNumberMap)) {
      for (const [l, w] of Object.entries(v)) {
        map[k + l] = w;
      }
    }
    courseCodeMap = map;
  }
  return courseCodeMap;
};
