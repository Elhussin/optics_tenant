import Button from "@/components/ui/Button";
import { Eye, Pencil, Trash2 } from "lucide-react"; // أيقونات جميلة

interface ActionButtonsProps {
  isAll?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onSoftDelete?: () => void;
  onRestore?: () => void;
  onHardDelete?: () => void;
  showRestoreButton?: boolean;
  showHardDeleteButton?: boolean;
}

export default function ActionButtons({isAll = false, onView, onEdit, onSoftDelete, onRestore, onHardDelete, showRestoreButton, showHardDeleteButton }: ActionButtonsProps) {


  return (
    <div className="flex gap-2">
      <Button
        label="View"
        onClick={onView || (() => {})}
        icon={<Eye size={16} />}
        variant="secondary"
      />
      <Button
        label="Edit"
        onClick={onEdit || (() => {})}
        icon={<Pencil size={16} />}
        variant="primary"
      />
      {isAll && (
        <>
          <Button
            label="Delete"
            onClick={onSoftDelete || (() => {})}
            icon={<Trash2 size={16} />}
            variant="danger"
          />
          {showRestoreButton && (
            <Button
              label="Restore"
              onClick={onRestore || (() => {})}
              icon={<Trash2 size={16} />}
              variant="danger"
            />
          )}
          {showHardDeleteButton && (
            <Button
              label="Hard Delete"
              onClick={onHardDelete || (() => {})}
              icon={<Trash2 size={16} />}
              variant="danger"
            />
          )}
        </>
      )}
     

    </div>
  );
}
