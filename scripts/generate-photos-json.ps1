param(
    [string]$PicturesDir = "content/pictures",
    [string]$OutputFile = "content/photos.json"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$absPictures = Join-Path $root $PicturesDir
$absOutput = Join-Path $root $OutputFile

if (-not (Test-Path -LiteralPath $absPictures)) {
    throw "Pictures directory not found: $absPictures"
}

$allowed = @('.jpg', '.jpeg', '.png', '.webp', '.gif')

$items = Get-ChildItem -LiteralPath $absPictures -Recurse -File |
    Where-Object { $allowed -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object LastWriteTimeUtc, Name -Descending |
    ForEach-Object {
        $relative = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
        $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        $alt = ($name -replace '[_-]+', ' ').Trim()

        [PSCustomObject]@{
            src = $relative
            alt = if ($alt) { "Stingmen - $alt" } else { "Stingmen Foto" }
            modified = $_.LastWriteTimeUtc.ToString('o')
        }
    }

$dir = Split-Path -Parent $absOutput
if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

$json = $items | ConvertTo-Json -Depth 4
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($absOutput, $json, $utf8NoBom)
Write-Host "Wrote $($items.Count) photo entries to $OutputFile"
