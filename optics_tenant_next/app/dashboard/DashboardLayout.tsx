export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {children}
      </div>
    );
  }
  