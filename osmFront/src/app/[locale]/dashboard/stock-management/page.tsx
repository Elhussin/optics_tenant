import Link from "next/link";
const StockManagementPage = () => {
  return (
    <div className="flex flex-row gap-4">
      <Link className="card" href="/dashboard/stock-management/stocks">
        Stocks Dashboard
      </Link>

      <Link className="card" href="/dashboard/stock-management/purchase-orders">
        Purchase Orders
      </Link>
      <Link className="card" href="/dashboard/stock-management/transfers">
        Transfers
      </Link>
      <Link className="card" href="/dashboard/stock-management/movements">
        Movements
      </Link>
    </div>
  );
};

export default StockManagementPage;
