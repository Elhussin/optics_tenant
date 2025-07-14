import Button from "@/components/ui/button/Button";
import { Eye, Pencil, Trash2 ,ArrowLeft} from "lucide-react"; // أيقونات جميلة
import { useRouter } from "next/navigation";
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

export default function ActionButtons({isAll = false, onView, onEdit, onSoftDelete, onRestore, onHardDelete, showRestoreButton = false, showHardDeleteButton = false }: ActionButtonsProps) {


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


export const BackButton = () => {
  const router = useRouter();
  return <Button
  label="Back"
  onClick={() => router.back()}
  variant="primary"
  icon={<ArrowLeft size={16} />}
  className="md:mt-0 mt-4"
/>
}
