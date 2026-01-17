// shared/components/VirtualList.tsx
/**
 * Virtual List Component
 * مكون القائمة الافتراضية للأداء العالي
 */

"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/src/shared/utils/cn";

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  loadingMore?: boolean;
  LoadingComponent?: React.ReactNode;
  EmptyComponent?: React.ReactNode;
}

interface ItemPosition {
  index: number;
  start: number;
  height: number;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 3,
  className,
  onEndReached,
  endReachedThreshold = 100,
  loadingMore = false,
  LoadingComponent,
  EmptyComponent,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate item positions
  const itemPositions = useMemo<ItemPosition[]>(() => {
    const positions: ItemPosition[] = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      const h = typeof itemHeight === "function" ? itemHeight(i) : itemHeight;
      positions.push({
        index: i,
        start: offset,
        height: h,
      });
      offset += h;
    }

    return positions;
  }, [items.length, itemHeight]);

  // Total height of all items
  const totalHeight = useMemo(() => {
    if (itemPositions.length === 0) return 0;
    const lastItem = itemPositions[itemPositions.length - 1];
    return lastItem.start + lastItem.height;
  }, [itemPositions]);

  // Find visible range using binary search
  const findStartIndex = useCallback(
    (scrollTop: number) => {
      let low = 0;
      let high = itemPositions.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const item = itemPositions[mid];

        if (item.start + item.height < scrollTop) {
          low = mid + 1;
        } else if (item.start > scrollTop) {
          high = mid - 1;
        } else {
          return mid;
        }
      }

      return Math.max(0, low - 1);
    },
    [itemPositions]
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];

    const startIndex = findStartIndex(scrollTop);
    const endOffset = scrollTop + height;

    let endIndex = startIndex;
    while (
      endIndex < itemPositions.length &&
      itemPositions[endIndex].start < endOffset
    ) {
      endIndex++;
    }

    // Apply overscan
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(itemPositions.length, endIndex + overscan);

    return itemPositions.slice(start, end).map((pos) => ({
      item: items[pos.index],
      index: pos.index,
      style: {
        position: "absolute" as const,
        top: pos.start,
        height: pos.height,
        left: 0,
        right: 0,
      },
    }));
  }, [items, itemPositions, scrollTop, height, overscan, findStartIndex]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);

      // Check if near end
      if (onEndReached) {
        const scrollBottom =
          target.scrollHeight - target.scrollTop - target.clientHeight;
        if (scrollBottom < endReachedThreshold && !loadingMore) {
          onEndReached();
        }
      }
    },
    [onEndReached, endReachedThreshold, loadingMore]
  );

  // Empty state
  if (items.length === 0 && !loadingMore) {
    return EmptyComponent ? (
      <>{EmptyComponent}</>
    ) : (
      <div className="flex items-center justify-center py-12 text-secondary">
        لا توجد بيانات
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {loadingMore && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center py-4">
          {LoadingComponent || <div className="spinner spinner-sm" />}
        </div>
      )}
    </div>
  );
}

// Simple Virtual Grid
interface VirtualGridProps<T> {
  items: T[];
  height: number;
  columns: number;
  rowHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  height,
  columns,
  rowHeight,
  renderItem,
  gap = 16,
  className,
}: VirtualGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * (rowHeight + gap) - gap;

  // Calculate visible rows
  const startRow = Math.floor(scrollTop / (rowHeight + gap));
  const endRow = Math.min(
    rowCount,
    Math.ceil((scrollTop + height) / (rowHeight + gap)) + 1
  );

  const visibleRows = useMemo(() => {
    const rows = [];
    for (let row = startRow; row < endRow; row++) {
      const rowItems = [];
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        if (index < items.length) {
          rowItems.push({ item: items[index], index });
        }
      }
      rows.push({
        row,
        items: rowItems,
        top: row * (rowHeight + gap),
      });
    }
    return rows;
  }, [startRow, endRow, columns, items, rowHeight, gap]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto relative", className)}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleRows.map(({ row, items: rowItems, top }) => (
          <div
            key={row}
            className="absolute left-0 right-0 flex"
            style={{
              top,
              height: rowHeight,
              gap,
            }}
          >
            {rowItems.map(({ item, index }) => (
              <div
                key={index}
                style={{
                  flex: `1 1 calc(${100 / columns}% - ${
                    (gap * (columns - 1)) / columns
                  }px)`,
                }}
              >
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;
