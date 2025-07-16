import Button from "@/components/ui/buttons/Button";
import { Check } from "lucide-react";
import { BaseButtonProps } from "@/types";

export default function ActivateButton({ onClick }: BaseButtonProps) {
  return (
    <Button
      label="Activate"
      icon={<Check size={16} />}
      onClick={onClick ?? (() => {})}
      variant="success"
    />
  );
}
