"use client";
import { useMemo, useState } from "react";
import type { Race } from "@/lib/types";

type Row = {
  kaime: string;
  count: number;
  rate: number;
  payAvg: number;
  payMax: number;
  payMin: number;
  ev: number;
};

const TOP_N = 30;

export default function TrifectaRanking({ data }: { data: Race[] }) {
  const [sortKey, setSortKey] = useState<"count" | "ev" | "rate">("ev");
  const [minSamples, setMinSamples] = useState(5);

  const rows = useMemo<Row[]>(() => {
    if (data.length === 0) return [];
    const map = new Map<string, { count: number; pays: number[] }>();
    for (const r of data) {
      if (!r.p1 || !r.p2 || !r.p3) continue;
      const k = `${r.p1}-${r.p2}-${r.p3}`;
      const pay = parseInt(r.pay, 10);
      const e = map.get(k) ?? { count: 0, pays: [] };
      e.count += 1;
      if (Number.isFinite(pay)) e.pays.push(pay);
      map.set(k, e);
    }
    const total = data.length;
    const out: Row[] = [];
    for (const [kaime, v] of map) {
      if (v.count < minSamples) continue;
      const rate = (v.count / total) * 100;
      const payAvg = v.pays.length ? v.pays.reduce((s, p) => s + p, 0) / v.pays.length : 0;
      const payMax = v.pays.length ? Math.max(...v.pays) : 0;
      const payMin = v.pays.length ? Math.min(...v.pays) : 0;
      // 期待値 = 確率 × 平均払戻 / 100円ベット
      const ev = (v.count / total) * payAvg;
      out.push({ kaime, count: v.count, rate, payAvg, payMax, payMin, ev });
    }
    return out;
  }, [data, minSamples]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    if (sortKey === "count") copy.sort((a, b) => b.count - a.count);
    else if (sortKey === "rate") copy.sort((a, b) => b.rate - a.rate);
    else copy.sort((a, b) => b.ev - a.ev);
    return copy.slice(0, TOP_N);
  }, [rows, sortKey]);

  return (
    <div className="mb-6 rounded-lg border border-gray-700 p-4">
      <h2 className="font-bold mb-3 text-lg">3連単買い目ランキング</h2>
      <p className="text-xs text-gray-400 mb-3">
        フィルター適用済みデータから3連単出現パターンを集計。期待値=出現率×平均払戻（100円購入時の単点期待値）。
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-xs items-center">
        <span className="text-gray-400">ソート:</span>
        {(
          [
            ["ev", "期待値"],
            ["count", "出現回数"],
            ["rate", "出現率"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setSortKey(k)}
            className={`px-2 py-0.5 rounded border ${
              sortKey === k
                ? "bg-yellow-500 text-black border-yellow-500 font-bold"
                : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="text-gray-400 ml-2">最低出現数:</span>
        <input
          type="number"
          min={1}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 w-16"
          value={minSamples}
          onChange={(e) => setMinSamples(Math.max(1, parseInt(e.target.value, 10) || 1))}
        />
        <span className="text-gray-500 ml-2">{rows.length}パターン該当</span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-xs text-gray-500">該当なし。フィルターを緩めるか最低出現数を下げてください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-1 pr-1 text-left">#</th>
                <th className="py-1 px-1 text-left">買い目</th>
                <th className="py-1 px-1 text-right">回</th>
                <th className="py-1 px-1 text-right">出現率</th>
                <th className="py-1 px-1 text-right">平均払戻</th>
                <th className="py-1 px-1 text-right">最高/最低</th>
                <th className="py-1 px-1 text-right">期待値</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr
                  key={r.kaime}
                  className={`border-b border-gray-800 ${i === 0 ? "bg-yellow-900/20" : ""}`}
                >
                  <td className="py-1 pr-1 text-gray-400">{i + 1}</td>
                  <td className="py-1 px-1 text-gray-100 font-mono">{r.kaime}</td>
                  <td className="py-1 px-1 text-right">{r.count}</td>
                  <td className="py-1 px-1 text-right">{r.rate.toFixed(2)}%</td>
                  <td className="py-1 px-1 text-right">{Math.round(r.payAvg).toLocaleString()}</td>
                  <td className="py-1 px-1 text-right text-gray-500">
                    {r.payMax.toLocaleString()}/{r.payMin.toLocaleString()}
                  </td>
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
