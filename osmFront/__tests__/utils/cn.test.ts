// __tests__/utils/cn.test.ts
/**
 * Tests for cn utility
 */

import { describe, it, expect } from 'vitest';
import { cn, cnFun } from '@/src/shared/utils/cn';

describe('cn utility', () => {
    it('merges class names', () => {
        const result = cn('class1', 'class2');
        expect(result).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
        const isActive = true;
        const isDisabled = false;

        const result = cn(
            'base-class',
            isActive && 'active',
            isDisabled && 'disabled'
        );

        expect(result).toBe('base-class active');
    });

    it('handles undefined and null', () => {
        const result = cn('class1', undefined, null, 'class2');
        expect(result).toBe('class1 class2');
    });

    it('handles arrays', () => {
        const result = cn(['class1', 'class2'], 'class3');
        expect(result).toBe('class1 class2 class3');
    });

    it('handles objects', () => {
        const result = cn({
            'active-class': true,
            'disabled-class': false,
            'visible-class': true,
        });
        expect(result).toBe('active-class visible-class');
    });

    it('handles empty strings', () => {
        const result = cn('class1', '', 'class2');
        expect(result).toBe('class1 class2');
    });
});

describe('cnFun utility (with tailwind-merge)', () => {
    it('merges conflicting tailwind classes', () => {
        const result = cnFun('px-2', 'px-4');
        expect(result).toBe('px-4');
    });

    it('merges conflicting background colors', () => {
        const result = cnFun('bg-red-500', 'bg-blue-500');
        expect(result).toBe('bg-blue-500');
    });

    it('keeps non-conflicting classes', () => {
        const result = cnFun('px-2 py-4', 'mt-2');
        expect(result).toBe('px-2 py-4 mt-2');
    });

    it('handles complex tailwind merging', () => {
        const result = cnFun(
            'p-4 text-sm text-red-500',
            'p-2 text-blue-500'
        );
        expect(result).toBe('text-sm p-2 text-blue-500');
    });

    it('preserves arbitrary values', () => {
        const result = cnFun('text-[14px]', 'text-lg');
        expect(result).toBe('text-lg');
    });

    it('handles responsive prefixes', () => {
        const result = cnFun('md:p-4', 'lg:p-4');
        expect(result).toBe('md:p-4 lg:p-4');
    });

    it('handles hover/focus states', () => {
        const result = cnFun(
            'hover:bg-red-500',
            'hover:bg-blue-500'
        );
        expect(result).toBe('hover:bg-blue-500');
    });
});
