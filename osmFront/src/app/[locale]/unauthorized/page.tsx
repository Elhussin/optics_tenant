import { generateMetadata } from '@/src/shared/utils/metadata';
import UnauthorizedContent from './UnauthorizedContent';

export const metadata = generateMetadata({
  title: 'Unauthorized',
  description: 'You do not have permission to access this page.',
  openGraphType: 'website',
});

export default function UnauthorizedPage() {
  return <UnauthorizedContent />;
}
