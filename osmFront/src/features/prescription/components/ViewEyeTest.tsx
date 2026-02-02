import EyeRowView from "./ViewEyeRow";
import { EyeTestLabel } from "./eyeTestLabel";
import { ActionButton } from "@/src/shared/components/ui/buttons";
import { Skeleton } from "@/src/shared/components/ui/Skeleton";
import { EmptyState } from "@/src/shared/components/ui/EmptyState";
import { Pagination } from "@/src/shared/components/views/Pagination";
import { SearchFilterForm } from "@/src/shared/components/search/SearchFilterForm";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import { useFilterDataOptions } from "@/src/shared/hooks/useFilterDataOptions";
import { formsConfig } from "@/src/shared/constants/entityConfig";
import { useSearchButton } from "@/src/shared/contexts/SearchButtonContext";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import {
  Eye,
  Sparkles,
  User,
  UserCircle,
  Calendar,
  Edit,
  Trash2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

const ViewEyeTest: React.FC<{ id?: string | number; title?: string }> = ({
  id,
  title,
}) => {
  const { filterAlias, listAlias } = formsConfig["prescriptions"];
  const {
    data,
    totalPages,
    page,
    setPage,
    setPageSize,
    page_size,
    setFilters,
    isLoading,
  } = useFilteredListRequest({ alias: listAlias || "" });
  const { show } = useSearchButton();
  show();
  const { fields, isLoading: isFieldsLoading } = useFilterDataOptions(
    filterAlias || "",
    {
      enabled: !!filterAlias,
    },
  );

  // Loading State
  if (isLoading || !data || isFieldsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} padding="lg">
              <div className="space-y-4">
                <Skeleton variant="title" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={16} />
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <Skeleton variant="text" width="100%" height={40} />
                  <Skeleton variant="text" width="100%" height={40} />
                  <Skeleton variant="text" width="100%" height={40} />
                  <Skeleton variant="text" width="100%" height={40} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton variant="button" width={80} height={36} />
                  <Skeleton variant="button" width={80} height={36} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <SearchFilterForm fields={fields} setFilters={setFilters} />
        <EmptyState
          type="default"
          title="No Prescriptions Found"
          description="Start by creating a new prescription"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Search Filter */}
      <SearchFilterForm fields={fields} setFilters={setFilters} />

      {/* Header with Actions */}
      {title && (
        <div className="flex items-center justify-between gap-4 pb-6 border-b border-border-main/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-main flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <ActionButton
              variant="ghost"
              size="md"
              icon={<ArrowLeft size={18} />}
              label="Back"
              navigateTo="/prescription"
              className="rounded-xl"
            />
            <ActionButton
              variant="success"
              size="md"
              icon={<Plus size={18} />}
              label="Add New"
              navigateTo="/prescription/create"
              className="rounded-xl shadow-lg hover:shadow-xl"
            />
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 gap-4">
        {data.map((item: any, index: number) => (
          <motion.div
            key={item.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative group"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <GlassCard
              className="shadow-lg hover:shadow-xl transition-all duration-300"
              padding="none"
            >
              {/* Gradient strip */}
              <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

              <div className="p-6">
                {/* Eye Test Values */}
                <div className="space-y-4 mb-6">
                  {/* Labels */}
                  <EyeTestLabel />

                  {/* Right Eye */}
                  <div className="p-3 rounded-xl bg-elevated border border-border-main/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="info" size="sm">
                        OD
                      </Badge>
                      <span className="text-xs text-secondary">Right Eye</span>
                    </div>
                    <EyeRowView side="right" data={item} />
                  </div>

                  {/* Left Eye */}
                  <div className="p-3 rounded-xl bg-elevated border border-border-main/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" size="sm">
                        OS
                      </Badge>
                      <span className="text-xs text-secondary">Left Eye</span>
                    </div>
                    <EyeRowView side="left" data={item} />
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 p-4 rounded-xl bg-elevated/50 border border-border-main/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-secondary font-medium">
                        Customer
                      </p>
                      <p className="text-sm text-main font-medium truncate">
                        {item.customer_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg">
                      <UserCircle size={16} className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-secondary font-medium">
                        Created by
                      </p>
                      <p className="text-sm text-main font-medium truncate">
                        {item.created_by_username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-info/10 rounded-lg">
                      <Calendar size={16} className="text-info" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-secondary font-medium">
                        Created at
                      </p>
                      <p className="text-sm text-main font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-secondary">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border-main/30">
                  <ActionButton
                    label="Edit"
                    variant="warning"
                    size="sm"
                    icon={<Edit size={16} />}
                    navigateTo={`/prescription/${item.id}/edit`}
                    className="flex-1 rounded-xl"
                  />
                  <ActionButton
                    label="View Details"
                    variant="info"
                    size="sm"
                    icon={<Eye size={16} />}
                    navigateTo={`/prescription/${item.id}`}
                    className="flex-1 rounded-xl"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={page_size}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default ViewEyeTest;
