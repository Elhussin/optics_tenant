"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { Link } from "@/src/app/i18n/navigation";
import { useUser } from "@/src/features/auth/hooks/UserContext";
import { dashboardLink } from "@/src/features/dashboard/constants";
import { PageHeader } from "@/src/shared/components/ui/PageHeader";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Input } from "@/src/shared/components/shadcn/ui/input";
import { Button } from "@/src/shared/components/shadcn/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/shared/components/shadcn/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/src/shared/components/shadcn/ui/command";
import { Search, LayoutGrid, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export default function DashboardLinks() {
  const { user } = useUser();
  const t = useTranslations("dashboardLinks");

  // We can use a generic "Search" translation if available, or fallback
  // Since we are inside "dashboardLinks" scope, we check if 'search' key exists there.
  // It does exist as per our check: "search": "Search"

  const subdomain = getSubdomain();
  const userRoles = user?.roles?.map((r: any) => r.name) || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [openCombobox, setOpenCombobox] = useState(false);

  // 1. Filter links by Role & Subdomain
  const allowedLinks = useMemo(() => {
    return dashboardLink.filter((link) => {
      // 1. Filter by Role
      const hasAccess = link.roles.some((role) => userRoles.includes(role));
      if (!hasAccess) return false;

      // 2. Filter by Subdomain
      if (subdomain) {
        // We are in a subdomain (tenant store) -> show only tenant links
        return link.isTenant === true;
      } else {
        // We are in the main domain (admin panel) -> show only system admin links
        return link.isTenant === false;
      }
    });
  }, [userRoles, subdomain]);

  // 2. Extract Groups
  const groups = useMemo(() => {
    const g = Array.from(new Set(allowedLinks.map((l) => l.group)));
    // Sort groups alphabetically, but keep "All" conceptually first (handled in render)
    return ["All", ...g.sort()];
  }, [allowedLinks]);

  // 3. Filter displayed links based on Search & Active Tab
  const filteredLinks = useMemo(() => {
    return allowedLinks.filter((link) => {
      const matchesGroup = activeTab === "All" || link.group === activeTab;

      // Translate the href to search against the display name
      const displayName = t(link.href) || link.href;
      const matchesSearch = displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesGroup && matchesSearch;
    });
  }, [allowedLinks, activeTab, searchQuery, t]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header with Search */}
      <PageHeader
        title={t("dashboard")}
        description={
          user?.email ? `${t("profile")} : ${user.username}` : undefined
        }
        icon={<LayoutGrid className="w-6 h-6" />}
        className="mb-8"
      >
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-white/50 border-white/20 dark:bg-black/20 dark:border-white/10 rounded-xl focus:ring-primary/50"
          />
        </div>
      </PageHeader>

      {/* Categories / Filter */}
      <div className="flex justify-end mb-4">
        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openCombobox}
              className="w-full sm:w-[250px] justify-between h-10 bg-surface border-border hover:bg-hover hover:border-primary/50"
            >
              <span
                className={cn(
                  "truncate",
                  activeTab === "All" && "text-muted-foreground",
                )}
              >
                {activeTab === "All" ? "Filter by Category..." : activeTab}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0 bg-surface border border-border">
            <Command className="bg-surface">
              <CommandInput placeholder="Search category..." className="h-9" />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {groups.map((group) => (
                    <CommandItem
                      key={group}
                      value={group}
                      onSelect={(currentValue) => {
                        // If "All Apps" is selected (value "All" or similar), existing logic handles it
                        // shadcn command might lower-case values, so be careful.
                        // However, we are mapping over 'groups' which preserves case in display.
                        // For safety, we set activeTab to the group string directly.
                        setActiveTab(group);
                        setOpenCombobox(false);
                      }}
                      className="cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeTab === group ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {group === "All" ? "All Apps" : group}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* App Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredLinks.map(({ href, icon: Icon, group }) => (
          <GlassCard
            key={href}
            className="group relative overflow-hidden border-transparent hover:border-primary/20 bg-surface/50 hover:bg-surface/80"
            hover
            padding="none"
          >
            <Link href={`/dashboard/${href}/`} className="block p-6 h-full">
              <div className="flex flex-col items-center justify-center gap-4 h-full">
                <div
                  className={cn(
                    "p-4 rounded-2xl transition-all duration-300",
                    "bg-primary/5 group-hover:bg-primary/10 group-hover:scale-110",
                    "text-primary shadow-sm group-hover:shadow-md shadow-primary/10",
                  )}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-main group-hover:text-primary transition-colors line-clamp-2">
                    {t(href)}
                  </h3>
                  {activeTab === "All" && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-secondary/10 text-[10px] text-secondary font-medium uppercase tracking-wider">
                      {group}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {filteredLinks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in mx-auto">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
            <Search className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-secondary font-medium">
            No results found for "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveTab("All");
            }}
            className="mt-4 text-primary hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
