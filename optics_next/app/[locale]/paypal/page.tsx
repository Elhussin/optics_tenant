import PayPalButton from "@/components/PayPalButton";

export default function PayPalPage() {
  // هنا ممكن تجيب clientId من session أو props
  const clientId = "123"; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <PayPalButton clientId={clientId} />
    </div>
  );
}
