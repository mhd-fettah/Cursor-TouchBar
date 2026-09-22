'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Same height as Lucide toolbar icons (icons-download.sh).
const ICON_SIZE = 96;
const PAD_X = 0;
const CHAR_GAP = 0;
const LIMIT = 12;
const INK = [255, 255, 255, 255];
const FOLDER_GAP = 0;
const spriteCache = new Map();

function charSlug(ch) {
  if (ch === '/') return 'slash';
  if (ch === '-') return 'hyphen';
  if (ch === '_') return 'underscore';
  if (ch === '.') return 'dot';
  if (ch === '…') return 'ellipsis';
  if (/^[a-zA-Z0-9]$/.test(ch)) return ch;
  return null;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let bit = 0; bit < 8; bit++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function png(width, height, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function fit(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= LIMIT) {
    return clean || ' ';
  }
  return clean.slice(0, LIMIT - 1) + '…';
}

function decodePngRgba(buf) {
  let pos = 8;
  let width = 0;
  let height = 0;
  const idats = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    pos += 4;
    const type = buf.toString('ascii', pos, pos + 4);
    pos += 4;
    const data = buf.subarray(pos, pos + len);
    pos += len + 4;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idats.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const bpp = 4;
  const stride = width * bpp;
  const rgba = Buffer.alloc(width * height * bpp);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart];
    const row = Buffer.from(raw.subarray(rowStart + 1, rowStart + 1 + stride));
    for (let i = 0; i < stride; i++) {
      const left = i >= bpp ? row[i - bpp] : 0;
      const up = prev[i];
      const upLeft = i >= bpp ? prev[i - bpp] : 0;
      let v = row[i];
      if (filter === 1) v = (v + left) & 255;
      else if (filter === 2) v = (v + up) & 255;
      else if (filter === 3) v = (v + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        const pr = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        v = (v + pr) & 255;
      }
      row[i] = v;
    }
    row.copy(rgba, y * stride);
    prev = row;
  }
  return { width, height, rgba };
}

function loadPngSprite(extensionPath, relPath) {
  if (spriteCache.has(relPath)) {
    return spriteCache.get(relPath);
  }
  const file = path.join(extensionPath, relPath);
  if (!fs.existsSync(file)) {
    return null;
  }
  const sprite = decodePngRgba(fs.readFileSync(file));
  spriteCache.set(relPath, sprite);
  return sprite;
}

function loadCharSprite(extensionPath, ch) {
  const slug = charSlug(ch);
  if (!slug) {
    return null;
  }
  return loadPngSprite(extensionPath, path.join('icons', 'labels', 'chars', slug + '.png'));
}

function loadFolderSprite(extensionPath) {
  return loadPngSprite(extensionPath, path.join('icons', 'folder.png'));
}

function blitTinted(rgba, canvasW, canvasH, originX, originY, sprite, ink) {
  for (let y = 0; y < sprite.height; y++) {
    for (let x = 0; x < sprite.width; x++) {
      const si = (y * sprite.width + x) * 4;
      const a = sprite.rgba[si + 3];
      if (a < 16) continue;
      const px = originX + x;
      const py = originY + y;
      if (px < 0 || py < 0 || px >= canvasW || py >= canvasH) continue;
      const di = (py * canvasW + px) * 4;
      const alpha = Math.round(a * ink[3] / 255);
      rgba[di] = ink[0];
      rgba[di + 1] = ink[1];
      rgba[di + 2] = ink[2];
      rgba[di + 3] = alpha;
    }
  }
  return sprite.width;
}

function textWidth(extensionPath, label) {
  let w = 0;
  let count = 0;
  for (const ch of label) {
    const sprite = loadCharSprite(extensionPath, ch);
    if (!sprite) continue;
    w += sprite.width;
    count++;
  }
  if (count > 1) w += CHAR_GAP * (count - 1);
  return w;
}

function writeEmptySkillLabel(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png(1, ICON_SIZE, Buffer.alloc(ICON_SIZE * 4)));
}

function writeSkillLabel(file, text, isGroup, extensionPath) {
  const label = fit(text);
  const folder = isGroup && extensionPath ? loadFolderSprite(extensionPath) : null;
  const folderExtra = folder ? folder.width + FOLDER_GAP : 0;
  const textW = extensionPath ? textWidth(extensionPath, label) : 0;
  let width = PAD_X * 2 + folderExtra + textW;
  if (width < PAD_X * 2) width = PAD_X * 2;
  const rgba = Buffer.alloc(width * ICON_SIZE * 4);
  let cursor = PAD_X;
  if (folder) {
    blitTinted(rgba, width, ICON_SIZE, cursor, 0, folder, INK);
    cursor += folder.width + FOLDER_GAP;
  }
  for (const ch of label) {
    const sprite = extensionPath ? loadCharSprite(extensionPath, ch) : null;
    if (!sprite) continue;
    blitTinted(rgba, width, ICON_SIZE, cursor, 0, sprite, INK);
    cursor += sprite.width + CHAR_GAP;
  }
  const finalWidth = Math.min(width, Math.max(PAD_X, cursor - CHAR_GAP + PAD_X));
  let out = rgba;
  if (finalWidth < width) {
    out = Buffer.alloc(finalWidth * ICON_SIZE * 4);
    for (let y = 0; y < ICON_SIZE; y++) {
      rgba.copy(out, y * finalWidth * 4, y * width * 4, y * width * 4 + finalWidth * 4);
    }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, png(finalWidth, ICON_SIZE, out));
}

function skillLabelPath(extensionPath, index, face) {
  const folder = face === undefined || face === null ? '' : 'f' + face;
  return path.join(extensionPath, 'icons', 'labels', folder, 'skill-' + index + '.png');
}

module.exports = { writeSkillLabel, writeEmptySkillLabel, skillLabelPath, ICON_SIZE };
