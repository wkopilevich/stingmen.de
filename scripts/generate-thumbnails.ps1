param(
    [string]$PicturesDir = "content/pictures",
    [string]$ThumbsDir = "content/pictures/thumbs",
    [string]$WebDir = "content/pictures/web",
    [int]$ThumbMaxWidth = 640,
    [int]$WebMaxWidth = 2000,
    [int]$Quality = 82,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$absPictures = Join-Path $root $PicturesDir

if (-not (Test-Path -LiteralPath $absPictures)) {
    throw "Pictures directory not found: $absPictures"
}

$variants = @(
    [PSCustomObject]@{ Name = 'thumbs'; Path = (Join-Path $root $ThumbsDir); MaxWidth = $ThumbMaxWidth; Created = 0; Skipped = 0 },
    [PSCustomObject]@{ Name = 'web'; Path = (Join-Path $root $WebDir); MaxWidth = $WebMaxWidth; Created = 0; Skipped = 0 }
)

foreach ($variant in $variants) {
    if (-not (Test-Path -LiteralPath $variant.Path)) {
        New-Item -ItemType Directory -Path $variant.Path -Force | Out-Null
    }
}

$allowed = @('.jpg', '.jpeg', '.png', '.webp', '.gif')
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)

$sources = Get-ChildItem -LiteralPath $absPictures -File |
    Where-Object { $allowed -contains $_.Extension.ToLowerInvariant() }

foreach ($file in $sources) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    $pending = @()
    foreach ($variant in $variants) {
        $target = Join-Path $variant.Path "$baseName.jpg"
        if ((Test-Path -LiteralPath $target) -and -not $Force -and
            (Get-Item -LiteralPath $target).LastWriteTimeUtc -ge $file.LastWriteTimeUtc) {
            $variant.Skipped++
            continue
        }
        $pending += [PSCustomObject]@{ Variant = $variant; Target = $target }
    }

    if ($pending.Count -eq 0) {
        continue
    }

    $source = [System.Drawing.Image]::FromFile($file.FullName)
    try {
        foreach ($job in $pending) {
            $ratio = [Math]::Min(1.0, $job.Variant.MaxWidth / [double]$source.Width)
            $width = [int][Math]::Round($source.Width * $ratio)
            $height = [int][Math]::Round($source.Height * $ratio)

            $bitmap = New-Object System.Drawing.Bitmap($width, $height)
            try {
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
                try {
                    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                    $graphics.DrawImage($source, 0, 0, $width, $height)
                }
                finally { $graphics.Dispose() }

                $bitmap.Save($job.Target, $jpegCodec, $encoderParams)
                $job.Variant.Created++
            }
            finally { $bitmap.Dispose() }
        }
    }
    finally { $source.Dispose() }
}

$encoderParams.Dispose()

foreach ($variant in $variants) {
    Write-Host "$($variant.Name): $($variant.Created) created/updated, $($variant.Skipped) up to date (max width $($variant.MaxWidth)px)"
}
