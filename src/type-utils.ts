export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type LargeAlphabet = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
export type SmallAlphabet = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export type Char = Digit | LargeAlphabet | SmallAlphabet;
export type FirstNChars<S extends string> = S extends `${infer T}${Char}` ? FirstNChars<T> | T | S : never;

export const kishuForeignLangList = ['en', 'de', 'fr', 'zh', 'ru', 'es', 'ko', 'it', 'ja'] as const;
export type KishuForeignLang = (typeof kishuForeignLangList)[number];
export const shohuForeignLangList = ['de', 'fr', 'zh', 'ru', 'es', 'ko', 'it'] as const;
export type ShoshuForeignLang = (typeof shohuForeignLangList)[number];
export type LanguageOption = {
  firstForeignLanguage: KishuForeignLang;
  secondForeignLanguage:
    | { lang: KishuForeignLang; learned: true; }
    | { lang: ShoshuForeignLang; learned: false; }
  ;
};
export const isLanguageOption = (value: unknown): value is LanguageOption => {
  if (!('object' === typeof value && value != null && 'firstForeignLanguage' in value && 'secondForeignLanguage' in value)) return false;
  const { firstForeignLanguage: first, secondForeignLanguage: second } = value;
  if (!kishuForeignLangList.includes(first as any)) return false;
  if (!('object' === typeof second && second != null && 'lang' in second && 'learned' in second)) return false;
  const { lang, learned } = second;
  return 'boolean' === typeof learned && (learned ? kishuForeignLangList.includes(lang as any) : shohuForeignLangList.includes(lang as any) );
};

export const languageCodeMap = {
  en: '英語',
  de: 'ドイツ語',
  fr: 'フランス語',
  zh: '中国語',
  ru: 'ロシア語',
  es: 'スペイン語',
  ko: '韓国朝鮮語',
  it: 'イタリア語',
  ja: '日本語',
} as const satisfies Record<KishuForeignLang | ShoshuForeignLang, string>;

export const karuiList = ['HSS1', 'HSS2', 'HSS3', 'NS1', 'NS2', 'NS3'] as const;
export type Karui = (typeof karuiList)[number];
export const isKarui = (value: unknown): value is Karui => karuiList.includes(value as any);
export const karuiJa: Record<Karui, string> = { HSS1: '文科一類', HSS2: '文科二類', HSS3: '文科三類', NS1: '理科一類', NS2: '理科二類', NS3: '理科三類' };

export const classNumList: Record<Karui, number> = { HSS1: 28, HSS2: 28, HSS3: 20, NS1: 39, NS2: 24, NS3: 24 };
export type Group = 1 | 2 | 3 | 4;
export const grouping: Record<Karui, Group[]> = {
  HSS1: [3,3,3,4,2,2,3,1,4,3,1,4,2,4,2,2,3,2,2,3,3,1,3,2,1,1,3,3],
  HSS2: [3,3,3,4,2,2,3,1,4,3,1,4,2,4,2,2,3,2,2,3,3,1,3,2,1,1,3,3],
  HSS3: [3,3,3,4,1,2,1,4,3,2,1,2,4,1,3,3,2,4,1,4],
  NS1 : [1,1,1,1,4,4,2,3,2,4,3,1,2,4,4,3,1,1,2,1,3,4,1,3,2,4,3,2,3,2,1,4,3,2,1,1,2,4,1],
  NS2 : [4,4,4,3,4,2,2,3,3,4,1,4,1,3,4,4,3,2,2,1,3,2,1,4],
  NS3 : [4,4,4,3,4,2,2,3,3,4,1,4,1,3,4,4,3,2,2,1,3,2,1,4],
};

export type Phase = 1 | 2 | 3;
