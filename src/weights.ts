import {engPoint, sumWeightedCredit, sumWeightedPoint} from "./index.js";
import {match} from './course-code.js';
import {Credit} from "./course.js"
import {allocate} from "./quota/utils.js";
import {Quota, Requirements} from "./quota/definition.js";
import {ScoredCourseReport, SpecificScoredReport, ordering} from "./report.js";

// 重率の計算に当たっては2単位科目でも1単位ごとに分けて処理されるので，各単位を代表するデータ型を定義
export type WeightedUnit = {
  report: ScoredCourseReport;
  weight: Weight;
  expls: Expl[]; // 重率が weight になった理由
};
export type Weighted = {
  report: ScoredCourseReport;
  weights: { credit: Credit; value: Weight; expls: Expl[]; }[];
};
export type Expl = {
  description: string;
  references: string[];
};

export type Weight = 0 | 0.1 | 1 | 1.5 | 2 | 5;

export const isSpecificWeightedUnit = (w: WeightedUnit): w is { [K in keyof WeightedUnit]: K extends 'report' ? SpecificScoredReport : WeightedUnit[K] } => w.report.course != null;

/**
 * 同じReportのWeightedUnitをまとめてWeightedにする
 */
export const bundle = (us: readonly WeightedUnit[]): Weighted[] => {
  const map = new Map<ScoredCourseReport, WeightedUnit[]>;
  for (const { report } of us) map.set(report, []);
  for (const u of us) map.get(u.report)!.push(u);
  return [...map].map(([r, us]) => {
    const weights = us.map(u => ({ credit: 1 as Credit, value: u.weight, expls: Array.from(u.expls) }));
    for (let i = 1; i < weights.length; ++i) {
      for (let j = 0; j < i; ++j) {
        if (weights[j].value == weights[i].value) {
          weights[j].credit += 1;
          weights.splice(i, 1);
          break;
        }
      }
    }
    return { report: r, weights };
  });
};

/**
 * 修了要件と履修科目の成績から基本平均点における重率を計算する
 */
