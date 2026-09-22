'use strict';

// docs/touchbar-showcase.png — run: node scripts/render-touchbar-showcase.js

const fs = require('fs');
const path = require('path');
const { ICONS } = require('../catalog');
const { writeSkillLabel, decodePngRgba, png, loadPngSprite } = require('../labels');

const root = path.join(__dirname, '..');
const outFile = path.join(root, 'docs', 'touchbar-showcase.png');
const labelDir = path.join(root, 'docs', '.showcase-labels');

const S = 3;
const BG = [0, 0, 0, 0];
const PANEL = [22, 22, 22, 255];
const CLUSTER = [44, 44, 46, 255];
const BORDER = [128, 128, 128, 90];

const BTN = 44 * S;
const BTN_H = 36 * S;
const ICON = 20 * S;
const SKILL_H = 22 * S;
const SKILL_PAD_X = 10 * S;
const GROUP_GAP = 10 * S;
const BLOCK_GAP = GROUP_GAP;
const TOUCH_PAD_X = 12 * S;
const TOUCH_PAD_Y = 10 * S;
const PANEL_RADIUS = 12 * S;
const CLUSTER_RADIUS = 8 * S;
const MARGIN = 18 * S;
const AA = 1.25;
const COLS = 2;

const skillCache = new Map();

function fill(rgba, w, h, color) {
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    rgba[o] = color[0];
    rgba[o + 1] = color[1];
    rgba[o + 2] = color[2];
    rgba[o + 3] = color[3];
  }
}

