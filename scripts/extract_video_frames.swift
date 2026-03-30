import Foundation
import AVFoundation
import AppKit

func saveJPEG(_ image: CGImage, to url: URL) throws {
    let bitmap = NSBitmapImageRep(cgImage: image)
    guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.85]) else {
        throw NSError(domain: "extract_video_frames", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to encode JPEG"])
    }
    try data.write(to: url)
}

let args = CommandLine.arguments
guard args.count >= 4 else {
    fputs("Usage: extract_video_frames <input.mov> <output-dir> <frame-count>\n", stderr)
    exit(1)
}

let inputURL = URL(fileURLWithPath: args[1])
let outputDir = URL(fileURLWithPath: args[2], isDirectory: true)
let frameCount = max(Int(args[3]) ?? 6, 1)

try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

let asset = AVURLAsset(url: inputURL)
let durationSeconds = CMTimeGetSeconds(asset.duration)
guard durationSeconds.isFinite, durationSeconds > 0 else {
    fputs("Could not determine video duration.\n", stderr)
    exit(1)
}

let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: 1280, height: 1280)
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero

for index in 0..<frameCount {
    let fraction = frameCount == 1 ? 0.0 : Double(index) / Double(frameCount - 1)
    let seconds = durationSeconds * fraction
    let time = CMTime(seconds: seconds, preferredTimescale: 600)
    let image = try generator.copyCGImage(at: time, actualTime: nil)
    let outputURL = outputDir.appendingPathComponent(String(format: "frame-%02d.jpg", index + 1))
    try saveJPEG(image, to: outputURL)
    print("\(outputURL.path)")
}
