"use client";

import useSWR from "swr";
import api from "@/src/shared/api/axios";
import { Stock, StockMovement, StockTransfer } from "../types";

// ===== Stocks =====
export function useStocks(branchId?: number) {
    const endpoint = branchId
        ? `products_stocks_by_branch_retrieve`
        : "products_stocks_list";

    return useSWR<Stock[]>(
        branchId ? [endpoint, branchId] : endpoint,
        () => branchId
            ? api.customRequest("products_stocks_by_branch_retrieve", { branch_id: branchId })
            : api.customRequest("products_stocks_list", {}),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useStock(id: number) {
    return useSWR<Stock>(
        id ? ["products_stocks_retrieve", id] : null,
        () => api.customRequest("products_stocks_retrieve", { id }),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useLowStock() {
    return useSWR<Stock[]>(
        "products_stocks_low_stock_retrieve",
        () => api.customRequest("products_stocks_low_stock_retrieve", {}),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useOutOfStock() {
    return useSWR<Stock[]>(
        "products_stocks_out_of_stock_retrieve",
        () => api.customRequest("products_stocks_out_of_stock_retrieve", {}),
        {
            revalidateOnFocus: false,
        }
    );
}

// ===== Stock Movements =====
export function useStockMovements(stockId?: number) {
    const endpoint = stockId
        ? "products_stock_movements_by_stock_retrieve"
        : "products_stock_movements_list";

    return useSWR<StockMovement[]>(
        stockId ? [endpoint, stockId] : endpoint,
        () => stockId
            ? api.customRequest("products_stock_movements_by_stock_retrieve", { stock_id: stockId })
            : api.customRequest("products_stock_movements_list", {}),
        {
            revalidateOnFocus: false,
        }
    );
}

// ===== Stock Transfers =====
export function useStockTransfers(status?: string) {
    return useSWR<StockTransfer[]>(
        status ? ["products_stock_transfers_list", status] : "products_stock_transfers_list",
        () => api.customRequest("products_stock_transfers_list", status ? { status } : {}),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useStockTransfer(id: number) {
    return useSWR<StockTransfer>(
        id ? ["products_stock_transfers_retrieve", id] : null,
        () => api.customRequest("products_stock_transfers_retrieve", { id }),
        {
            revalidateOnFocus: false,
        }
    );
}

export function usePendingTransfers() {
    return useSWR<StockTransfer[]>(
        "products_stock_transfers_pending_retrieve",
        () => api.customRequest("products_stock_transfers_pending_retrieve", {}),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useIncomingTransfers(branchId: number) {
    return useSWR<StockTransfer[]>(
        branchId ? ["products_stock_transfers_incoming_retrieve", branchId] : null,
        () => api.customRequest("products_stock_transfers_incoming_retrieve", { branch_id: branchId }),
        {
            revalidateOnFocus: false,
        }
    );
}

export function useOutgoingTransfers(branchId: number) {
    return useSWR<StockTransfer[]>(
        branchId ? ["products_stock_transfers_outgoing_retrieve", branchId] : null,
        () => api.customRequest("products_stock_transfers_outgoing_retrieve", { branch_id: branchId }),
        {
            revalidateOnFocus: false,
        }
    );
}

// ===== Stores (Branches that can have stock) =====
export function useStores() {
    return useSWR(
        "products_stocks_stores_only_retrieve",
        () => api.customRequest("products_stocks_stores_only_retrieve", {}),
        {
            revalidateOnFocus: false,
        }
    );
}
