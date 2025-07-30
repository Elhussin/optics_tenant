
'use client';
import PayPalButton from "@/components/PayPalButton";
import { useUser } from "@/lib/context/userContext";
export default function PayPalPage() {
  // هنا ممكن تجيب clientId من session أو props
  const {user} = useUser();
  console.log(user);
  const clientId = user?.id; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PayPalButton clientId={clientId} />
    </div>
  );
}
