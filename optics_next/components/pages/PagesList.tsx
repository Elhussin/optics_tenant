import { useFormRequest } from "@/lib/hooks/useFormRequest";
import { useEffect, useState } from "react";
import { Loading4 } from "@/components/ui/loding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import {ActionButton } from "@/components/ui/buttons";
import { Pencil, Eye,Plus } from "lucide-react";
export const PagesList = () => {
    const [pagesData, setPagesData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const params = useParams();
    const locale = params?.locale as string;
    const pageRequest = useFormRequest({ alias: `users_pages_list` });
    useEffect(() => {
  
        const fetchPages = async () => {
          try {
            const result = await pageRequest.submitForm();
            if (result?.success) {
              setPagesData(result.data);
            } else {
              setError("No pages found");
            }
          } catch {
            setError("Error loading pages");
          } finally {
            setLoading(false);
          }
        };
        fetchPages();
      
    }, []);
    if (loading) return <Loading4 />
    if (error) return <div className="text-red-500">{error}</div>;
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pagesData.map((p: any) => {
          // اختيار الترجمة المناسبة
          const translation = p.translations?.find((t: any) => t.language === locale)
                            || p.translations?.find((t: any) => t.language === p.default_language);
  
          return (
            <Card key={p.id ?? p.slug} className="shadow-md rounded-2xl border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{translation?.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Slug:</span> {p.slug}</p>
                <p><span className="font-medium">Status:</span> {p.is_published ? "Published" : "Draft"}</p>
                <p><span className="font-medium">SEO Title:</span> {translation?.seo_title}</p>
                <div className="flex gap-2 mt-4">
                  <ActionButton label="Edit " icon={<Pencil size={16} />} variant="link" navigateTo={`/dashboard/pages/${p.slug}/`} />
                  <ActionButton label="View " icon={<Eye size={16} />} variant="link" navigateTo={`/dashboard/pages?view=${p.slug}`} />
               
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  
  