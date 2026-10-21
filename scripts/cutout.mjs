// One-off: remove the white studio background from the Deadpool photo (flood fill from the edges).
import sharp from "sharp";

const input = "public/assets/deadpool.webp";
const output = "public/assets/deadpool-cutout.webp";

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;
const lightness = (i) => Math.min(data[i], data[i + 1], data[i + 2]);
const isBackground = (i) => lightness(i) > 228;

const seen = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) stack.push(x, (height - 1) * width + x, x + 0);
for (let y = 0; y < height; y++) stack.push(y * width, y * width + width - 1);

while (stack.length) {
  const p = stack.pop();
  if (seen[p]) continue;
  seen[p] = 1;
  const i = p * 4;
  if (!isBackground(i)) continue;
  data[i + 3] = 0;
  const x = p % width, y = (p / width) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < width - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - width);
  if (y < height - 1) stack.push(p + width);
}

// Soften the edge: light pixels touching the removed background become partly transparent.
for (let p = 0; p < width * height; p++) {
  const i = p * 4;
  if (data[i + 3] === 0) continue;
  const x = p % width, y = (p / width) | 0;
  const touches = [p - 1, p + 1, p - width, p + width].some((q) => q >= 0 && q < width * height && Math.abs((q % width) - x) <= 1 && data[q * 4 + 3] === 0);
  if (touches) {
    const l = lightness(i);
    if (l > 170) data[i + 3] = Math.round(255 * (1 - (l - 170) / 85));
  }
}

await sharp(data, { raw: { width, height, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }).toFile(output);
console.log("saved", output, width, height);
