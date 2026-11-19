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

export const svg = async () => {
  return optimize(favicon).data;
};

export const ico = async () => {
  const sizes = [16, 32, 48] as const;

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
