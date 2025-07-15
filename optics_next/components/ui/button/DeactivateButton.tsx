
import Button from "@/components/ui/button/Button";
import { X } from "lucide-react";
import { BaseButtonProps } from "@/types";

export default function DeactivateButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label="Deactivate"
      icon={<X size={16} />}
      onClick={onClick ?? (() => {})}
      variant="secondary"
    />
  );
}
