
import { schemas } from '@/lib/zod-client';
import GenericForm from '@/components/forms/generic_/GenericForm';

export default function RegisterPage() {
  return (
    <GenericForm
      schema={schemas.UserRequest}
      endpoint="users/register"
      mode="create"
      onSuccess={(data) => console.log('تم التسجيل:', data)}
    />
  );
}
