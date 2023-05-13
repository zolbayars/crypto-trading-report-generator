import {
  type MRT_PaginationState,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
} from "material-react-table";

import { merged_trade } from "@prisma/client";

export type ApiResponse = {
  data: Array<merged_trade>;
  meta: {
    totalRowCount: number;
  };
  error: string | null;
};

export const fetchMergedTrades = async (
  pagination: MRT_PaginationState,
  columnFilters: MRT_ColumnFiltersState,
  sorting: MRT_SortingState
): Promise<ApiResponse> => {
  const fetchURL = new URL(
    `/api/dashboard/merged-trades`,
    process.env.NODE_ENV === "production"
      ? "https://www.cryptobaldan.com"
      : "http://localhost:3000"
  );
  fetchURL.searchParams.set(
    "start",
    `${pagination.pageIndex * pagination.pageSize}`
  );
  fetchURL.searchParams.set("size", `${pagination.pageSize}`);
  fetchURL.searchParams.set("filters", JSON.stringify(columnFilters ?? []));
  fetchURL.searchParams.set("sorting", JSON.stringify(sorting ?? []));

  const response = await fetch(fetchURL.href);
  const json = (await response.json()) as ApiResponse;
  return json;
};
