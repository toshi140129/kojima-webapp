"use client";
import { useMemo, useState } from "react";
import type { Race } from "@/lib/types";
import { applyFilter, defaultFilter, years, type FilterState } from "@/lib/filter";
import Filters from "./Filters";
import Summary from "./Summary";
import TrifectaRanking from "./TrifectaRanking";
import PatternExplorer from "./PatternExplorer";
import NextRacePredict from "./NextRacePredict";

export default function Dashboard({ data }: { data: Race[] }) {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  const ys = useMemo(() => years(data), [data]);
  const filtered = useMemo(() => applyFilter(data, filter), [data, filter]);

  return (
    <>
      <Filters
        filter={filter}
        setFilter={setFilter}
        years={ys}
        matched={filtered.length}
        total={data.length}
      />
      <Summary data={filtered} />
      <NextRacePredict data={data} />
      <TrifectaRanking data={filtered} />
      <PatternExplorer data={filtered} />
    </>
  );
}
