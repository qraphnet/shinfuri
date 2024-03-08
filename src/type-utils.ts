export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type LargeAlphabet = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
export type SmallAlphabet = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';
export type Char = Digit | LargeAlphabet | SmallAlphabet;
export type FirstNChars<S extends string> = S extends `${infer T}${Char}` ? FirstNChars<T> | S : never;

export type KishuForeignLang = 'en' | 'de' | 'fr' | 'zh' | 'ru' | 'es' | 'ko' | 'it' | 'ja';
export type ShoshuForeignLang = 'de' | 'fr' | 'zh' | 'ru' | 'es' | 'ko' | 'it';
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

export type Karui = 'HSS1' | 'HSS2' | 'HSS3' | 'NS1' | 'NS2' | 'NS3';

