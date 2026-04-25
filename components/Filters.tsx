"use client";
import type { FilterState } from "@/lib/filter";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];
const TIDES = ["大潮", "中潮", "小潮", "長潮", "若潮"];
const GRADES = ["A1", "A2", "B1", "B2"];

export default function Filters({
  filter,
  setFilter,
  years,
  matched,
  total,
}: {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  years: number[];
  matched: number;
  total: number;
}) {
  const reset = () =>
    setFilter({
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
    });

  const toggle = <T,>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <div className="mb-4 rounded-lg border border-gray-700 p-4 bg-gray-900/40">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">フィルター</h2>
        <span className="text-xs text-gray-400">
          {matched.toLocaleString()} / {total.toLocaleString()} 件
          <button
            onClick={reset}
            className="ml-3 px-2 py-0.5 text-xs rounded border border-gray-600 hover:bg-gray-700"
          >
            リセット
          </button>
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <Row label="年">
          <select
            className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5"
            value={filter.yearFrom ?? ""}
            onChange={(e) =>
              setFilter({
                ...filter,
                yearFrom: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          >
            <option value="">指定なし</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}〜
              </option>
            ))}
          </select>
          <span className="mx-1">〜</span>
          <select
            className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5"
            value={filter.yearTo ?? ""}
            onChange={(e) =>
              setFilter({
                ...filter,
                yearTo: e.target.value ? parseInt(e.target.value, 10) : null,
              })
            }
          >
            <option value="">指定なし</option>
            {years.map((y) => (
              <option key={y} value={y}>
                〜{y}
              </option>
            ))}
          </select>
        </Row>

        <Row label="曜日">
          {WEEKDAYS.map((w) => (
            <Chip
              key={w}
              active={filter.weekdays.includes(w)}
              onClick={() =>
                setFilter({ ...filter, weekdays: toggle(filter.weekdays, w) })
              }
            >
              {w}
            </Chip>
          ))}
        </Row>

        <Row label="レース">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <Chip
              key={n}
              active={filter.rnos.includes(n)}
              onClick={() =>
                setFilter({ ...filter, rnos: toggle(filter.rnos, n) })
              }
            >
              R{n}
            </Chip>
          ))}
        </Row>

        <Row label="風速">
          <NumInput
            value={filter.windMin}
            onChange={(v) => setFilter({ ...filter, windMin: v })}
            placeholder="最小m"
          />
          <span className="mx-1">〜</span>
          <NumInput
            value={filter.windMax}
            onChange={(v) => setFilter({ ...filter, windMax: v })}
            placeholder="最大m"
          />
        </Row>

        <Row label="波高">
          <NumInput
            value={filter.waveMin}
            onChange={(v) => setFilter({ ...filter, waveMin: v })}
            placeholder="最小cm"
          />
          <span className="mx-1">〜</span>
          <NumInput
            value={filter.waveMax}
            onChange={(v) => setFilter({ ...filter, waveMax: v })}
            placeholder="最大cm"
          />
        </Row>

        <Row label="潮位">
          {TIDES.map((t) => (
            <Chip
              key={t}
              active={filter.tides.includes(t)}
              onClick={() =>
                setFilter({ ...filter, tides: toggle(filter.tides, t) })
              }
            >
              {t}
            </Chip>
          ))}
        </Row>

        <Row label="1コース級別">
          {GRADES.map((g) => (
            <Chip
              key={g}
              active={filter.grade1.includes(g)}
              onClick={() =>
                setFilter({ ...filter, grade1: toggle(filter.grade1, g) })
              }
            >
              {g}
            </Chip>
          ))}
        </Row>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-gray-400 w-20 shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded border ${
        active
          ? "bg-yellow-500 text-black border-yellow-500 font-bold"
          : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      step="0.1"
      placeholder={placeholder}
      className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 w-24"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : parseFloat(v));
      }}
    />
  );
}
