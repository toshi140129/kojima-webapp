import type { Race } from "./types";

export type FilterState = {
  yearFrom: number | null;
  yearTo: number | null;
  weekdays: string[];
  rnos: number[];
  windMin: number | null;
  windMax: number | null;
  waveMin: number | null;
  waveMax: number | null;
  tides: string[];
  grade1: string[];
};

export const defaultFilter: FilterState = {
  yearFrom: null,
  yearTo: null,
  weekdays: [],
  rnos: [],
  windMin: null,
  windMax: null,
  waveMin: null,
  waveMax: null,
  tides: [],
  grade1: [],
};

export function applyFilter(data: Race[], f: FilterState): Race[] {
  return data.filter((r) => {
    const year = parseInt(r.date.slice(0, 4), 10);
    if (f.yearFrom !== null && year < f.yearFrom) return false;
    if (f.yearTo !== null && year > f.yearTo) return false;
    if (f.weekdays.length && !f.weekdays.includes(r.weekday)) return false;
    if (f.rnos.length && !f.rnos.includes(r.rno)) return false;
    const wind = parseFloat(r.wind);
    if (f.windMin !== null && (!Number.isFinite(wind) || wind < f.windMin)) return false;
    if (f.windMax !== null && (!Number.isFinite(wind) || wind > f.windMax)) return false;
    const wave = parseFloat(r.wave);
    if (f.waveMin !== null && (!Number.isFinite(wave) || wave < f.waveMin)) return false;
    if (f.waveMax !== null && (!Number.isFinite(wave) || wave > f.waveMax)) return false;
    if (f.tides.length && !f.tides.includes(r.tide)) return false;
    const g1 = r.racers[0]?.grade ?? "";
    if (f.grade1.length && !f.grade1.includes(g1)) return false;
    return true;
  });
}

export function years(data: Race[]): number[] {
  const set = new Set<number>();
  for (const r of data) {
    const y = parseInt(r.date.slice(0, 4), 10);
    if (Number.isFinite(y)) set.add(y);
  }
  return [...set].sort((a, b) => a - b);
}
