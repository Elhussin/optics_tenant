// lib/hooks/usePageRouting.ts
'use client';

// import { useRouter } from '@/app/i18n/navigation';
import { useRouter } from 'next/navigation';

/**
 * usePageRouting hook
 * 
 * Provides simple navigation helpers for Next.js client components.
 * 
 * @returns {object} - { navigate, back, refresh }
 * 
 * Example:
 * 
 * import { usePageRouting } from '@/lib/hooks/usePageRouting';
 * 
 * function MyComponent() {
 *   const { navigate, back, refresh } = usePageRouting();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
 *       <button onClick={back}>Go Back</button>
 *       <button onClick={refresh}>Refresh Page</button>
 *     </div>
 *   );
 * }
 */
export function usePageRouting() {
    const router = useRouter();

    // Navigate to any path
    const navigate = (path: string) => {
        router.push(path);
    };

    // Go back
    const back = () => router.back();
    // Refresh page
    const refresh = () => router.refresh();

    return { navigate, back, refresh };
}
