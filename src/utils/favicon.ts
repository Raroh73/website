import sharp from "sharp";
import { optimize } from "svgo";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <title>Favicon</title>
  <style>
    .bg { fill: #222; }
    .fg {
      fill: none;
      stroke: #ddd;
      stroke-width: 130;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    @media (prefers-color-scheme: dark) {
      .bg { fill: #ddd; }
      .fg { stroke: #222; }
    }
  </style>
  <rect class="bg" width="1024" height="1024" rx="224" ry="224"/>
  <path class="fg" d="M340 780V244H540a150 150 0 0 1 0 300H340M520 544L670 780"/>
</svg>
`;

/**
 * Generates an optimized SVG version of the favicon.
 *
 * The source favicon markup is passed through SVGO to strip unnecessary
 * metadata and reduce file size.
 *
 * @returns A promise resolving to the optimized SVG markup as a string.
 */
export const svg = async () => {
  return optimize(favicon).data;
};

/**
 * Generates a multi-resolution `.ico` file from the favicon SVG.
 *
 * The SVG is rasterized with Sharp into PNG images at 16×16, 32×32 and
 * 48×48 pixels. The PNGs are then packed into a single ICO container by
 * hand, using PNG-compressed image entries (supported by Windows Vista and
 * later, and all modern browsers).
 *
 * The resulting file layout is:
 * 1. `ICONDIR` header (6 bytes)
 * 2. One `ICONDIRENTRY` per image (16 bytes each)
 * 3. The raw PNG data for each image, in the same order as the entries
 *
 * @returns A promise resolving to a `Buffer` containing the binary `.ico` file.
 *
 * @see {@link https://en.wikipedia.org/wiki/ICO_(file_format) | ICO file format}
 */
export const ico = async () => {
  const sizes = [16, 32, 48] as const;

  // Rasterize the SVG at each target size. A high density is used so the
  // vector source is rendered crisply before being downscaled.
  const pngs = await Promise.all(
    sizes.map(async (size) => ({
      size,
      data: await sharp(Buffer.from(favicon), { density: 384 })
        .resize(size, size)
        .png()
        .toBuffer(),
    })),
  );

  const header = Buffer.alloc(6); // ICONDIR
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type (1 = icon)
  header.writeUInt16LE(pngs.length, 4); // number of images

  // Image data starts after the header and all directory entries
  let offset = header.length + pngs.length * 16;

  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16); // ICONDIRENTRY
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // palette colors
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset

    offset += data.length;

    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngs.map(({ data }) => data)]);
};
