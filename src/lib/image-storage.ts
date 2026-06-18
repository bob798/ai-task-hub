/**
 * Download a remote image and convert it to a base64 data URI.
 * This avoids relying on DALL-E's temporary URLs that expire after ~1 hour.
 */
export async function downloadImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:image/png;base64,${base64}`;
}
