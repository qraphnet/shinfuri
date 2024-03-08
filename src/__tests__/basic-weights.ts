import { describe, expect, test } from '@jest/globals';
import {Credit, Term} from "../course.js";
import { ScoredGrade, SpecificReport } from '../report.js';
import {generateRequirements} from '../quota/shuryo.js';
import {CourseCode} from '../course-code.js';
import {calculate, makeTicket} from '../index.js';

const $ = (code: CourseCode, term: Term, credit: Credit, grade: ScoredGrade, point: number): SpecificReport => ({
  type: 'scored', course: { code, term, credit }, grade, point,
});

// cf. https://zenkyomu.c.u-tokyo.ac.jp/sentaku/heikinten-sample.pdf

const reportsHSS1: SpecificReport[] = [
  $('FC111', '2021S', 1, '良', 74),
  $('FC112', '2021A', 1, '良', 66),
  $('FC113', '2021S', 1, '良', 74),
  $('FC114', '2021A', 2, '優', 80),
  $('FC271', '2021S', 2, '可', 61),
  $('FC272', '2021A', 2, '良', 66),
  $('FC273', '2021S', 2, '良', 68),
  $('FC300', '2021S', 2, '良', 73),
  $('FC410', '2021S', 1, '優上', 91),
  $('FC420', '2021A', 1, '優', 87),
  $('FC510', '2021S', 2, '優上', 90),
  $('FC611', '2021S', 2, '優', 72),
  $('FC612', '2021S', 2, '良', 67),
  $('FC641', '2021A', 2, '不可', 40),
  $('FC712', '2021A', 2, '可', 62),
  $('FC752', '2021A', 2, '優', 80),
  $('GCL11', '2021A', 1, '良', 72),
  $('GCL11', '2021S', 2, '良', 77),
  $('GCL25', '2021A', 2, '良', 65),
  $('GCL82', '2021S', 2, '可', 62),
  $('GCL83', '2021A', 2, '可', 62),
  $('GCLx1', '2021S', 2, '良', 79),
  $('GCA34', '2021S', 2, '良', 65),
  $('GCB13', '2021A', 2, '優', 82),
  $('GCC21', '2021A', 2, '可', 60),
  $('GCC11', '2021A', 2, '可', 50),
  $('GCC52', '2021A', 2, '良', 65),
  $('GCD33', '2021S', 2, '欠席', 0),
  $('GCD43', '2021S', 2, '優', 84),
  $('GCDa4', '2021A', 2, '優上', 93),
  $('GCE17', '2021S', 2, '良', 73),
];

describe('heikinten sample of a HSS1 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'HSS1',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'it', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsHSS1, shuryoRequirements, 'HSS1', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(68.91732283464567);
  })
});

const reportsHSS2: SpecificReport[] = [
  $('FC111', '2021S', 1, '良', 74),
  $('FC112', '2021A', 1, '良', 66),
  $('FC113', '2021S', 1, '良', 74),
  $('FC114', '2021A', 2, '優', 80),
  $('FC211', '2021S', 2, '可', 61),
  $('FC212', '2021A', 2, '良', 66),
  $('FC213', '2021S', 2, '良', 68),
  $('FC300', '2021S', 2, '良', 73),
  $('FC410', '2021S', 1, '優上', 91),
  $('FC420', '2021A', 1, '優', 87),
  $('FC510', '2021S', 2, '優上', 90),
  $('FC631', '2021S', 2, '優', 72),
  $('FC651', '2021S', 2, '良', 67),
  $('FC652', '2021A', 2, '不可', 40),
  $('FC712', '2021A', 2, '可', 62),
  $('FC752', '2021A', 2, '優', 80),
  $('GCL11', '2021A', 1, '良', 72),
  $('GCL11', '2021S', 2, '良', 77),
  $('GCL25', '2021A', 2, '良', 65),
  $('GCL22', '2021S', 2, '可', 62),
  $('GCL22', '2021A', 2, '可', 62),
  $('GCLx1', '2021S', 2, '良', 79),
  $('GCA34', '2021S', 2, '良', 65),
  $('GCB13', '2021A', 2, '優', 82),
  $('GCC21', '2021A', 2, '可', 60),
  $('GCC11', '2021A', 2, '可', 50),
  $('GCC52', '2021A', 2, '良', 65),
  $('GCD33', '2021S', 2, '欠席', 0),
  $('GCD43', '2021S', 2, '優', 84),
  $('GCDa4', '2021A', 2, '優上', 93),
  $('GCE17', '2021S', 2, '良', 73),
];