function sdfRoundedRect(px, py, x, y, rw, rh, r) {
  r = Math.min(r, rw / 2, rh / 2);
  const qx = Math.abs(px - (x + rw / 2)) - (rw / 2 - r);
  const qy = Math.abs(py - (y + rh / 2)) - (rh / 2 - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function blendPixel(rgba, w, px, py, color, alpha) {
  if (alpha <= 0) return;
  const i = (py * w + px) * 4;
  const srcA = alpha * color[3] / 255;
  const dstA = rgba[i + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  rgba[i] = Math.round((color[0] * srcA + rgba[i] * dstA * (1 - srcA)) / outA);
  rgba[i + 1] = Math.round((color[1] * srcA + rgba[i + 1] * dstA * (1 - srcA)) / outA);
  rgba[i + 2] = Math.round((color[2] * srcA + rgba[i + 2] * dstA * (1 - srcA)) / outA);
  rgba[i + 3] = Math.round(outA * 255);
}

function roundRect(rgba, cw, ch, x, y, rw, rh, r, color) {
  const x0 = Math.floor(x - AA);
  const y0 = Math.floor(y - AA);
  const x1 = Math.ceil(x + rw + AA);
  const y1 = Math.ceil(y + rh + AA);
  for (let py = y0; py < y1; py++) {
    if (py < 0 || py >= ch) continue;
    for (let px = x0; px < x1; px++) {
      if (px < 0 || px >= cw) continue;
      const d = sdfRoundedRect(px + 0.5, py + 0.5, x, y, rw, rh, r);
      const alpha = d <= 0 ? 1 : d >= AA ? 0 : 1 - d / AA;
      blendPixel(rgba, cw, px, py, color, alpha);
    }
  }
}

function roundRectStroke(rgba, cw, ch, x, y, rw, rh, r, color, stroke) {
  const x0 = Math.floor(x - AA - stroke);
  const y0 = Math.floor(y - AA - stroke);
  const x1 = Math.ceil(x + rw + AA + stroke);
  const y1 = Math.ceil(y + rh + AA + stroke);
  for (let py = y0; py < y1; py++) {
    if (py < 0 || py >= ch) continue;
    for (let px = x0; px < x1; px++) {
      if (px < 0 || px >= cw) continue;
      const d = sdfRoundedRect(px + 0.5, py + 0.5, x, y, rw, rh, r);
      if (d < 0 || d > stroke) continue;
      const alpha = d <= 0 ? 1 : 1 - d / stroke;
      blendPixel(rgba, cw, px, py, color, alpha);
    }
  }
}

function sampleSprite(sprite, fx, fy) {
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = fx - x0;
  const ty = fy - y0;
  const x1 = Math.min(sprite.width - 1, x0 + 1);
  const y1 = Math.min(sprite.height - 1, y0 + 1);
  const out = [0, 0, 0, 0];
  for (const [sx, sy, w] of [[x0, y0, (1 - tx) * (1 - ty)], [x1, y0, tx * (1 - ty)], [x0, y1, (1 - tx) * ty], [x1, y1, tx * ty]]) {
    const si = (sy * sprite.width + sx) * 4;
    for (let c = 0; c < 4; c++) {
      out[c] += sprite.rgba[si + c] * w;
    }
  }
  return out;
}

function blit(rgba, cw, ch, dx, dy, sprite, scale) {
  const sw = sprite.width * scale;
  const sh = sprite.height * scale;
  const x0 = Math.floor(dx);
  const y0 = Math.floor(dy);
  const x1 = Math.ceil(dx + sw);
  const y1 = Math.ceil(dy + sh);
  for (let py = y0; py < y1; py++) {
    if (py < 0 || py >= ch) continue;
    for (let px = x0; px < x1; px++) {
      if (px < 0 || px >= cw) continue;
      const fx = (px - dx + 0.5) / scale - 0.5 / scale;
      const fy = (py - dy + 0.5) / scale - 0.5 / scale;
      if (fx < 0 || fy < 0 || fx > sprite.width - 1 || fy > sprite.height - 1) continue;
      const s = sampleSprite(sprite, fx, fy);
      if (s[3] < 4) continue;
      blendPixel(rgba, cw, px, py, [s[0], s[1], s[2], s[3]], 1);
    }
  }
}

function iconSprite(id) {
  const meta = ICONS[id];
  if (!meta) return null;
  return loadPngSprite(root, meta.file);
}

function skillSprite(text, isGroup) {
  const key = (isGroup ? 'g:' : 's:') + text;
  if (skillCache.has(key)) return skillCache.get(key);
  const file = path.join(labelDir, key.replace(/[^\w:./-]+/g, '_') + '.png');
  writeSkillLabel(file, text, isGroup, root);
  const sprite = decodePngRgba(fs.readFileSync(file));
  skillCache.set(key, sprite);
  return sprite;
}

function skillBoxWidth(text, isGroup) {
  const sprite = skillSprite(text, isGroup);
  const scale = SKILL_H / sprite.height;
  return SKILL_PAD_X * 2 + Math.ceil(sprite.width * scale);
}

function gapBefore(segments, index) {
  if (index <= 0) return 0;
  if (segments[index].kind === 'spacer' || segments[index - 1].kind === 'spacer') return 0;
  return GROUP_GAP;
}

function segmentWidth(seg, index, segments) {
  if (seg.kind === 'spacer') return GROUP_GAP;
  const body = seg.kind === 'cluster' ? seg.items.length * BTN : skillBoxWidth(seg.text, seg.isGroup);
  return gapBefore(segments, index) + body;
}

function contentWidth(segments) {
  return segments.reduce((sum, seg, i) => sum + segmentWidth(seg, i, segments), 0);
}

function panelSize(segments) {
  return {
    w: contentWidth(segments) + TOUCH_PAD_X * 2,
    h: BTN_H + TOUCH_PAD_Y * 2
  };
}

function drawCluster(rgba, cw, ch, x, y, items) {
  const cwSeg = items.length * BTN;
  roundRect(rgba, cw, ch, x, y, cwSeg, BTN_H, CLUSTER_RADIUS, CLUSTER);
  let bx = x;
  for (const item of items) {
    if (item.kind === 'icon') {
      const sprite = iconSprite(item.id);
      if (sprite) {
        const scale = ICON / sprite.width;
        const sw = sprite.width * scale;
        const sh = sprite.height * scale;
        blit(rgba, cw, ch, bx + (BTN - sw) / 2, y + (BTN_H - sh) / 2, sprite, scale);
      }
    }
    bx += BTN;
  }
  return cwSeg;
}

function drawSkillBox(rgba, cw, ch, x, y, text, isGroup) {
  const w = skillBoxWidth(text, isGroup);
  roundRect(rgba, cw, ch, x, y, w, BTN_H, CLUSTER_RADIUS, CLUSTER);
  const sprite = skillSprite(text, isGroup);
  const scale = SKILL_H / sprite.height;
  const sw = sprite.width * scale;
  blit(rgba, cw, ch, x + (w - sw) / 2, y + (BTN_H - SKILL_H) / 2, sprite, scale);
  return w;
}

function drawTouchRow(rgba, cw, ch, ox, oy, segments) {
  let x = ox;
  const y = oy;
  segments.forEach((seg, index) => {
    x += gapBefore(segments, index);
    if (seg.kind === 'spacer') {
      x += GROUP_GAP;
      return;
    }
    if (seg.kind === 'cluster') {
      x += drawCluster(rgba, cw, ch, x, y, seg.items);
    } else if (seg.kind === 'skill') {
      x += drawSkillBox(rgba, cw, ch, x, y, seg.text, seg.isGroup);
    }
  });
}

function drawBlock(rgba, cw, ch, bx, by, pw, ph, segments) {
  roundRect(rgba, cw, ch, bx, by, pw, ph, PANEL_RADIUS, PANEL);
  roundRectStroke(rgba, cw, ch, bx, by, pw, ph, PANEL_RADIUS, BORDER, 1);
  const ox = bx + TOUCH_PAD_X;
  const oy = by + TOUCH_PAD_Y;
  drawTouchRow(rgba, cw, ch, ox, oy, segments);
}

const blocks = [
  {
    segments: [
      { kind: 'cluster', items: [{ kind: 'icon', id: 'panel-left' }, { kind: 'icon', id: 'panel-bottom' }, { kind: 'icon', id: 'panel-right' }] },
      { kind: 'spacer' },
      { kind: 'cluster', items: [{ kind: 'icon', id: 'message-square-plus' }, { kind: 'icon', id: 'mic' }] },
      { kind: 'spacer' },
      { kind: 'cluster', items: [{ kind: 'icon', id: 'layers' }, { kind: 'icon', id: 'folder' }] }
    ]
  },
  {
    segments: [
      { kind: 'cluster', items: [{ kind: 'icon', id: 'chevron-left' }] },
      { kind: 'spacer' },
      { kind: 'cluster', items: [{ kind: 'icon', id: 'message-circle' }, { kind: 'icon', id: 'list-checks' }, { kind: 'icon', id: 'bot' }] }
    ]
  },
  {
    segments: [
      { kind: 'cluster', items: [{ kind: 'icon', id: 'chevron-left' }] },
      { kind: 'spacer' },
      { kind: 'cluster', items: [{ kind: 'icon', id: 'panel-left' }, { kind: 'icon', id: 'panel-bottom' }, { kind: 'icon', id: 'panel-right' }, { kind: 'icon', id: 'terminal' }] }
    ]
  },
  {
    segments: [
      { kind: 'cluster', items: [{ kind: 'icon', id: 'chevron-left' }] },
      { kind: 'spacer' },
      { kind: 'cluster', items: [{ kind: 'icon', id: 'zap' }, { kind: 'icon', id: 'circle-check' }, { kind: 'icon', id: 'circle-x' }] }
    ]
  },
  {
    segments: [
      { kind: 'cluster', items: [{ kind: 'icon', id: 'chevron-left' }] },
      { kind: 'spacer' },
      { kind: 'skill', text: 'Review', isGroup: true },
      { kind: 'skill', text: 'Workflow', isGroup: true },
      { kind: 'skill', text: 'Customize', isGroup: true },
      { kind: 'skill', text: 'Build', isGroup: true }
    ]
  },
  {
    segments: [
      { kind: 'cluster', items: [{ kind: 'icon', id: 'chevron-left' }] },
      { kind: 'spacer' },
      { kind: 'skill', text: '/review', isGroup: false },
      { kind: 'skill', text: '/review-bugbot', isGroup: false },
      { kind: 'skill', text: '/review-security', isGroup: false },
      { kind: 'skill', text: '/cursor-blame', isGroup: false }
    ]
  }
];

fs.mkdirSync(labelDir, { recursive: true });

const sizes = blocks.map((b) => panelSize(b.segments));
const cellH = sizes[0].h;
const rowCount = Math.ceil(blocks.length / COLS);
const rowWidths = [];
for (let row = 0; row < rowCount; row++) {
  const left = row * COLS;
  const pair = blocks.slice(left, left + COLS);
  let w = 0;
  pair.forEach((_, i) => {
    if (i > 0) w += BLOCK_GAP;
    w += sizes[left + i].w;
  });
  rowWidths.push(w);
}
const canvasW = Math.max(...rowWidths) + MARGIN * 2;
const canvasH = MARGIN * 2 + rowCount * cellH + (rowCount - 1) * BLOCK_GAP;
const rgba = Buffer.alloc(canvasW * canvasH * 4);
fill(rgba, canvasW, canvasH, BG);

for (let row = 0; row < rowCount; row++) {
  const left = row * COLS;
  const pair = blocks.slice(left, left + COLS);
  const rowW = rowWidths[row];
  let x = MARGIN + Math.round((canvasW - MARGIN * 2 - rowW) / 2);
  const y = MARGIN + row * (cellH + BLOCK_GAP);
  pair.forEach((block, i) => {
    const index = left + i;
    if (i > 0) x += BLOCK_GAP;
    drawBlock(rgba, canvasW, canvasH, x, y, sizes[index].w, cellH, block.segments);
    x += sizes[index].w;
  });
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, png(canvasW, canvasH, rgba));
console.log('Wrote ' + outFile + ' (' + canvasW + '×' + canvasH + ')');
