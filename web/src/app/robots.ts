import type { MetadataRoute } from "next";

const siteUrl = "https://www.gbgbattleground.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/control",
        "/create",
        "/detail",
        "/live",
        "/observer",
        "/overlay",
        "/teams",
        "/website",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
