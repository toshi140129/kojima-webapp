"use client";
import { useMemo } from "react";
import type { Race } from "@/lib/types";

export default function Summary({ data }: { data: Race[] }) {
  const stats = useMemo(() => {
    const total = data.length;
    if (total === 0) {
      return {
        total: 0,
        dateMin: "",
        dateMax: "",
        avgPay: 0,
        course1Win: 0,
      };
    }
    const dates = [...new Set(data.map((r) => r.date))].sort();
    const pays = data
      .map((r) => parseInt(r.pay, 10))
      .filter((n) => Number.isFinite(n));
    const avgPay = pays.length ? pays.reduce((s, p) => s + p, 0) / pays.length : 0;
    const course1Win = data.filter((r) => r.p1 === "1").length;
    return {
      total,
      dateMin: dates[0] ?? "",
      dateMax: dates[dates.length - 1] ?? "",
      avgPay,
      course1Win,
    };
  }, [data]);

  return (
    <div className="mb-4 rounded-lg border border-gray-700 p-4 bg-gray-900/40">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <Card label="サンプル数" value={`${stats.total.toLocaleString()}`} />
        <Card label="期間" value={`${stats.dateMin}〜${stats.dateMax}`} />
        <Card label="平均3連単払戻" value={`${Math.round(stats.avgPay).toLocaleString()}円`} />
        <Card
          label="1コース1着率"
          value={
            stats.total
              ? `${((stats.course1Win / stats.total) * 100).toFixed(1)}%`
              : "-"
          }
        />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400">{label}</div>
      <div className="text-yellow-400 font-bold text-sm break-all">{value}</div>
    </div>
  );
}
