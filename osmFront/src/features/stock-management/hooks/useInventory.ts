"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/shared/api/axios";
import { Stock, StockMovement, StockTransfer } from "../types";

// ===== Stocks =====
export function useStocks(branchId?: number) {
    const endpoint = branchId
        ? `products_stocks_by_branch_retrieve`
        : "products_stocks_list";

    return useQuery<Stock[]>({
        queryKey: branchId ? [endpoint, branchId] : [endpoint],
        queryFn: () => branchId
            ? api.customRequest("products_stocks_by_branch_retrieve", { branch_id: branchId })
            : api.customRequest("products_stocks_list", {}),
        refetchOnWindowFocus: false,
    });
}

export function useStock(id: number) {
    return useQuery<Stock>({
        queryKey: ["products_stocks_retrieve", id],
        queryFn: () => api.customRequest("products_stocks_retrieve", { id }),
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
}

export function useLowStock() {
    return useQuery<Stock[]>({
        queryKey: ["products_stocks_low_stock_retrieve"],
        queryFn: () => api.customRequest("products_stocks_low_stock_retrieve", {}),
        refetchOnWindowFocus: false,
    });
}

export function useOutOfStock() {
    return useQuery<Stock[]>({
        queryKey: ["products_stocks_out_of_stock_retrieve"],
        queryFn: () => api.customRequest("products_stocks_out_of_stock_retrieve", {}),
        refetchOnWindowFocus: false,
    });
}

// ===== Stock Movements =====
export function useStockMovements(stockId?: number) {
    const endpoint = stockId
        ? "products_stock_movements_by_stock_retrieve"
        : "products_stock_movements_list";

    return useQuery<StockMovement[]>({
        queryKey: stockId ? [endpoint, stockId] : [endpoint],
        queryFn: () => stockId
            ? api.customRequest("products_stock_movements_by_stock_retrieve", { stock_id: stockId })
            : api.customRequest("products_stock_movements_list", {}),
        refetchOnWindowFocus: false,
    });
}

// ===== Stock Transfers =====
export function useStockTransfers(status?: string) {
    return useQuery<StockTransfer[]>({
        queryKey: status ? ["products_stock_transfers_list", status] : ["products_stock_transfers_list"],
        queryFn: () => api.customRequest("products_stock_transfers_list", status ? { status } : {}),
        refetchOnWindowFocus: false,
    });
}

export function useStockTransfer(id: number) {
    return useQuery<StockTransfer>({
        queryKey: ["products_stock_transfers_retrieve", id],
        queryFn: () => api.customRequest("products_stock_transfers_retrieve", { id }),
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
}

export function usePendingTransfers() {
    return useQuery<StockTransfer[]>({
        queryKey: ["products_stock_transfers_pending_retrieve"],
        queryFn: () => api.customRequest("products_stock_transfers_pending_retrieve", {}),
        refetchOnWindowFocus: false,
    });
}

export function useIncomingTransfers(branchId: number) {
    return useQuery<StockTransfer[]>({
        queryKey: ["products_stock_transfers_incoming_retrieve", branchId],
        queryFn: () => api.customRequest("products_stock_transfers_incoming_retrieve", { branch_id: branchId }),
        enabled: !!branchId,
        refetchOnWindowFocus: false,
    });
}

export function useOutgoingTransfers(branchId: number) {
    return useQuery<StockTransfer[]>({
        queryKey: ["products_stock_transfers_outgoing_retrieve", branchId],
        queryFn: () => api.customRequest("products_stock_transfers_outgoing_retrieve", { branch_id: branchId }),
        enabled: !!branchId,
        refetchOnWindowFocus: false,
    });
}

// ===== Stores (Branches that can have stock) =====
export function useStores() {
    return useQuery({
        queryKey: ["products_stocks_stores_only_retrieve"],
        queryFn: () => api.customRequest("products_stocks_stores_only_retrieve", {}),
        refetchOnWindowFocus: false,
    });
}