describe('heikinten sample of a HSS2 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'HSS2',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'de', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsHSS2, shuryoRequirements, 'HSS2', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(68.91732283464567);
  })
});

const reportsHSS3: SpecificReport[] = [
  $('FC111', '2021S', 1, '良', 77),
  $('FC112', '2021A', 1, '良', 78),
  $('FC113', '2021S', 1, '優', 83),
  $('FC114', '2021A', 2, '良', 73),
  $('FC221', '2021S', 2, '優', 85),
  $('FC222', '2021A', 2, '優', 87),
  $('FC223', '2021S', 2, '優', 85),
  $('FC300', '2021S', 2, '優', 82),
  $('FC410', '2021S', 1, '優', 88),
  $('FC420', '2021A', 1, '優', 84),
  $('FC510', '2021S', 2, '可', 54),
  $('FC611', '2021A', 2, '良', 65),
  $('FC712', '2021A', 2, '良', 77),
  $('FC751', '2021S', 2, '良', 67),
  $('FC721', '2021S', 2, '不可', 44),
  $('GCL11', '2021A', 1, '良', 79),
  $('GCL11', '2021S', 2, '優', 80),
  $('GCL38', '2021S', 2, '優上', 100),
  $('GCL38', '2021S', 2, '優上', 100),
  $('GCL38', '2021A', 2, '優上', 100),
  $('GCL38', '2021A', 2, '優', 80),
  $('GCL32', '2021S', 2, '優', 84),
  $('GCL33', '2021A', 2, '良', 79),
  $('GCB23', '2021A', 2, '良', 65),
  $('GCC23', '2021S', 2, '優上', 90),
  $('GCC52', '2021A', 2, '良', 75),
  $('GCD34', '2021S', 2, '良', 66),
  $('GCD35', '2021A', 2, '良', 75),
  $('GCDc2', '2021A', 2, '良', 71),
  $('GCE54', '2021S', 2, '優', 84),
];

describe('heikinten sample of a HSS3 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'HSS3',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'fr', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsHSS3, shuryoRequirements, 'HSS3', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(76.81547619047619);
  })
});

const reportsNS1: SpecificReport[] = [
  $('FC111', '2021S', 1, '良', 77),
  $('FC112', '2021A', 1, '良', 75),
  $('FC113', '2021S', 1, '良', 74),
  $('FC114', '2021A', 2, '良', 72),
  $('FC221', '2021S', 2, '不可', 48),
  $('FC222', '2021A', 2, '良', 69),
  $('FC223', '2021S', 2, '可', 57),
  $('FC300', '2021S', 2, '優', 86),
  $('FC410', '2021S', 1, '優上', 90),
  $('FC420', '2021A', 1, '優', 86),
  $('FC821', '2021A', 1, '優上', 90),
  $('FC822', '2021A', 1, '優', 89),
  $('FC871', '2021S', 2, '優上', 95),
  $('FC873', '2021S', 1, '良', 69),
  $('FC874', '2021A', 2, '良', 69),
  $('FC875', '2021S', 1, '良', 76),
  $('FC876', '2021A', 2, '良', 76),
  $('FC877', '2021S', 1, '優上', 97),
  $('FC878', '2021S', 1, '優上', 95),
  $('FC879', '2021A', 1, '良', 71),
  $('FC87a', '2021A', 1, '良', 78),
  $('FC881', '2021S', 2, '不可', 46),
  $('FC883', '2021A', 2, '良', 75),
  $('FC885', '2021S', 2, '優', 88),
  $('FC887', '2021A', 2, '良', 70),
  $('GCL11', '2021A', 1, '優', 80),
  $('GCL11', '2021S', 2, '良', 77),
  $('GCC41', '2021S', 2, '良', 70),
  $('GCD12', '2021S', 2, '良', 68),
  $('GCE11', '2021A', 2, '良', 75),
  $('GCE24', '2021A', 2, '優', 87),
  $('GCF31', '2021S', 2, '良', 72),
  $('GCF21', '2021A', 2, '優', 88),
  $('GCF41', '2021A', 2, '優', 86),
];

describe('heikinten sample of a NS1 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'NS1',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'fr', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsNS1, shuryoRequirements, 'NS1', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(67.91489361702128);
  })
});

