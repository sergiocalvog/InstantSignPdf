import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate a simple RGBA PNG buffer
function createPng(width, height, getPixelRgba) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (scanlineLength + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);

  return Buffer.concat([len, typeBuf, data, crc]);
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Draw a beautiful blue rounded icon with a pen / document accent
function renderIconPixel(x, y, w, h) {
  // Normalized coords 0..1
  const nx = x / w;
  const ny = y / h;

  // Center distance for rounded rectangle
  const cx = Math.abs(nx - 0.5);
  const cy = Math.abs(ny - 0.5);
  const cornerR = 0.44;

  // Background rounded squircle
  const isInside = cx < 0.45 && cy < 0.45;
  if (!isInside) {
    return [0, 0, 0, 0];
  }

  // Blue gradient (Deep Royal Blue to Indigo)
  const r = Math.round(30 + ny * 20);
  const g = Math.round(90 + nx * 40);
  const b = Math.round(230 + ny * 25);

  // Pen stroke / signature slash in center
  const distToLine = Math.abs((nx - 0.25) - (ny - 0.35) * 1.0);
  if (distToLine < 0.08 && nx > 0.28 && nx < 0.72 && ny > 0.28 && ny < 0.72) {
    return [255, 255, 255, 255]; // Crisp white pen stroke
  }

  return [r, g, b, 255];
}

const outDir = path.resolve('public/icons');
fs.mkdirSync(outDir, { recursive: true });

[16, 32, 48, 128].forEach((size) => {
  const buf = createPng(size, size, renderIconPixel);
  const filePath = path.join(outDir, `icon${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated: ${filePath} (${buf.length} bytes)`);
});
