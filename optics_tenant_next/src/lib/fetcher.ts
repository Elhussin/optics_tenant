try {
  await api.post('/api/users/', data);
} catch (error: any) {
  if (error.response?.status === 400) {
    const errors = error.response.data;
    console.log(errors); // { email: ["This email is already taken."] }

    for (const field in errors) {
    setError(field as keyof UserFormData, {
        type: 'server',
        message: errors[field][0], // أول رسالة فقط
    });
    }

  }
}


const domain = window.location.hostname; // store1.localhost
const baseUrl = `https://${domain}`;
const client = createApiClient(baseUrl);

const users = await client.get('/api/users/users/');


const client = createApiClient('https://store1.example.com');
await client.get('/api/users/users/');


const client = createApiClient('https://store1.example.com', {
  axiosConfig: {
    headers: {
      Authorization: 'Bearer token',
    },
  },
});
import { createApiClient } from 'api-client-library'; // فرضاً مكتبة لإنشاء عميل API
import { UserFormData } from './types'; // فرضاً ملف يحتوي على تعريفات البيانات