export const distributeBasic = (reports: readonly SpecificScoredReport[], requirements: Requirements): WeightedUnit[] => {
  const remains = new Remain(requirements.quotas, reports);
  const ones = new Distribution(requirements.quotas);
  const point1 = new Distribution(requirements.quotas);
  const expls1 = new Map<ScoredCourseReport, Expl>;
  const expls01 = new Map<ScoredCourseReport, Expl[]>;

  // quotaに該当する科目のうち重率1の単位を決める関数
  const distribute1 = (quota: Quota) => {
    quota.subQuotas.forEach(distribute1);

    const distributedSubQ = quota.subQuotas.filter(sq => sq.n != null || ones.count(sq) >= 1);

    // minSub を満たすように順番にとっていく
    const it = remains.under(quota);
    for (const [q, r] of it) {
      if (distributedSubQ.length >= quota.minSub) break;
      const sq = quota.subQuotas.find(sq => match(sq.scope, r.course.code))!;
      if (!distributedSubQ.includes(sq)) {
        const errors = ones.check(q, r, 1);
        if (errors.length == 0) {
          ones.add(q, r);
          expls1.set(r, {
            description: `「${quota.name}」は${quota.subQuotas.map(sq=>`「${sq.name}」`).join('，')}のうち${quota.minSub}以上の枠が重率1の単位で埋まっている必要がある`,
            references: ['p.9', 'p.56 ※印'],
          });
          it.consume();
          distributedSubQ.push(sq);
        }
      }
    }

    // minSub が満たされるまで0点算入する
    for (const sq of quota.subQuotas) {
      if (distributedSubQ.length >= quota.minSub) break;
      if (!distributedSubQ.includes(sq)) {
        const r: ScoredCourseReport = { type: 'unenrolled-somewhat', scope: sq.scope, grade: '未履修', point: 0 };
        ones.add(sq, r);
        expls1.set(r, {
          description: `「${quota.name}」は${quota.subQuotas.map(sq=>`「${sq.name}」`).join('，')}のうち${quota.minSub}以上の枠が重率1の単位で埋まっている必要がある`,
          references: ['p.9', 'p.56 ※印'],
        });
        distributedSubQ.push(sq);
      }
    }

    // 余計に0点算入している場合
    if (distributedSubQ.length > quota.minSub) {
      const reitensanyuCounts = distributedSubQ.map<[Quota, number]>(sq => [sq, ones.countUnenrolled(sq)]).toSorted(([, a], [, b]) => a - b);
      for (const [sq] of reitensanyuCounts.slice(quota.minSub)) ones.filter(sq, r => r.type != 'unenrolled-specific' && r.type != 'unenrolled-somewhat');
    }

    if (quota.n != null) {
      const it2 = remains.under(quota);
      for (const [q, r] of it2) {
        if (ones.count(quota) >= quota.n) break;

        const errors = ones.check(q, r, 1);
        if (errors.length == 0) {
          ones.add(q, r);
          expls1.set(r, {
            description: `「${quota.name}」のうち成績上位${quota.n}単位は重率1`,
            references: ['p.9', 'p.56 ※印'],
          });
          it2.consume();
        } else {
        }
      }

      const lack = quota.n - ones.count(quota);
      if (lack > 0) {
        for (let i = 0; i < lack; ++i) {
          const r: ScoredCourseReport = { type: 'unenrolled-somewhat', scope: quota.scope, grade: '未履修', point: 0 };
          ones.add(quota, r);
          expls1.set(r, {
            description: `「${quota.name}」のうち成績上位${quota.n}単位は重率1`,
            references: ['p.9', 'p.56 ※印'],
          });
        }
      }
    }
  };
  requirements.quotas.forEach(distribute1);

  const it3 = remains.all();
  for (const [q, r] of it3) {
    const errors1 = ones.check(q, r, 1);
    const errors01 = point1.check(q, r, 0.1);
    if (errors01.length == 0) {
      point1.add(q, r);
      expls01.set(r, errors1.concat([{description:"重率1の枠に入らなかった単位は重率0.1", references: ['p.56']}]));
      it3.consume();
    } else {
      expls01.set(r, errors1.concat(errors01));
    }
  }

  const w1: WeightedUnit[] = ones.values().map(r => ({ report: r, weight: 1, expls: [expls1.get(r)!] }));
  const w01: WeightedUnit[] = point1.values().map(r => ({ report: r, weight: .1, expls: expls01.get(r) ?? [] }));
  const w0: WeightedUnit[] = [...remains.all()].map(([, r]) => ({ report: r, weight: 0, expls: expls01.get(r) ?? [] }));

  return [...w1, ...w01, ...w0];
};

/**
 * 修了要件と履修科目の成績から工学部指定平均点における重率を計算する
 */
export const distributeEng = (reports: readonly SpecificScoredReport[], requirements: Requirements): WeightedUnit[] => {
  const wu = distributeBasic(reports, requirements);
  const weighted01 = wu
    .filter(u => u.weight === 0.1)
    .toSorted((a, b) => -(a.report.point - b.report.point)); // 同評点の科目を区別する必要はない

  for (const u of weighted01) {
    const point = engPoint(u.report.point);
    const weights = bundle(wu);
    if (point <= sumWeightedPoint(weights, true).div(sumWeightedCredit(weights)).toNumber()) break;
    u.weight = 1;
    u.expls.push({
      description: '工学部は点数ができるだけ高くなるように重率1に含める',
      references: ['p.97'],
    });
  }

  return wu;
};

/**
 * 教養学部後期課程の超域文化科学の指定平均点の重率を計算する
 */
export const distributeChoiki = (reports: readonly SpecificScoredReport[]): WeightedUnit[] => {
  const reps = reports.toSorted((a, b) => -ordering(a, b));
  const n = Math.round(reps.length * 6 / 10);
  const wu: WeightedUnit[] = [];

  for (const [k, report] of reps.entries()) {
    for (let i = 0; i < report.course.credit; ++i) {
      wu.push({
        report,
        weight: k < n ? 1 : 0.1,
        expls: [{
          description: k < n
            ? '点数がつく全履修科目のうち点数上位6割（四捨五入）の科目の重率が1'
            : '残った科目の重率は0.1',
          references: ['p.97'],
        }],
      });
    }
  }

  return wu;
};

class Remain {
  #map: Map<Quota, Map<SpecificScoredReport, Credit>>;

  constructor(quotas: readonly Quota[], reports: readonly SpecificScoredReport[]) {
    this.#map = new Map;

    for (const [q, rs] of allocate(quotas, reports)) {
      const map = new Map<SpecificScoredReport, Credit>;
      for (const r of rs) map.set(r, r.course.credit);
      this.#map.set(q, map);
    }
  }

