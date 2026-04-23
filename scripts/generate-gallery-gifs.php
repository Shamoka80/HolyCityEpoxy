<?php

declare(strict_types=1);

const SOURCE_DIR = __DIR__ . '/../assets/images/gallery';
const OUTPUT_DIR = __DIR__ . '/../assets/images/generated';
const MAX_WIDTH = 960;
const FRAME_DELAY_CS = 120; // 1.2s per frame (2.4s loop)

if (!extension_loaded('gd')) {
    fwrite(STDERR, "GD extension is required.\n");
    exit(1);
}

if (!is_dir(OUTPUT_DIR) && !mkdir(OUTPUT_DIR, 0775, true) && !is_dir(OUTPUT_DIR)) {
    fwrite(STDERR, "Unable to create output directory.\n");
    exit(1);
}

$beforeFiles = glob(SOURCE_DIR . '/*_before.*') ?: [];
$generatedCount = 0;

foreach ($beforeFiles as $beforePath) {
    $pathInfo = pathinfo($beforePath);
    $stem = preg_replace('/_before$/', '', $pathInfo['filename']);
    if (!$stem) {
        continue;
    }

    $afterCandidates = glob(SOURCE_DIR . '/' . $stem . '_after.*') ?: [];
    if (count($afterCandidates) === 0) {
        fwrite(STDERR, "Skipping {$stem}: missing *_after pair.\n");
        continue;
    }

    $afterPath = $afterCandidates[0];
    $beforeImage = loadImage($beforePath);
    $afterImage = loadImage($afterPath);
    if ($beforeImage === null || $afterImage === null) {
        fwrite(STDERR, "Skipping {$stem}: unsupported image pair.\n");
        continue;
    }

    [$targetWidth, $targetHeight] = resolveTargetSize($beforeImage, $afterImage);
    $beforeFrame = normalizeFrame($beforeImage, $targetWidth, $targetHeight);
    $afterFrame = normalizeFrame($afterImage, $targetWidth, $targetHeight);

    $gifBinary = buildAnimatedGif([$beforeFrame, $afterFrame], [FRAME_DELAY_CS, FRAME_DELAY_CS]);
    file_put_contents(OUTPUT_DIR . '/' . $stem . '.gif', $gifBinary);

    imagedestroy($beforeImage);
    imagedestroy($afterImage);
    imagedestroy($beforeFrame);
    imagedestroy($afterFrame);

    $generatedCount++;
    echo "Generated: {$stem}.gif\n";
}

echo "Total GIFs generated: {$generatedCount}\n";

function loadImage(string $path): ?GdImage
{
    $type = exif_imagetype($path);
    return match ($type) {
        IMAGETYPE_PNG => @imagecreatefrompng($path) ?: null,
        IMAGETYPE_JPEG => @imagecreatefromjpeg($path) ?: null,
        default => null,
    };
}

function resolveTargetSize(GdImage $before, GdImage $after): array
{
    $width = min(imagesx($before), imagesx($after), MAX_WIDTH);
    $height = (int) round($width * 3 / 4);
    return [$width, $height];
}

function normalizeFrame(GdImage $image, int $targetWidth, int $targetHeight): GdImage
{
    $sourceWidth = imagesx($image);
    $sourceHeight = imagesy($image);

    $targetRatio = $targetWidth / $targetHeight;
    $sourceRatio = $sourceWidth / $sourceHeight;

    if ($sourceRatio > $targetRatio) {
        $cropHeight = $sourceHeight;
        $cropWidth = (int) round($sourceHeight * $targetRatio);
        $srcX = (int) floor(($sourceWidth - $cropWidth) / 2);
        $srcY = 0;
    } else {
        $cropWidth = $sourceWidth;
        $cropHeight = (int) round($sourceWidth / $targetRatio);
        $srcX = 0;
        $srcY = (int) floor(($sourceHeight - $cropHeight) / 2);
    }

    $frame = imagecreatetruecolor($targetWidth, $targetHeight);
    imagealphablending($frame, true);
    imagesavealpha($frame, true);
    imagecopyresampled(
        $frame,
        $image,
        0,
        0,
        $srcX,
        $srcY,
        $targetWidth,
        $targetHeight,
        $cropWidth,
        $cropHeight
    );

    return $frame;
}

function buildAnimatedGif(array $frames, array $delays): string
{
    $gifData = "GIF89a";

    $frameData = [];
    foreach ($frames as $frame) {
        ob_start();
        imagegif($frame);
        $frameData[] = ob_get_clean();
    }

    $gifData .= substr($frameData[0], 6, 7);
    $gifData .= "\x21\xFF\x0BNETSCAPE2.0\x03\x01\x00\x00\x00";

    foreach ($frameData as $index => $binary) {
        $delay = pack('v', $delays[$index]);
        $gifData .= "\x21\xF9\x04\x04{$delay}\x00\x00";
        $gifData .= substr($binary, 13, -1);
    }

    return $gifData . ';';
}
