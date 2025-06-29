// 'use client';

// import UserForm from '@/src/components/forms/UserRequestForm';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { api } from '@/src/lib/zod-api';
// import { toast } from 'sonner';

// export default function EditUserPage({ params }: { params: { id: string } }) {
//   const [defaultValues, setDefaultValues] = useState<any>(null);
//   const router = useRouter();

//   useEffect(() => {
//     api.get(`/api/users/users/${params.id}/`).then(setDefaultValues);
//   }, [params.id]);

//   if (!defaultValues) return <p>جاري التحميل...</p>;

//   return (
//     <UserForm
//       defaultValues={defaultValues}
//       onSuccess={() => {
//         toast.success('تم تحديث المستخدم!');
//         router.push('/users');
//       }}
//     />
//   );
// }

'use client';

export default function EditUserPage() {
    return (
        <div>
            <h1>Edit User</h1>
        </div>
    );
}
