import type { MetadataRoute } from "next";

import { COUNTRIES } from "@/lib/countries";
import { boardIsLive, site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    // One page per country, never two. See `boardIsLive`.
    ...COUNTRIES.map((c) => ({
      url: boardIsLive ? `${site.url}/app/c/${c.iso2}` : `${site.url}/t/${c.iso2}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
