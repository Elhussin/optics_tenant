
import { Loading4 } from "@/src/shared/components/ui/loding";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import {ActionButton } from "@/src/shared/components/ui/buttons";
import { Pencil, Eye } from "lucide-react";
import { useFilteredListRequest } from "@/src/shared/hooks/useFilteredListRequest";
import {useTranslations} from 'next-intl';
import {useLocale} from 'next-intl';
export const PagesList = () => {
    const t = useTranslations("pagesList");
      const locale = useLocale();
    const {data,isLoading} = useFilteredListRequest("users_pages_list");

    if (isLoading || !data ) return <Loading4 />;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((p: any) => {
          // اختيار الترجمة المناسبة
          const translation = p.translations?.find((t: any) => t.language === locale)
                            || p.translations?.find((t: any) => t.language === p.default_language);
  
          return (
            <Card key={p.id ?? p.slug} className="shadow-md rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translation?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">{t('slug')}:</span> {p.slug}</p>
                <p><span className="font-medium">{t('status')}:</span> {p.is_published ? "Published" : "Draft"}</p>
                <p><span className="font-medium">{t('seoTitle')}:</span> {translation?.seo_title}</p>
                <div className="flex gap-2 mt-4">
                  <ActionButton label={t('edit')} icon={<Pencil size={16} />} variant="link" navigateTo={`/dashboard/pages/${p.id}/edit`} />
                  <ActionButton label={t('view')} icon={<Eye size={16} />} variant="link" navigateTo={`/dashboard/pages/${p.id}`} />

                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  
  