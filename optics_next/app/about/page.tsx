
import { generateMetadata } from '@/utils/metadata';
generateMetadata({
  title: 'About | O-S-M',
  description: 'About  Optical System Management[O-S-M] ',
  keywords: ['optical', 'system', 'management', 'O-S-M'],
  canonicalUrl: 'https://solovizion.com/products/sunglasses-2025',
  openGraphImage: 'https://solovizion.com/images/products/sunglasses-og.jpg',
  openGraphType: 'about',
  twitterCardType: 'summary',
});

export default function AboutPage() {
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold">Welcome to O-S-M</h2>
      <p className="mt-4 text-gray-700">O-S-M is a web application for managing an optical system.</p>
      <p className="mt-4 text-gray-700">Start your journey with O-S-M today!</p>
      <p className="mt-4 text-gray-700">Best solution for managing an optical system.</p>
    </div>
  );
}
