// app/user-form/page.tsx أو pages/user-form.tsx (حسب نوع مشروعك)

'use client';

import Form from "@rjsf/core";
import schema from "../../schemas/user-schema.json"; // تأكد من المسار

export default function UserForm() {
  const handleSubmit = ({ formData }: any) => {
    console.log("Form Data:", formData);

    // تقدر تستخدم fetch أو axios هنا لإرسال البيانات إلى Django
    // axios.post('/api/users/', formData)
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 className="text-xl font-bold mb-4">Create User</h2>
      <Form schema={schema} onSubmit={handleSubmit} />
    </div>
  );
}
