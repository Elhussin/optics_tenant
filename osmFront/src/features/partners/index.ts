// features/partners/index.ts
/**
 * Partners & Insurance Module Exports
 */

// Types
export * from './types/partners.types';

// Hooks
export * from './hooks/usePartners';

// Components
export { PartnerCard } from './components/PartnerCard';
export { PaymentSplitCalculator } from './components/PaymentSplitCalculator';
export { ClaimStatusBadge } from './components/ClaimStatusBadge';

// Pages
export { PartnersListPage } from './pages/PartnersListPage';
export { InsuranceClaimsPage } from './pages/InsuranceClaimsPage';
