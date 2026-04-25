"use client";
import { useMemo, useState } from "react";
import type { Race } from "@/lib/types";

type Bucket<T> = { label: string; match: (r: Race) => boolean; key: T };

const RNO_BUCKETS: Bucket<string>[] = [
  { label: "前半(R1-4)", match: (r) => r.rno >= 1 && r.rno <= 4, key: "rno_1-4" },
  { label: "中盤(R5-8)", match: (r) => r.rno >= 5 && r.rno <= 8, key: "rno_5-8" },
  { label: "後半(R9-12)", match: (r) => r.rno >= 9 && r.rno <= 12, key: "rno_9-12" },
];

const WIND_BUCKETS: Bucket<string>[] = [
  { label: "弱(0-2m)", match: (r) => num(r.wind, 0) <= 2, key: "wind_0-2" },
  { label: "中(3-4m)", match: (r) => { const v = num(r.wind, -1); return v >= 3 && v <= 4; }, key: "wind_3-4" },
  { label: "強(5m〜)", match: (r) => num(r.wind, 0) >= 5, key: "wind_5+" },
];

const WAVE_BUCKETS: Bucket<string>[] = [
  { label: "凪(0-2cm)", match: (r) => num(r.wave, 0) <= 2, key: "wave_0-2" },
  { label: "中(3-5cm)", match: (r) => { const v = num(r.wave, -1); return v >= 3 && v <= 5; }, key: "wave_3-5" },
  { label: "高(6cm〜)", match: (r) => num(r.wave, 0) >= 6, key: "wave_6+" },
];

const TIDE_BUCKETS: Bucket<string>[] = [
  { label: "大潮", match: (r) => r.tide === "大潮", key: "tide_大潮" },
  { label: "中潮", match: (r) => r.tide === "中潮", key: "tide_中潮" },
  { label: "小潮", match: (r) => r.tide === "小潮", key: "tide_小潮" },
];

const GRADE1_BUCKETS: Bucket<string>[] = [
  { label: "1コースA1", match: (r) => r.racers[0]?.grade === "A1", key: "g1_A1" },
  { label: "1コースA2", match: (r) => r.racers[0]?.grade === "A2", key: "g1_A2" },
  { label: "1コースB", match: (r) => /^B/.test(r.racers[0]?.grade ?? ""), key: "g1_B" },
];

function num(s: string, fallback: number): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

const DIMENSIONS = [
  { name: "レース帯", buckets: RNO_BUCKETS },
  { name: "風速", buckets: WIND_BUCKETS },
  { name: "波高", buckets: WAVE_BUCKETS },
  { name: "潮位", buckets: TIDE_BUCKETS },
  { name: "1コース", buckets: GRADE1_BUCKETS },
];

const TOP_N = 25;
const BET_POINTS = 5;
const BET_PER_POINT = 100;

type ComboRow = {
  labels: string[];
  sample: number;
  hits: number;
  hitRate: number;
  avgPay: number;
  retRate: number;
  profitPer: number;
};

