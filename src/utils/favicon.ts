import sharp from "sharp";
import { optimize } from "svgo";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" id="svg3" width="1000" height="1000">
  <title>Favicon</title>
  <style id="style1">text{fill:#222}@media (prefers-color-scheme:dark){text{fill:#ddd}}</style>
  <text id="text1" x="-58.108" y="1864.84" style="font-style:normal;font-variant:normal;font-weight:400;font-stretch:normal;font-size:868.647px;font-family:monospace" transform="scale(1.87714 .53273)">3</text>
  <text id="text2" x="-60.115" y="922.428" style="font-style:normal;font-variant:normal;font-weight:400;font-stretch:normal;font-size:885.729px;font-family:monospace" transform="scale(1.84486 .54205)">7</text>
  <text id="text3" x="-112.097" y="1170.352" style="font-style:normal;font-variant:normal;font-weight:400;font-stretch:normal;font-size:1605.41px;font-family:monospace" transform="scale(1.17035 .85444)">R</text>
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
