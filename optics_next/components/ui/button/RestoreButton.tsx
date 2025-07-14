import Button from "@/components/ui/button/Button";
import { ArrowLeft } from "lucide-react";

interface RestoreButtonProps {
  onClick?: () => void;
}

export default function RestoreButton({ onClick }: RestoreButtonProps) {
  return (
    <Button
      label="Restore"
      title="This action will restore the item"
      icon={<ArrowLeft size={16} />}
      onClick={onClick ?? (() => {})}
      variant="secondary"
    />
  );
}
