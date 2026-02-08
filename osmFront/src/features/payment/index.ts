// features/payment/index.ts
/**
 * Payment Module Exports
 */

// Types
export * from './types/payment.types';

// Hooks
export * from './hooks/usePayment';

// Components
export { BNPLButton, TabbyPromoButton, TamaraPromoButton } from './components/BNPLButton';
export { InstallmentCard, InstallmentsList } from './components/InstallmentCard';
export { PaymentMethodSelector } from './components/PaymentMethodSelector';

// Pages
export { default as PaymentsListPage } from './pages/PaymentsListPage';
export { InstallmentsPage } from './pages/InstallmentsPage';
export { BNPLCallbackPage } from './pages/BNPLCallbackPage';
