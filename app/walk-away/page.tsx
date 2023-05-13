"use client";

import React, { useMemo, useState } from "react";
import MaterialReactTable, {
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { fetchMergedTrades, ApiResponse } from "@/lib/front-end/utils";
import { merged_trade } from "@prisma/client";
import { DateTime } from "luxon";

const AnalysisTable = () => {
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const formatTimestamp = (dateTime: string) => {
    const date = DateTime.fromISO(dateTime);
    //@todo get this from user preference
    date.setZone("UTC+8");
    return `${date.toFormat("yyyy-MM-dd HH:mm:ss")}`;
  };

  const { data, isError, isFetching, isLoading, refetch } =
    useQuery<ApiResponse>({
      queryKey: [
        "table-data",
        columnFilters,
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
      ],
      queryFn: async () => {
        return fetchMergedTrades(pagination, columnFilters, sorting);
      },
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    });

  const columns = useMemo<MRT_ColumnDef<merged_trade>[]>(
    () => [
      {
        accessorFn: (row) =>
          formatTimestamp(row.entryDate as unknown as string),
        accessorKey: "entryDate",
        header: "Entry",
      },
      {
        accessorFn: (row) => formatTimestamp(row.exitDate as unknown as string),
        accessorKey: "exitDate",
        header: "Exit",
      },
      {
        accessorKey: "symbol",
        header: "Pair",
      },
      {
        accessorKey: "direction",
        header: "Direction",
      },
      {
        accessorFn: (row) => row.size.toPrecision(5),
        accessorKey: "size",
        header: "Quantity",
      },
      {
        accessorKey: "entryPrice",
        header: "Entry Price",
      },
      {
        accessorKey: "exitPrice",
        header: "Exit Price",
      },
      {
        accessorFn: (row) => row.pnl.toPrecision(5),
        accessorKey: "pnl",
        header: "PnL",
        filterVariant: "range",
      },
    ],
    []
  );

  return (
    <div className="mt-6">
      <MaterialReactTable
        columns={columns}
        data={data?.data ?? []} //data is undefined on first render
        initialState={{ showColumnFilters: true }}
        manualFiltering
        manualPagination
        manualSorting
        enableFullScreenToggle={false}
        enableDensityToggle={false}
        enableColumnActions={false}
        enableGlobalFilter={false}
        muiToolbarAlertBannerProps={
          isError
            ? {
                color: "error",
                children: "Error loading data",
              }
            : undefined
        }
        onColumnFiltersChange={setColumnFilters}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        renderTopToolbarCustomActions={() => (
          <div>
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
                p: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              <Tooltip arrow title="Refresh Data">
                <IconButton onClick={() => refetch()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </div>
        )}
        rowCount={data?.meta?.totalRowCount ?? 0}
        state={{
          columnFilters,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isFetching,
          sorting,
        }}
      />
    </div>
  );
};

const queryClient = new QueryClient();

const WalkAwayAnalysisTable = () => (
  <QueryClientProvider client={queryClient}>
    <AnalysisTable />
  </QueryClientProvider>
);

export default WalkAwayAnalysisTable;