const reportsNS2: SpecificReport[] = [
  $('FC111', '2021S', 1, '可', 55),
  $('FC112', '2021A', 1, '良', 75),
  $('FC113', '2021S', 1, '良', 66),
  $('FC114', '2021A', 2, '良', 68),
  $('FC221', '2021S', 2, '優', 86),
  $('FC222', '2021A', 2, '良', 65),
  $('FC223', '2021S', 2, '優', 85),
  $('FC300', '2021S', 2, '優', 88),
  $('FC410', '2021S', 1, '良', 77),
  $('FC420', '2021A', 1, '優', 88),
  $('FC830', '2021A', 1, '優', 83),
  $('FC840', '2021A', 1, '良', 76),
  $('FC871', '2021S', 2, '可', 58),
  $('FC873', '2021S', 1, '可', 60),
  $('FC874', '2021A', 2, '可', 60),
  $('FC875', '2021S', 1, '良', 72),
  $('FC876', '2021A', 2, '良', 72),
  $('FC877', '2021S', 1, '不可', 48),
  $('FC878', '2021S', 1, '良', 74),
  $('FC879', '2021A', 1, '可', 60),
  $('FC87a', '2021A', 1, '良', 70),
  $('FC881', '2021S', 2, '良', 67),
  $('FC883', '2021A', 2, '可', 50),
  $('FC887', '2021A', 2, '可', 59),
  $('FC886', '2021S', 2, '可', 55),
  $('FC892', '2021S', 2, '可', 51),
  $('FC893', '2021A', 2, '可', 50),
  $('GCL11', '2021A', 1, '良', 74),
  $('GCL11', '2021S', 2, '良', 74),
  $('GCC51', '2021A', 2, '可', 55),
  $('GCD82', '2021A', 2, '良', 72),
  $('GCE41', '2021A', 2, '不可', 35),
  $('GCE46', '2021A', 2, '良', 66),
  $('GCF31', '2021S', 2, '不可', 25),
];

describe('heikinten sample of a NS2 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'NS2',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'fr', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsNS2, shuryoRequirements, 'NS2', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(58.58844133099825);
  })
});

const reportsNS3: SpecificReport[] = [
  $('FC111', '2021S', 1, '良', 78),
  $('FC112', '2021A', 1, '良', 74),
  $('FC113', '2021A', 1, '良', 70),
  $('FC114', '2021S', 2, '優', 80),
  $('FC251', '2021S', 2, '優', 89),
  $('FC252', '2021A', 2, '優', 88),
  $('FC253', '2021S', 2, '良', 77),
  $('FC300', '2021S', 2, '良', 77),
  $('FC410', '2021S', 1, '優', 82),
  $('FC420', '2021A', 1, '優', 81),
  $('FC830', '2021A', 1, '優', 86),
  $('FC840', '2021A', 1, '優', 86),
  $('FC871', '2021S', 2, '良', 72),
  $('FC873', '2021S', 1, '優', 84),
  $('FC874', '2021A', 2, '優', 84),
  $('FC875', '2021S', 1, '良', 67),
  $('FC876', '2021A', 2, '良', 67),
  $('FC879', '2021A', 1, '優上', 94),
  $('FC87a', '2021A', 1, '良', 70),
  $('FC882', '2021S', 2, '優上', 90),
  $('FC884', '2021A', 2, '良', 70),
  $('FC887', '2021A', 2, '優', 89),
  $('FC886', '2021S', 2, '優', 87),
  $('FC892', '2021S', 2, '優', 84),
  $('FC893', '2021A', 2, '優', 89),
  $('GCL11', '2021A', 1, '良', 78),
  $('GCL11', '2021S', 2, '良', 79),
  $('GCL68', '2021A', 2, '優', 82),
  $('GCL68', '2021A', 2, '優', 82),
  $('GCB14', '2021S', 2, '良', 75),
  $('GCC52', '2021S', 2, '優', 80),
  $('GCD52', '2021A', 2, '良', 75),
  $('GCE56', '2021S', 1, '良', 71),
  $('GCF41', '2021A', 2, '良', 79),
  $('GCF48', '2021S', 2, '優', 86),
  $('GCF49', '2021A', 2, '良', 79),
];

describe('heikinten sample of a NS3 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'NS3',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'es', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsNS3, shuryoRequirements, 'NS3', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(76.08173913043478);
  })
});

// cf. https://zenkyomu.c.u-tokyo.ac.jp/sentaku/heikinten-L-sample.pdf

