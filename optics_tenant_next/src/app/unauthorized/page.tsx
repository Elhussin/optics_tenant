// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
    return (
      <div className="text-center p-10">
        <h1 className="text-3xl font-bold text-yellow-500">401 - Unauthorized</h1>
        <p className="mt-4">You don't have permission to access this page.</p>
      </div>
    );
  }
  