import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

interface RestoreButtonProps {
  onClick?: () => void;
}

export default function RestoreButton({ onClick }: RestoreButtonProps) {
  return (
    <Button
      label="Restore"
      icon={<ArrowLeft size={16} />}
      onClick={onClick ?? (() => {})}
      variant="secondary"
    />
  );
}