const reportsHSS1L: SpecificReport[] = [
  $('FC111', '2021S', 1, '良', 74),
  $('FC112', '2021A', 1, '優', 86),
  $('FC113', '2021S', 1, '優', 80),
  $('FC114', '2021A', 2, '優上', 92),
  $('FC271', '2021S', 2, '可', 64),
  $('FC272', '2021A', 2, '可', 60),
  $('FC273', '2021S', 2, '可', 64),
  $('FC300', '2021S', 2, '優', 86),
  $('FC410', '2021S', 1, '優', 85),
  $('FC420', '2021A', 1, '優上', 98),
  $('FC510', '2021S', 2, '優', 83),
  $('FC611', '2021S', 2, '優', 84),
  $('FC612', '2021A', 2, '優', 82),
  $('FC641', '2021S', 2, '可', 62),
  $('FC642', '2021A', 2, '良', 75),
  $('FC712', '2021A', 2, '優', 86),
  $('FC752', '2021A', 2, '良', 69),
  $('GCL11', '2021A', 2, '優上', 92),
  $('GCL11', '2021A', 1, '良', 73),
  $('GCL11', '2021S', 2, '良', 72),
  $('GCL82', '2021S', 2, '良', 73),
  $('GCL83', '2021A', 2, '優', 85),
  $('GCA25', '2021S', 2, '優上', 99),
  $('GCA51', '2021S', 2, '良', 77),
  $('GCA44', '2021A', 2, '良', 78),
  $('GCB12', '2021S', 2, '良', 76),
  $('GCD43', '2021S', 2, '優上', 94),
  $('GCD53', '2021S', 2, '良', 79),
  $('GCDb2', '2021A', 1, '良', 76),
  $('GCE17', '2021A', 1, '優', 81),
];

describe('heikinten L sample of a HSS1 student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'HSS1',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'it', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsHSS1L, shuryoRequirements, 'HSS1', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(79.26892430278885);
  })
});

const reportsHSS1TLPL: SpecificReport[] = [
  $('FC111', '2021S', 1, '優上', 92),
  $('FC112', '2021A', 1, '優', 82),
  $('FC113', '2021S', 1, '良', 75),
  $('FC114', '2021A', 2, '優', 83),
  $('FC221', '2021S', 2, '優上', 91),
  $('FC222', '2021A', 2, '優上', 90),
  $('FC223', '2021S', 2, '優上', 91),
  $('FC300', '2021S', 2, '良', 78),
  $('FC410', '2021S', 1, '優', 81),
  $('FC420', '2021A', 1, '優上', 99),
  $('FC510', '2021S', 2, '優上', 95),
  $('FC611', '2021S', 2, '優', 84),
  $('FC612', '2021A', 2, '良', 70),
  $('FC641', '2021S', 2, '良', 70),
  $('FC642', '2021A', 2, '優上', 99),
  $('FC711', '2022S', 2, '優', 83),
  $('FC712', '2021A', 2, '可', 63),
  $('FC731', '2021S', 2, '優', 80),
  $('GCL11', '2021A', 2, '優上', 95),
  $('GCL11', '2021A', 1, '優', 84),
  $('GCL11', '2021S', 2, '優', 86),
  $('GCL38', '2021A', 2, '優', 83),
  $('GCL38', '2021A', 2, '優', 83),
  $('GCL3f', '2022S', 2, '優', 83),
  $('GCL3f', '2022S', 2, '優', 83),
  $('GCL3a', '2022S', 2, '優上', 91),
  $('GCLy1', '2021S', 2, '良', 65),
  $('GCL32', '2021S', 2, '優', 84),
  $('GCL33', '2021A', 2, '優上', 97),
  $('GCA37', '2022S', 2, '優上', 90),
  $('GCA35', '2022S', 2, '優上', 97),
  $('GCA55', '2021S', 2, '優上', 92),
  $('GCA44', '2021A', 2, '良', 78),
  $('GCB12', '2021S', 2, '優', 82),
  $('GCC11', '2021A', 2, '欠席', 0),
  $('GCD33', '2021S', 2, '優上', 95),
  $('GCD34', '2021A', 2, '優', 86),
  $('GCF31', '2021A', 2, '優上', 100),
];

describe('heikinten L sample of a HSS1 TLP student', () => {
  test('accurate heikinten', () => {
    const shuryoRequirements = generateRequirements({
      karui: 'HSS1',
      firstForeignLanguage: 'en',
      secondForeignLanguage: { lang: 'fr', learned: false },
      forCalculation: true,
    });
    const ticket = makeTicket(reportsHSS1TLPL, shuryoRequirements, 'HSS1', '基本平均点', 1, []);
    const heikinten = calculate(ticket).toNumber();
    expect(heikinten).toBe(87.13076923076923);
  })
});

