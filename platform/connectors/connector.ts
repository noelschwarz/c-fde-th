export interface ListQuery {
  search?: string;
  filters?: Record<string, string | string[]>;
  sort?: { field: string; direction?: "asc" | "desc" };
  pagination?: { page?: number; pageSize?: number };
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DataConnector<T extends Record<string, unknown>> {
  name: string;
  list(query: ListQuery): Promise<ListResult<T>> | ListResult<T>;
  get(id: string): Promise<T | undefined> | T | undefined;
  update(
    id: string,
    patch: Partial<T>,
    context?: { role?: string; reason?: string }
  ): Promise<T> | T;
}
