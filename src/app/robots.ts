import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://aitaskhub.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account/", "/wallet/", "/tasks/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