  *#getUnder(q: Quota): Generator<[Quota, SpecificScoredReport]> {
    for (const sq of q.subQuotas) yield* this.#getUnder(sq);
    for (const [r, c] of this.#map.get(q)!) for (let i = 0; i < c; ++i) yield [q, r];
  }
  *#getAll(): Generator<[Quota, SpecificScoredReport]> {
    for (const [q, m] of this.#map)
      for (const [r, c] of m)
        for (let i = 0; i < c; ++i) yield [q, r];
  }

  all(): IterableIterator<[Quota, SpecificScoredReport]> & { consume: () => void; } {
    const rs = [...this.#getAll()].toSorted(([, a], [, b]) => -ordering(a, b));

    let i = -1;
    return {
      next: () => {
        const r = rs.at(++i);
        if (r == null) return { done: true, value: void 0 };
        return { done: false, value: r }
      },
      consume: () => {
        const [q, r] = rs[i];
        const map = this.#map.get(q)!;
        switch (map.get(r)!) {
          case 1: {
            map.delete(r);
            break;
          }
          case 2: {
            map.set(r, 1);
            break;
          }
        }
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  }

  under(q: Quota): IterableIterator<[Quota, SpecificScoredReport]> & { consume: () => void; } {
    const rs = [...this.#getUnder(q)].toSorted(([, a], [, b]) => -ordering(a, b));

    let i = -1;
    return {
      next: () => {
        const r = rs.at(++i);
        if (r == null) return { done: true, value: void 0 };
        return { done: false, value: r }
      },
      consume: () => {
        const [q, r] = rs[i];
        const map = this.#map.get(q)!;
        switch (map.get(r)!) {
          case 1: {
            map.delete(r);
            break;
          }
          case 2: {
            map.set(r, 1);
            break;
          }
        }
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  }
}

class Distribution {
  #map: Map<Quota, { parent?: Quota; count: number; rs: ScoredCourseReport[] }>;
  constructor(quotas: readonly Quota[]) {
    this.#map = new Map;
    
    const inner = (quota: Quota) => {
      if (!this.#map.has(quota)) this.#map.set(quota, { count: 0, rs: [] });
      for (const sq of quota.subQuotas) {
        this.#map.set(sq, { parent: quota, count: 0, rs: [] });
        inner(sq);
      }
    };

    quotas.forEach(inner);
  }
  #updateCount(q: Quota, delta: number) {
    const data = this.#map.get(q)!;
    data.count += delta;
    if (data.parent != null) this.#updateCount(data.parent, delta);
  }
  add(q: Quota, r: ScoredCourseReport) {
    const data = this.#map.get(q)!;
    data.rs.push(r);
    this.#updateCount(q, +1);
  }
  filter(q: Quota, predicate: (r: ScoredCourseReport) => boolean) {
    const data = this.#map.get(q)!;
    const filtered = data.rs.filter(r => predicate(r));
    this.#updateCount(q, filtered.length - data.rs.length);
    data.rs = filtered;

    q.subQuotas.forEach(sq => this.filter(sq, predicate));
  }
  get(q: Quota): readonly ScoredCourseReport[] {
    return this.#map.get(q)?.rs ?? [];
  }
  count(q: Quota): number {
    return this.#map.get(q)!.count;
  }
  countUnenrolled(q: Quota): number {
    return this.#map.get(q)!.rs.filter(r => r.type == 'unenrolled-specific' || r.type == 'unenrolled-somewhat').length
      + q.subQuotas.reduce((p, q) => p + this.countUnenrolled(q), 0);
  }
  check(q: Quota, r: SpecificScoredReport, w: 1 | 0.1): Expl[] {
    const { parent, rs } = this.#map.get(q)!;

    const scored = rs.filter((r): r is ScoredCourseReport => r.type == 'scored');
    const descs = q.forCalculation.constraints
      .map(({ description, references, verify }) => verify(scored, r, w) ? void 0 : { description, references })
      .filter(<T>(v: T): v is Exclude<T, undefined> => v !== undefined);

    return [...descs, ...(parent == null ? [] : this.check(parent, r, w))];
  }

  values(): ScoredCourseReport[] {
      return [...this.#map.values()].flatMap(v=>v.rs);
  }
}
