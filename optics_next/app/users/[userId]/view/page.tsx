'use client'

import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCrudHandlers } from '@/lib/hooks/useCrudHandlers';
import { toast } from 'sonner';
import ActionButtons from '@/components/ui/ActionButtons';
import { useParams } from 'next/navigation';
import { createFetcher } from '@/lib/hooks/useCrudFormRequest';
import { BackButton } from '@/components/ui/ActionButtons';
import ViewDetailsCard from '@/components/ViewDetailsCard';
import { generateViewFieldsWithLabels } from '@/lib/utils/generateViewFieldsFromSchema';
import { schemas } from '@/lib/api/zodClient';
import { Loading4 } from '@/components/ui/loding';

const fields = generateViewFieldsWithLabels(schemas.User, {
    hiddenFields: ["id", "password"],
    fieldLabels: {
      email: "Customer Email",
      first_name: "Customer First Name",
      last_name: "Customer Last Name",
    },
  });

export default function UserDetail() {
    const params = useParams();
    const { userId } = params;
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);

 

    const fetchUser = createFetcher("users_users_retrieve",setUser);
    useEffect(() => {if (userId) {fetchUser({ id: userId });}}, [userId]);

    if(!user){
        return <Loading4 />
    }
    return (
        
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Details</h1>
                <BackButton />
            </div>


                <ViewDetailsCard
                alias="users_users_retrieve"
                fields={fields}
                item={user}
                restoreAlias="users_users_partial_update"
                hardDeleteAlias="users_users_destroy"
                path="/users"
                title="User Details"
                />
        </div>
    );
}

