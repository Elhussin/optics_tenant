// features/mobile/hooks/useOfflineSync.ts
/**
 * Offline Sync Hook
 * خطاف مزامنة البيانات أثناء عدم الاتصال
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useMobile';

// Types
interface PendingOperation<T = unknown> {
    id: string;
    type: 'create' | 'update' | 'delete';
    endpoint: string;
    data: T;
    timestamp: number;
    retries: number;
}

interface UseOfflineSyncOptions {
    storageKey?: string;
    maxRetries?: number;
    onSync?: (result: { success: number; failed: number }) => void;
    onError?: (error: Error) => void;
}

const DB_NAME = 'osm-offline-db';
const STORE_NAME = 'pending-operations';
const DB_VERSION = 1;

/**
 * IndexedDB helper functions
 */
async function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

async function addOperation<T>(operation: PendingOperation<T>): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.add(operation);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
        tx.oncomplete = () => db.close();
    });
}

async function getOperations<T>(): Promise<PendingOperation<T>[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        tx.oncomplete = () => db.close();
    });
}

async function removeOperation(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
        tx.oncomplete = () => db.close();
    });
}

async function updateOperation<T>(operation: PendingOperation<T>): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(operation);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
        tx.oncomplete = () => db.close();
    });
}

/**
 * Offline Sync Hook
 */
export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
    const {
        maxRetries = 3,
        onSync,
        onError,
    } = options;

    const { online } = useNetworkStatus();
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const syncInProgress = useRef(false);

    // Count pending operations
    const countPending = useCallback(async () => {
        try {
            const operations = await getOperations();
            setPendingCount(operations.length);
        } catch (error) {
            console.error('Error counting pending operations:', error);
        }
    }, []);

    // Queue an operation for later sync
    const queueOperation = useCallback(async <T>(
        type: 'create' | 'update' | 'delete',
        endpoint: string,
        data: T
    ): Promise<string> => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const operation: PendingOperation<T> = {
            id,
            type,
            endpoint,
            data,
            timestamp: Date.now(),
            retries: 0,
        };

        await addOperation(operation);
        await countPending();

        return id;
    }, [countPending]);

    // Execute a single operation
    const executeOperation = async <T>(operation: PendingOperation<T>): Promise<boolean> => {
        try {
            const method = {
                create: 'POST',
                update: 'PUT',
                delete: 'DELETE',
            }[operation.type];

            const response = await fetch(operation.endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: operation.type !== 'delete' ? JSON.stringify(operation.data) : undefined,
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Operation failed:', error);
            return false;
        }
    };

    // Sync all pending operations
    const sync = useCallback(async (): Promise<{ success: number; failed: number }> => {
        if (syncInProgress.current || !online) {
            return { success: 0, failed: 0 };
        }

        syncInProgress.current = true;
        setIsSyncing(true);

        let success = 0;
        let failed = 0;

        try {
            const operations = await getOperations();

            // Sort by timestamp (oldest first)
            operations.sort((a, b) => a.timestamp - b.timestamp);

            for (const operation of operations) {
                const result = await executeOperation(operation);

                if (result) {
                    await removeOperation(operation.id);
                    success++;
                } else {
                    operation.retries++;

                    if (operation.retries >= maxRetries) {
                        // Max retries reached, remove operation
                        await removeOperation(operation.id);
                        failed++;
                    } else {
                        await updateOperation(operation);
                        failed++;
                    }
                }
            }

            setLastSyncTime(new Date());
            await countPending();

            if (onSync) {
                onSync({ success, failed });
            }
        } catch (error) {
            if (onError) {
                onError(error instanceof Error ? error : new Error('Sync failed'));
            }
        } finally {
            setIsSyncing(false);
            syncInProgress.current = false;
        }

        return { success, failed };
    }, [online, maxRetries, countPending, onSync, onError]);

    // Clear all pending operations
    const clearPending = useCallback(async () => {
        try {
            const operations = await getOperations();
            for (const op of operations) {
                await removeOperation(op.id);
            }
            await countPending();
        } catch (error) {
            console.error('Error clearing pending operations:', error);
        }
    }, [countPending]);

    // Auto-sync when coming online
    useEffect(() => {
        if (online && pendingCount > 0 && !syncInProgress.current) {
            sync();
        }
    }, [online, pendingCount, sync]);

    // Initial count
    useEffect(() => {
        countPending();
    }, [countPending]);

    return {
        queueOperation,
        sync,
        clearPending,
        pendingCount,
        isSyncing,
        lastSyncTime,
        online,
    };
}

/**
 * Simple offline-aware fetch wrapper
 */
export function useOfflineFetch() {
    const { online } = useNetworkStatus();

    const fetchWithOffline = useCallback(async <T>(
        url: string,
        options?: RequestInit
    ): Promise<{ data: T | null; offline: boolean; error?: string }> => {
        if (!online) {
            // Try to get from cache
            try {
                const cache = await caches.open('osm-api-v1');
                const cachedResponse = await cache.match(url);

                if (cachedResponse) {
                    const data = await cachedResponse.json();
                    return { data, offline: true };
                }
            } catch (error) {
                console.error('Cache read error:', error);
            }

            return { data: null, offline: true, error: 'You are offline' };
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return { data, offline: false };
        } catch (error) {
            return {
                data: null,
                offline: false,
                error: error instanceof Error ? error.message : 'Fetch failed',
            };
        }
    }, [online]);

    return { fetchWithOffline, online };
}

export default useOfflineSync;
