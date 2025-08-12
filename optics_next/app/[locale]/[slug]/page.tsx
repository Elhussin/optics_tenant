import { axiosInstance } from "@/lib/api/axios";
import { getBaseUrl } from "@/lib/utils/getBaseUrl";
import { apiConfig } from "@/lib/api/apiConfig";
import {FetchData} from "@/lib/api/api";


      // try {
      //   apiConfig.ignoreSubdomain = true;
      //   const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);

      //   const res = await axiosInstance.post(
      //     `${baseUrl}/api/tenants/paypal/execute/`,
      //     {
      //       order_id: orderId,
      //       client_id: clientId,
      //       plan_id: planID,
      //       direction: direction,
      //       duration: duration,
      //     }
      //   );

// async function getPageData(slug: string, req?: any) {
//     // apiConfig.ignoreSubdomain = true;
    
    

//   try {
//     const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);
//     // getBaseUrl()

//     const res = await axiosInstance.get(`${baseUrl}/pages/${slug}/`);

//     if (res.status === 403) {
//       throw new Error("Unauthorized access");
//     }

//     if (res.status === 404) return null; // Not Found
//     if (!res || !res.data) throw new Error("Page not found");

//     return res.data;
//   } catch (error) {
//     console.error("Error fetching page data:", error);
//     throw error;
//   }


// }
export default async function DynamicPage({ params }: { params: { locale: string; slug: string } }) {
  const proms = await params;
  const slug: string = proms.slug;
  const ignoreSubdomain: boolean = apiConfig.ignoreSubdomain;
  const baseUrl = getBaseUrl(undefined, apiConfig.ignoreSubdomain);
  console.log("Base URL dynamic:", baseUrl);

  const page = await FetchData({ ignoreSubdomain: false, url: `/${baseUrl}/pages/${slug}/` });

  // const page = await getPageData(proms.slug);  
  console.log("Fetched Page Data:", page);

  if (!page) {
    return <div className="container mx-auto p-6">Page not found</div>;
  }

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.body }} />
    </main>
  );
}

