// // app/products/page.tsx

// import { ProductFilters } from '@/archive/Filters/ProductFilters';
// import { useFormRequest } from '@/lib/hooks/useFormRequest';

// export default async function ProductsPage() {

//   const filters = useFormRequest({ alias: "products_products_list", onSuccess: (res) => { console.log(res); }, onError: (err) => { console.log(err); } });

//   return (
//     <div className="grid grid-cols-4 gap-4">
//       <aside>
//         <ProductFilters filters={filters} />
//       </aside>

//       <main className="col-span-3">
//         {/* هنا يتم عرض المنتجات بحسب query string */}
//         {/* يمكنك استخدام useSearchParams أو server-side filter */}
//       </main>
//     </div>
//   );
// }
