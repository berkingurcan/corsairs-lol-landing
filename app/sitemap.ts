import type { MetadataRoute } from "next";

import { COUNTRIES } from "@/lib/countries";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    ...COUNTRIES.map((c) => ({
      url: `${site.url}/t/${c.iso2}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
