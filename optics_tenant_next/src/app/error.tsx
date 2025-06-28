'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-red-500">Something went wrong!</h1>
      <p>{error.message}</p>
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
