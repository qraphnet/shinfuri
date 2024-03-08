export const unreachable = (description: string): never => {
  throw new Error(description);
};

export const exclude = <T>(arr: T[], pred: (v: T) => boolean): T[] => {
  const flags = arr.map(v => pred(v));
  const excluded: T[] = [];

  let i = flags.length - 1;
  while (i >= 0) {
    if (flags[i]) {
      let j = i - 1;
      while (j >= -1 && flags[j]) j -= 1;
      excluded.unshift(...arr.splice(j + 1, i - j));
      i = j;
    } else i -= 1;
  }

  return excluded;
}

