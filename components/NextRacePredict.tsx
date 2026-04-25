"use client";
import { useMemo, useState } from "react";
import type { Race } from "@/lib/types";

const TIDES = ["大潮", "中潮", "小潮", "長潮", "若潮"];
const RNOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const TOP_N = 15;

export default function NextRacePredict({ data }: { data: Race[] }) {
  const [rno, setRno] = useState<number | null>(null);
  const [windBucket, setWindBucket] = useState<string>("");
  const [waveBucket, setWaveBucket] = useState<string>("");
  const [tide, setTide] = useState<string>("");
  const [grade1, setGrade1] = useState<string>("");

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (rno !== null && r.rno !== rno) return false;
      const w = parseFloat(r.wind);
      if (windBucket === "low" && !(Number.isFinite(w) && w <= 2)) return false;
      if (windBucket === "mid" && !(Number.isFinite(w) && w >= 3 && w <= 4)) return false;
      if (windBucket === "high" && !(Number.isFinite(w) && w >= 5)) return false;
      const v = parseFloat(r.wave);
      if (waveBucket === "low" && !(Number.isFinite(v) && v <= 2)) return false;
      if (waveBucket === "mid" && !(Number.isFinite(v) && v >= 3 && v <= 5)) return false;
      if (waveBucket === "high" && !(Number.isFinite(v) && v >= 6)) return false;
      if (tide && r.tide !== tide) return false;
      if (grade1 && r.racers[0]?.grade !== grade1) return false;
      return true;
    });
  }, [data, rno, windBucket, waveBucket, tide, grade1]);

  const ranking = useMemo(() => {
    if (filtered.length === 0) return [];
    const map = new Map<string, { count: number; pays: number[] }>();
    for (const r of filtered) {
      if (!r.p1 || !r.p2 || !r.p3) continue;
      const k = `${r.p1}-${r.p2}-${r.p3}`;
      const pay = parseInt(r.pay, 10);
      const e = map.get(k) ?? { count: 0, pays: [] };
      e.count += 1;
      if (Number.isFinite(pay)) e.pays.push(pay);
      map.set(k, e);
    }
    const total = filtered.length;
    const out: { kaime: string; prob: number; payAvg: number; ev: number }[] = [];
    for (const [kaime, v] of map) {
      const prob = (v.count / total) * 100;
      const payAvg = v.pays.length ? v.pays.reduce((s, p) => s + p, 0) / v.pays.length : 0;
      const ev = (v.count / total) * payAvg;
      out.push({ kaime, prob, payAvg, ev });
    }
    out.sort((a, b) => b.prob - a.prob);
    return out.slice(0, TOP_N);
  }, [filtered]);

  return (
    <div className="mb-6 rounded-lg border border-gray-700 p-4">
      <h2 className="font-bold mb-3 text-lg">次レース 買い目候補</h2>
      <p className="text-xs text-gray-400 mb-3">
        次に出走するレースの条件を入力すると、過去データの類似条件から3連単出現確率上位{TOP_N}点を提示。期待値=確率×平均払戻（100円購入時）。
      </p>

      <div className="space-y-2 text-xs mb-4">
        <Row label="レース番号">
          <select
            className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5"
            value={rno ?? ""}
            onChange={(e) => setRno(e.target.value ? parseInt(e.target.value, 10) : null)}
          >
            <option value="">指定なし</option>
            {RNOS.map((n) => (
              <option key={n} value={n}>
                R{n}
              </option>
            ))}
          </select>
        </Row>
        <Row label="風速">
          <Select value={windBucket} onChange={setWindBucket}>
            <option value="">指定なし</option>
            <option value="low">弱(0-2m)</option>
            <option value="mid">中(3-4m)</option>
            <option value="high">強(5m〜)</option>
          </Select>
        </Row>
        <Row label="波高">
          <Select value={waveBucket} onChange={setWaveBucket}>
            <option value="">指定なし</option>
            <option value="low">凪(0-2cm)</option>
            <option value="mid">中(3-5cm)</option>
            <option value="high">高(6cm〜)</option>
          </Select>
        </Row>
        <Row label="潮位">
          <Select value={tide} onChange={setTide}>
            <option value="">指定なし</option>
            {TIDES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Row>
        <Row label="1コース級別">
          <Select value={grade1} onChange={setGrade1}>
            <option value="">指定なし</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </Select>
        </Row>
        <div className="text-gray-500 pt-1">類似サンプル: {filtered.length} 件</div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-xs text-gray-500">該当データなし。条件を緩めてください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-1 pr-1 text-left">#</th>
                <th className="py-1 px-1 text-left">買い目</th>
                <th className="py-1 px-1 text-right">確率</th>
                <th className="py-1 px-1 text-right">平均払戻</th>
                <th className="py-1 px-1 text-right">期待値</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr
                  key={r.kaime}
                  className={`border-b border-gray-800 ${i < 3 ? "bg-yellow-900/20" : ""}`}
                >
                  <td className="py-1 pr-1 text-gray-400">{i + 1}</td>
                  <td className="py-1 px-1 font-mono text-gray-100">{r.kaime}</td>
                  <td className="py-1 px-1 text-right">{r.prob.toFixed(2)}%</td>
                  <td className="py-1 px-1 text-right">{Math.round(r.payAvg).toLocaleString()}</td>
                  <td
                    className={`py-1 px-1 text-right font-bold ${
                      r.ev >= 100 ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {Math.round(r.ev)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  );
}
