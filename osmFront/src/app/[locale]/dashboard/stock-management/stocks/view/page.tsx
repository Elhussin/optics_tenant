import { StockListCard } from "@/src/features/stock-management/components/stock/StockListCard";

const StockViewPage = () => {
    return <StockListCard />;
};

export default StockViewPage;


// // Usage examples:

// // Basic usage - full features
// <StockListCard />

// // Filter by branch
// <StockListCard branchId={5} />

// // Compact mode with max 10 items
// <StockListCard compact maxItems={10} />

// // Low stock only
// <StockListCard defaultStatus="low" title="Low Stock Items" />

// // Hide filters/search
// <StockListCard showFilters={false} showSearch={false} />


// // Show ALL branches (current behavior)
// <StockListCard />

// // Show ONLY stores (filters out non-store branches)
// <StockListCard onlyStores={true} />
// // or
// <StockListCard onlyStores />