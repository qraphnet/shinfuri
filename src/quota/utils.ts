import {SpecificReport} from "../report.js";
import {exclude} from "../utils.js";
import {Quota, Requirements} from "./definition.js";

export const allocate = <T extends SpecificReport>(quotas: readonly Quota[], reports: readonly T[]): Map<Quota, T[]> => {
  const allocations = new Map<Quota, T[]>;
  const internal = (quotas: readonly Quota[], reports: T[]) => {
    for (const quota of quotas) {
      if (allocations.has(quota)) return;
      const qualifiedCourses = exclude(reports, r => quota.filter(r.course.code));
      allocations.set(quota, qualifiedCourses);
      internal(quota.subQuotas, qualifiedCourses);
    }
  };
  internal(quotas, Array.from(reports));
  return allocations;
}

// TODO: blameできるようにする
export const judgeSatisfaction = (requirements: Requirements, reports: readonly SpecificReport[]): boolean => {
  const allocations = allocate(requirements.quotas, reports);

  const surplus = new Set<SpecificReport>;
  const internalJudge = (quota: Quota): false | number => {
    let sum = 0, count = 0;
    for (const sq of quota.subQuotas) {
      const fulfilled = internalJudge(sq);
      if (fulfilled === false) return false;
      sum += fulfilled;
      if (sq.n != null || fulfilled > 0) count += 1;
    }
    if (count < quota.minSub) return false;
    sum += allocations.get(quota)!.reduce((acc, r) => surplus.has(r) ? acc : acc + r.course.credit, 0);
    if (quota.n != null && sum < quota.n) return false;
    return sum;
  }

  if (requirements.quotas.some(q => internalJudge(q) === false)) return false;

  const allocated = [...allocations.values()].flat();
  for (const report of allocated) {
    if (requirements.surplusConstraints.every(({verify}) => verify(Array.from(surplus), report))) {
      surplus.add(report);
      const nList = requirements.quotas.map(internalJudge);
      const satisfied = nList.every(<T>(n: T): n is Exclude<T, false> => n !== false) && nList.reduce<number>((p, c) => p + c,0) >= requirements.min;
      if (!satisfied) surplus.delete(report);
    }
  }
  const surplusCredits = [...surplus].reduce((p,r)=>p+r.course.credit,0);
  return surplusCredits >= requirements.surplusMin;
};