export default function PatternExplorer({ data }: { data: Race[] }) {
  const [sortKey, setSortKey] = useState<"ret" | "hit">("ret");
  const [minSamples, setMinSamples] = useState(20);

  const combos = useMemo<ComboRow[]>(() => {
    if (data.length === 0) return [];
    const out: ComboRow[] = [];
    const allBuckets = DIMENSIONS.map((d) => d.buckets);

    const recur = (depth: number, picked: Bucket<string>[]) => {
      if (depth === allBuckets.length) {
        const matched = data.filter((r) => picked.every((b) => b.match(r)));
        if (matched.length < minSamples) return;
        // 戦略: 人気上位5点を100円ずつ購入。的中=人気5位以内
        const hits = matched.filter((r) => {
          const n = parseInt(r.ninki, 10);
          return Number.isFinite(n) && n >= 1 && n <= BET_POINTS;
        });
        const paySum = hits.reduce((s, r) => s + (parseInt(r.pay, 10) || 0), 0);
        const totalCost = matched.length * BET_POINTS * BET_PER_POINT;
        const hitRate = (hits.length / matched.length) * 100;
        const avgPay = hits.length ? paySum / hits.length : 0;
        const retRate = (paySum / totalCost) * 100;
        const profitPer = (paySum - totalCost) / matched.length;
        out.push({
          labels: picked.map((b) => b.label),
          sample: matched.length,
          hits: hits.length,
          hitRate,
          avgPay,
          retRate,
          profitPer,
        });
        return;
      }
      for (const b of allBuckets[depth]) {
        recur(depth + 1, [...picked, b]);
      }
    };
    recur(0, []);
    return out;
  }, [data, minSamples]);

  const sorted = useMemo(() => {
    const copy = [...combos];
    if (sortKey === "hit") copy.sort((a, b) => b.hitRate - a.hitRate || b.retRate - a.retRate);
    else copy.sort((a, b) => b.retRate - a.retRate || b.hitRate - a.hitRate);
    return copy.slice(0, TOP_N);
  }, [combos, sortKey]);

  return (
    <div className="mb-6 rounded-lg border border-gray-700 p-4">
      <h2 className="font-bold mb-3 text-lg">パターン自動探索</h2>
      <p className="text-xs text-gray-400 mb-3">
        レース帯×風速×波高×潮位×1コース級別 の全{DIMENSIONS.reduce((a, d) => a * d.buckets.length, 1)}パターンを評価。戦略=各レースで3連単人気{BET_POINTS}番までを{BET_PER_POINT}円ずつ全購入。回収率100%超 = 期待値プラス。
      </p>

      <div className="flex flex-wrap gap-2 mb-3 text-xs items-center">
        <span className="text-gray-400">ソート:</span>
        {(
          [
            ["ret", "回収率"],
            ["hit", "的中率"],
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
            {label}順
          </button>
        ))}
        <span className="text-gray-400 ml-2">最低サンプル:</span>
        <input
          type="number"
          min={1}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 w-16"
          value={minSamples}
          onChange={(e) => setMinSamples(Math.max(1, parseInt(e.target.value, 10) || 1))}
        />
        <span className="text-gray-500 ml-2">{combos.length}件該当</span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-xs text-gray-500">サンプル不足。最低サンプル数を下げるかフィルターを緩めてください。</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-1 pr-1 text-left">#</th>
                <th className="py-1 px-1 text-left">条件</th>
                <th className="py-1 px-1 text-right">件</th>
                <th className="py-1 px-1 text-right">的中</th>
                <th className="py-1 px-1 text-right">的中率</th>
                <th className="py-1 px-1 text-right">平均払戻</th>
                <th className="py-1 px-1 text-right">回収率</th>
                <th className="py-1 px-1 text-right">損益/レース</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c, i) => (
                <tr
                  key={c.labels.join("|")}
                  className={`border-b border-gray-800 ${i === 0 ? "bg-yellow-900/20" : ""}`}
                >
                  <td className="py-1 pr-1 text-gray-400">{i + 1}</td>
                  <td className="py-1 px-1 text-gray-200">
                    <div className="flex flex-wrap gap-1">
                      {c.labels.map((l) => (
                        <span key={l} className="bg-gray-700 rounded px-1">{l}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-1 px-1 text-right">{c.sample}</td>
                  <td className="py-1 px-1 text-right">{c.hits}</td>
                  <td className="py-1 px-1 text-right">{c.hitRate.toFixed(1)}%</td>
                  <td className="py-1 px-1 text-right">{Math.round(c.avgPay).toLocaleString()}</td>
                  <td
                    className={`py-1 px-1 text-right font-bold ${
                      c.retRate >= 100 ? "text-green-400" : "text-gray-300"
                    }`}
                  >
                    {c.retRate.toFixed(1)}%
                  </td>
                  <td
                    className={`py-1 px-1 text-right ${
                      c.profitPer >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {Math.round(c.profitPer).toLocaleString()}
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
