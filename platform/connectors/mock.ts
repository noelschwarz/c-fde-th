import { DataConnector, ListQuery, ListResult } from "./connector";

export interface MockConnectorOptions<T> {
  resource: string;
  initialData: T[];
  getId?: (item: T) => string;
}

// A simple in-memory connector. Swap this out for a REST/internal API connector
// by implementing DataConnector<T> and wiring it into the runtime.
export function createMockConnector<T extends Record<string, unknown>>(
  options: MockConnectorOptions<T>
): DataConnector<T> {
  const store = new Map<string, T>();
  const getId = options.getId || ((item: T) => String(item.id));

  options.initialData.forEach((item) => store.set(getId(item), item));

  function matches(item: T, query: ListQuery): boolean {
    const q = query.search?.toLowerCase() || "";
    const filterEntries = Object.entries(query.filters || {});

    if (q) {
      const haystack = Object.values(item)
        .filter((v) => v !== undefined && v !== null)
        .map((v) => String(v).toLowerCase())
        .join(" ");
      if (!haystack.includes(q)) return false;
    }

    for (const [field, value] of filterEntries) {
      const raw = item[field];
      const itemValue = Array.isArray(raw)
        ? raw.map(String)
        : [String(raw)];
      const allowed = Array.isArray(value) ? value.map(String) : [String(value)];
      if (value !== undefined && value !== "" && !itemValue.some((v) => allowed.includes(v))) {
        return false;
      }
    }
    return true;
  }

  return {
    name: "mock",
    list(query: ListQuery = {}): ListResult<T> {
      let data = Array.from(store.values()).filter((item) => matches(item, query));
      if (query.sort?.field) {
        const { field, direction = "asc" } = query.sort;
        data.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av === bv) return 0;
          if (av === undefined || av === null) return 1;
          if (bv === undefined || bv === null) return -1;
          const cmp = String(av).localeCompare(String(bv));
          return direction === "desc" ? -cmp : cmp;
        });
      }
      const total = data.length;
      const page = query.pagination?.page || 1;
      const pageSize = query.pagination?.pageSize || 50;
      const start = (page - 1) * pageSize;
      data = data.slice(start, start + pageSize);
      return { data, total, page, pageSize };
    },
    get(id: string): T | undefined {
      return store.get(id);
    },
    update(id: string, patch: Partial<T>): T {
      const current = store.get(id);
      if (!current) throw new Error(`Record ${id} not found`);
      const next = { ...current, ...patch };
      store.set(id, next as T);
      return next as T;
    },
  };
}
