import AppKit
import CoreText
import Foundation

// Match toolbar icons (icons-download.sh → 96×96).
let canvasH: CGFloat = 96
let outDir = CommandLine.arguments[1]
let fontSize: CGFloat = 50
let font = NSFont.monospacedSystemFont(ofSize: fontSize, weight: .semibold)
let padX: CGFloat = 1.5

let attrs: [NSAttributedString.Key: Any] = [
    .font: font,
    .foregroundColor: NSColor.white
]

func render(name: String, char: String) throws {
    let astr = NSAttributedString(string: char, attributes: attrs)
    let line = CTLineCreateWithAttributedString(astr)
    var ascent: CGFloat = 0
    var descent: CGFloat = 0
    var leading: CGFloat = 0
    let advance = CGFloat(CTLineGetTypographicBounds(line, &ascent, &descent, &leading))
    let monoW = ceil(font.maximumAdvancement.width)
    let cellW = max(monoW, ceil(advance)) + padX * 2
    let cellH = canvasH
    let inkH = ascent + descent

    let w = Int(cellW)
    let h = Int(cellH)
    let bytesPerRow = w * 4
    let data = calloc(h, bytesPerRow)!
    defer { free(data) }
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue)
    guard let cg = CGContext(
        data: data,
        width: w,
        height: h,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: bitmapInfo.rawValue
    ) else {
        throw NSError(domain: "render", code: 1)
    }
    cg.clear(CGRect(x: 0, y: 0, width: cellW, height: cellH))
    let x = (cellW - advance) / 2
    let baseline = (cellH - inkH) / 2 + descent
    cg.textPosition = CGPoint(x: x, y: baseline)
    CTLineDraw(line, cg)
    guard let cgImage = cg.makeImage() else {
        throw NSError(domain: "render", code: 1)
    }
    let rep = NSBitmapImageRep(cgImage: cgImage)
    guard let png = rep.representation(using: .png, properties: [:]) else {
        throw NSError(domain: "render", code: 1)
    }
    let path = (outDir as NSString).appendingPathComponent(name + ".png")
    try png.write(to: URL(fileURLWithPath: path))
}

var items: [(String, String)] = []
for c in "abcdefghijklmnopqrstuvwxyz" { items.append((String(c), String(c))) }
for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ" { items.append((String(c), String(c))) }
for c in "0123456789" { items.append((String(c), String(c))) }
items += [("hyphen", "-"), ("slash", "/"), ("underscore", "_"), ("dot", "."), ("ellipsis", "…")]

for (name, ch) in items {
    try render(name: name, char: ch)
}
print(items.count)
