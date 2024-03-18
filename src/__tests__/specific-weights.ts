import { describe, expect, test } from '@jest/globals';
import {Credit, Term} from "../course.js";
import { ScoredGrade, SpecificReport } from '../report.js';
import {generateRequirements} from '../quota/shuryo.js';
import {CourseCode} from '../course-code.js';
import {calculate, makeTicket} from '../index.js';
import {LanguageOption} from '../type-utils.js';

const $ = (code: CourseCode, year: number, term: Term, credit: Credit, grade: ScoredGrade, point: number): SpecificReport => ({
  type: 'scored', course: { code, year, term, credit }, grade, point,
});

// cf. https://www.c.u-tokyo.ac.jp/zenki/shitei-sampleA-1.pdf

describe('shitei sample A', () => {
  const reports: SpecificReport[] = [
    $('FC111', 2022, 'S', 1, '可', 54),
    $('FC112', 2022, 'A', 1, '可', 53),
    $('FC113', 2022, 'S', 1, '良', 70),
    $('FC114', 2022, 'A', 2, '可', 59),
    $('FC221', 2022, 'S', 2, '良', 75),
    $('FC222', 2022, 'A', 2, '可', 51),
    $('FC223', 2022, 'S', 2, '良', 70),
    $('FC300', 2022, 'S', 2, '良', 69),
    $('FC410', 2022, 'S', 1, '優', 86),
    $('FC420', 2022, 'A', 1, '優', 89),
    { type: 'unscored', course: { code: 'FC520', year: 2022, term: 'S', credit: 2 }, grade: '合格' },
    $('FC830', 2022, 'A', 1, '良', 74),
    $('FC840', 2022, 'A', 1, '良', 78),
    $('FC850', 2023, 'S', 1, '良', 75),
    $('FC871', 2022, 'S', 2, '可', 60),
    $('FC873', 2022, 'S', 1, '可', 62),
    $('FC874', 2022, 'A', 2, '可', 62),
    $('FC875', 2022, 'S', 1, '優', 81),
    $('FC876', 2022, 'A', 2, '優', 81),
    $('FC879', 2022, 'A', 1, '良', 70),
    $('FC87a', 2022, 'A', 1, '可', 58),
    $('FC881', 2022, 'S', 2, '可', 50),
    $('FC882', 2022, 'A', 2, '優', 88),
    $('FC887', 2022, 'A', 2, '良', 71),
    $('FC886', 2022, 'S', 2, '可', 50),
    $('FC888', 2023, 'S', 2, '良', 69),
    $('FC892', 2022, 'S', 2, '良', 64),
    $('FC893', 2022, 'A', 2, '不可', 41),
    $('GCL11', 2022, 'A', 1, '可', 55),
    $('GCL11', 2022, 'S', 2, '良', 68),
    $('GCC52', 2022, 'A', 2, '可', 50),
    $('GCD31', 2022, 'A', 2, '良', 73),
    $('GCD33', 2022, 'A', 2, '良', 70),
    $('GCE38', 2022, 'A', 2, '良', 76),
    $('GCE41', 2022, 'A', 2, '優', 84),
    $('GCF31', 2022, 'S', 2, '不可', 40),
    $('GCF48', 2022, 'S', 2, '良', 69),
    { type: 'unscored', course: { code: 'TC200', year: 2022, term: 'A', credit: 2 }, grade: '合格' },
    { type: 'unscored', course: { code: 'TC200', year: 2022, term: 'A', credit: 2 }, grade: '合格' },
  ];

  const karui = 'NS2', langOption: LanguageOption = { firstForeignLanguage: 'en', secondForeignLanguage: { lang: 'fr', learned: false } };

  test('basic heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '基本平均点', phase: 1, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(66.66083916083916);
  })

  test('choiki heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '教養/教養学科/超域文化科学', phase: 2, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(73.04960835509138);
  })

  test('engineering heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '工学部指定平均点', phase: 1, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(4.003496503496503);
  })
  
  test('syssou(phase 2) heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '工/システム創生学科/A（環境・エネルギーシステム）', phase: 2, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(244.21328671328672);
  })

  test('agri and life heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '農学部指定平均点', phase: 1, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(4066.311188811189);
  })
});

// cf. https://www.c.u-tokyo.ac.jp/zenki/shitei-sampleB-1.pdf

describe('shitei sample B', () => {
  const reports: SpecificReport[] = [
    $('FC111', 2022, 'S', 1, '可', 60),
    $('FC112', 2022, 'A', 1, '優', 82),
    $('FC113', 2022, 'S', 1, '優', 80),
    $('FC114', 2022, 'A', 2, '良', 72),
    $('FC211', 2022, 'S', 2, '可', 64),
    $('FC212', 2022, 'A', 2, '優', 86),
    $('FC213', 2022, 'S', 2, '可', 53),
    $('FC300', 2022, 'S', 2, '優', 82),
    $('FC410', 2022, 'S', 1, '優上', 90),
    $('FC420', 2022, 'A', 1, '優', 88),
    $('FC510', 2022, 'S', 2, '良', 70),
    $('FC621', 2023, 'S', 2, '可', 60),
    $('FC631', 2022, 'S', 2, '欠席', 0),
    $('FC632', 2022, 'A', 2, '良', 74),
    $('FC641', 2023, 'S', 2, '優上', 93),
    $('FC651', 2022, 'A', 2, '可', 62),
    $('FC652', 2023, 'S', 2, '良', 65),
    $('FC711', 2022, 'S', 2, '可', 59),
    $('FC731', 2022, 'A', 2, '優', 83),
    $('GCL11', 2022, 'A', 1, '良', 79),
    $('GCL11', 2022, 'S', 2, '良', 79),
    $('GCL28', 2022, 'A', 2, '良', 73),
    $('GCL28', 2022, 'A', 2, '良', 73),
    $('GCL22', 2022, 'S', 2, '優', 82),
    $('GCL23', 2022, 'A', 2, '可', 53),
    $('GCB12', 2022, 'A', 2, '優', 88),
    $('GCC23', 2022, 'S', 2, '良', 65),
    $('GCC12', 2023, 'S', 2, '優上', 96),
    $('GCC52', 2023, 'S', 2, '優', 84),
    $('GCD34', 2022, 'S', 2, '良', 78),
    $('GCDa3', 2022, 'S', 2, '優', 86),
    $('GCE51', 2022, 'A', 2, '良', 77),
  ];
  const karui = 'HSS2', langOption: LanguageOption = { firstForeignLanguage: 'en', secondForeignLanguage: { lang: 'de', learned: false } };

  test('basic accurate heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '基本平均点', phase: 1, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(75.82213438735178);
  })
  
  test('sougoushakai heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '教養/教養学科/総合社会科学', phase: 1, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(76.5591054313099);
  })
  
  test('chiikibunka heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '教養/教養学科/地域文化研究', phase: 1, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(75.81684981684981);
  })

  test('shinrinseibutsu heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '農/応用生命科学/森林生物科学', phase: 2, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(82.60796324655436);
  })

  test('nogyo shigen heikinten', () => {
    const ticket = makeTicket(reports, { karui, group: 1, langOption, department: '農/環境資源科学/農業・資源経済学', phase: 2, exclude: [] });
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(75.75285171102662);
  })
});
