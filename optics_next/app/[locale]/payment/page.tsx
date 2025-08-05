
'use client';
import PayPalButton from "@/components/PayPalButton";
import { useUser } from "@/lib/context/userContext";

export default function PaymentPage() {
  // هنا ممكن تجيب clientId من session أو props
  const {user} = useUser();
  console.log(user);
  const clientId = user?.id; 
  const planId = user?.plan_id;
  const direction = user?.direction;

  return (
    <>
    <h1>Payment Page</h1>
    <h2>Client ID: {clientId}</h2>
    <h2>Plan ID: {planId}</h2>
    <h2>Direction: {direction}</h2>
    <h2>Amount: {user?.amount}</h2>
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PayPalButton clientId={clientId} planId={planId} direction={direction} />
    </div>
    </>
  );
}
