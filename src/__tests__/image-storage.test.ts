import { describe, it, expect, vi, afterEach } from "vitest";
import { downloadImageAsBase64 } from "@/lib/image-storage";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("downloadImageAsBase64", () => {
  it("returns a data:image/png;base64,... string for a successful fetch", async () => {
    const fakeBytes = new Uint8Array([137, 80, 78, 71]); // PNG magic bytes
    const fakeArrayBuffer = fakeBytes.buffer;

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      arrayBuffer: () => Promise.resolve(fakeArrayBuffer),
    }));

    const result = await downloadImageAsBase64("https://example.com/image.png");

    expect(result).toMatch(/^data:image\/png;base64,/);
    // Verify the base64 payload decodes back to the original bytes
    const base64Part = result.replace("data:image/png;base64,", "");
    const decoded = Buffer.from(base64Part, "base64");
    expect(Array.from(decoded)).toEqual(Array.from(fakeBytes));
  });

  it("throws when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    await expect(downloadImageAsBase64("https://example.com/bad.png")).rejects.toThrow("Network error");
  });
});
