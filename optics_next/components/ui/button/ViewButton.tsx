import Button from "@/components/ui/Button";
import { Eye } from "lucide-react";

interface ViewButtonProps {
  onClick?: () => void;
}

export default function ViewButton({ onClick }: ViewButtonProps) {
  return (
    <Button
      label="View"
      icon={<Eye size={16} />}
      onClick={onClick ?? (() => {})}
      variant="secondary"
    />
  );
}
