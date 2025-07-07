// // types/search.ts
// export interface SearchField {
//     name: string;
//     label: string;
//     type?: 'text' | 'select' | 'number';
//     options?: { label: string; value: string | number }[]; // إذا كان select
//     placeholder?: string;
//   }
  

  // ✅ types/search.ts
  export interface SearchField {
    name: string;
    label: string;
    type?: 'text' | 'select';
    options?: { label: string; value: string }[];
  }
  
  