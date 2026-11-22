import { ico, svg } from "@utils/favicon";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

describe("svg()", () => {
  it("returns a non-empty SVG string", async () => {
    const result = await svg();

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result.trimStart().startsWith("<svg")).toBe(true);
    expect(result.trimEnd().endsWith("</svg>")).toBe(true);
  });

  it("keeps the SVG namespace", async () => {
    const result = await svg();

    expect(result).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("can be rasterized by sharp", async () => {
    const result = await svg();

    const meta = await sharp(Buffer.from(result)).metadata();
    expect(meta.format).toBe("svg");
    expect(meta.width).toBeGreaterThan(0);
    expect(meta.height).toBeGreaterThan(0);
  });

  it("is deterministic", async () => {
    const result = await svg();

    expect(result).toStrictEqual(await svg());
  });
});

describe("ico()", () => {
  const sizes = [16, 32, 48];
  const headerSize = 6;
  const entrySize = 16;
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  it("returns a Buffer", async () => {
    const result = await ico();

    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("writes a valid ICONDIR header", async () => {
    const result = await ico();

    expect(result.readUInt16LE(0)).toBe(0); // reserved
    expect(result.readUInt16LE(2)).toBe(1); // type: icon
    expect(result.readUInt16LE(4)).toBe(sizes.length); // image count
  });

  it("writes one directory entry per size with correct metadata", async () => {
    const result = await ico();

    sizes.forEach((size, i) => {
      const base = headerSize + i * entrySize;

      expect(result.readUInt8(base)).toBe(size); // width
      expect(result.readUInt8(base + 1)).toBe(size); // height
      expect(result.readUInt8(base + 2)).toBe(0); // palette colors
      expect(result.readUInt8(base + 3)).toBe(0); // reserved
      expect(result.readUInt16LE(base + 4)).toBe(1); // color planes
      expect(result.readUInt16LE(base + 6)).toBe(32); // bits per pixel
    });
  });

  it("has contiguous, in-bounds image offsets and sizes", async () => {
    const result = await ico();
    let expectedOffset = headerSize + sizes.length * entrySize;

    sizes.forEach((_, i) => {
      const base = headerSize + i * entrySize;
      const length = result.readUInt32LE(base + 8);
      const offset = result.readUInt32LE(base + 12);

      expect(length).toBeGreaterThan(0);
      expect(offset).toBe(expectedOffset);
      expect(offset + length).toBeLessThanOrEqual(result.length);

      expectedOffset += length;
    });

    // No trailing bytes after the last image
    expect(expectedOffset).toBe(result.length);
  });

  it("embeds PNG data of the declared dimensions", async () => {
    const result = await ico();

    for (const [i, size] of sizes.entries()) {
      const base = headerSize + i * entrySize;
      const length = result.readUInt32LE(base + 8);
      const offset = result.readUInt32LE(base + 12);
      const png = result.subarray(offset, offset + length);

      expect(png.subarray(0, 8).equals(pngSignature)).toBe(true);

      const meta = await sharp(png).metadata();
      expect(meta.format).toBe("png");
      expect(meta.width).toBe(size);
      expect(meta.height).toBe(size);
      expect(meta.hasAlpha).toBe(true);
    }
  });

  it("is deterministic", async () => {
    const result = await ico();

    expect(result).toStrictEqual(await ico());
  });
});
