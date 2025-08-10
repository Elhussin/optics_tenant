'use client';
import { useState } from 'react';

export default function AddFormPage() {
  const [key, setKey] = useState('');
  const [formData, setFormData] = useState({
    schemaName: '',
    alias: '',
    submitText: '',
    successMessage: '',
    errorMessage: '',
    title: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, settings: formData }),
    });

    if (res.ok) {
      alert('Form config saved!');
      setKey('');
      setFormData({
        schemaName: '',
        alias: '',
        submitText: '',
        successMessage: '',
        errorMessage: '',
        title: '',
      });
    } else {
      alert('Error saving form');
    }
  };

  return (
    <div>
      <h1>Add New Form</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Form Key"
          value={key}
          onChange={e => setKey(e.target.value)}
          required
        />
        {Object.keys(formData).map(field => (
          <input
            key={field}
            placeholder={field}
            value={(formData as any)[field]}
            onChange={e => handleChange(field, e.target.value)}
            required
          />
        ))}
        <button type="submit">Save Form</button>
      </form>
    </div>
  );
}


// 'use client';
// import { useParams } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import DynamicFormGenerator from '@/components/forms/DynamicFormGenerator';

// export default function DynamicFormPage() {
//   const { formKey } = useParams();
//   const [config, setConfig] = useState<any>(null);

//   useEffect(() => {
//     fetch('/api/forms')
//       .then(res => res.json())
//       .then(data => setConfig(data[formKey as string]));
//   }, [formKey]);

//   if (!config) {
//     return <p>Loading form...</p>;
//   }

//   return (
//     <DynamicFormGenerator
//       schemaName={config.schemaName}
//       alias={config.alias}
//       submitText={config.submitText}
//       successMessage={config.successMessage}
//       errorMessage={config.errorMessage}
//       title={config.title}
//     />
//   );
// }
