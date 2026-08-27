"use client";

import { Filter } from "@/platform/config/types";

interface FilterBarProps {
  filters: Filter[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => {
        if (filter.type === "search") {
          return (
            <input
              key={filter.key}
              type="text"
              placeholder={filter.label}
              value={values[filter.key] || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          );
        }
        return (
          <select
            key={filter.key}
            value={values[filter.key] || ""}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{filter.label}: All</option>
            {filter.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}
