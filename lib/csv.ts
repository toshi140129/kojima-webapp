import type { Race, Racer } from "./types";

const RESULTS_URL =
  "https://raw.githubusercontent.com/toshi140129/kojima-boatrace/main/kojima_results.csv";

export async function fetchKojimaResults(): Promise<Race[]> {
  try {
    const res = await fetch(RESULTS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`CSV fetch failed: ${res.status}`);
      return [];
    }
    const text = await res.text();
    return parseCSV(text);
  } catch (e) {
    console.error("CSV fetch error:", e);
    return [];
  }
}

function parseCSV(text: string): Race[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const rows = lines.slice(1).filter((l) => l.trim());
  return rows.map((line) => parseRow(line)).filter((r): r is Race => r !== null);
}

function parseRow(line: string): Race | null {
  const cols = line.split(",");
  if (cols.length < 15) return null;
  const racers: Racer[] = [];
  for (let i = 0; i < 6; i++) {
    const base = 15 + i * 12;
    racers.push({
      name: cols[base] ?? "",
      grade: cols[base + 1] ?? "",
      zenkokuWin: cols[base + 2] ?? "",
      zenkoku2: cols[base + 3] ?? "",
      touchiWin: cols[base + 4] ?? "",
      kosetsu: cols[base + 5] ?? "",
      motor2: cols[base + 6] ?? "",
      boat2: cols[base + 7] ?? "",
      exTime: cols[base + 8] ?? "",
      exST: cols[base + 9] ?? "",
      fNum: cols[base + 10] ?? "",
      lNum: cols[base + 11] ?? "",
    });
  }
  return {
    date: cols[0],
    weekday: cols[1],
    rno: parseInt(cols[2], 10) || 0,
    p1: cols[3],
    p2: cols[4],
    p3: cols[5],
    pay: cols[6],
    ninki: cols[7],
    wind: cols[8],
    windDir: cols[9],
    wave: cols[10],
    temp: cols[11],
    waterTemp: cols[12],
    waterQuality: cols[13],
    tide: cols[14],
    racers,
  };
}
