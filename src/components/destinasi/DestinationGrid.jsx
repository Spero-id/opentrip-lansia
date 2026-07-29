"use client";

import ResultsBar from "./Resultsbar";
import EmptyState from "./Emptystate";
import DestinationCard from "./DestinationCard";

export default function DestinationGrid({ filtered, hasActiveFilters, onReset }) {
  return (
    <div className="flex-1 min-w-0">
      <ResultsBar
        count={filtered.length}
        hasActiveFilters={hasActiveFilters}
        onReset={onReset}
      />

      {filtered.length === 0 ? (
        <EmptyState onReset={onReset} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filtered.map((dest) => (
            <DestinationCard key={dest.id} dest={dest} />
          ))}
        </div>
      )}
    </div>
  );
}
