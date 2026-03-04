// Generate simple PNG icons for PWA
const { createCanvas } = await import('canvas').catch(() => null) || {};

// If canvas not available, create minimal valid PNGs
import { writeFileSync } from 'fs';

function createMinimalPNG(size) {
  // Create a minimal valid PNG
  // For now, we'll just create 1x1 pixel PNGs as placeholders
  // The SVG icon will be the primary icon
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  ]);
  
  // IHDR
  const width = Buffer.alloc(4); width.writeUInt32BE(size);
  const height = Buffer.alloc(4); height.writeUInt32BE(size);
  const ihdrData = Buffer.concat([width, height, Buffer.from([8, 2, 0, 0, 0])]);
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT - minimal image data (all blue pixels)
  const { deflateSync } = await import('zlib');
  const rawData = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    rawData[y * (size * 3 + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const offset = y * (size * 3 + 1) + 1 + x * 3;
      rawData[offset] = 0x29;     // R
      rawData[offset + 1] = 0x80; // G  
      rawData[offset + 2] = 0xE8; // B
    }
  }
  const compressed = deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);
  
  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([header, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icons
try {
  const png192 = createMinimalPNG(192);
  writeFileSync('public/icon-192.png', png192);
  const png512 = createMinimalPNG(512);
  writeFileSync('public/icon-512.png', png512);
  console.log('Icons generated!');
} catch (e) {
  console.error('Icon gen failed:', e);
}
