'use strict';

const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'icons', 'labels', 'chars');
const swift = path.join(__dirname, 'render-char.swift');

const out = execFileSync('swift', [swift, outDir], { encoding: 'utf8' }).trim();
console.log('Wrote ' + out + ' char icons to icons/labels/chars/');
