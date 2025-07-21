// app/reset-password/page.tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    await axios.post('/api/password-reset-confirm/', { uid, token, password });
    setSuccess(true);
  };

  return (
    <div>8
      {success ? (
        <p>Password reset successfully! You can now login.</p>
      ) : (
        <>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" />
          <button onClick={handleReset}>Reset Password</button>
        </>
      )}
    </div>
  );
}
