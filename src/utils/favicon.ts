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
  const svg = optimize(favicon).data;

  return svg;
};

export const ico = async () => {
  const png = await sharp(Buffer.from(favicon), { density: 384 })
    .resize(32, 32)
    .png()
    .toBuffer();

  const header = Buffer.alloc(6); // ICONDIR
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type
  header.writeUInt16LE(1, 4); // number of images

  const entry = Buffer.alloc(16); // ICONDIRENTRY
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2); // palette colors
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // image data size
  entry.writeUInt32LE(6 + 16, 12); // image data offset

  const ico = Buffer.concat([header, entry, png]);

  return ico;
};
