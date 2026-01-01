// Server component – reads request headers and decides which UI to render
import { getSubdomain } from "@/src/shared/utils/getSubdomain";
import { headers } from "next/headers";
import HomeContent from "@/src/app/[locale]/HomeContent";

export default async function HomePage() {
  // 1️⃣ Get request headers (server‑only)
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const subdomain = getSubdomain(host);

  // 2️⃣ Render the appropriate UI. All client‑side logic lives in HomeContent.
  return <HomeContent subdomain={subdomain} />;
}
