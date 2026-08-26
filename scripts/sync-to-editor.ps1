# Copy widget files into Chestnut Editor public/ so the vault plugin can load them.
$ErrorActionPreference = "Stop"
$src = Split-Path -Parent $PSScriptRoot
$dst = Join-Path (Split-Path -Parent $src) "boke\apps\desktop\public\chestnut-cat"
if (-not (Test-Path (Join-Path (Split-Path -Parent $src) "boke"))) {
  Write-Error "Expected sibling repo C:\projects\boke"
}
New-Item -ItemType Directory -Force -Path (Join-Path $dst "expr") | Out-Null
Copy-Item (Join-Path $src "web\widget.js") (Join-Path $dst "widget.js") -Force
Copy-Item (Join-Path $src "web\widget.css") (Join-Path $dst "widget.css") -Force
Copy-Item (Join-Path $src "assets\Ya1.mp3") (Join-Path $dst "Ya1.mp3") -Force
Copy-Item (Join-Path $src "assets\Ya2.mp3") (Join-Path $dst "Ya2.mp3") -Force
Copy-Item (Join-Path $src "assets\expr\*.png") (Join-Path $dst "expr") -Force
$example = Join-Path (Split-Path -Parent $src) "boke\examples\plugins\chestnut-cat"
New-Item -ItemType Directory -Force -Path $example | Out-Null
Copy-Item (Join-Path $src "plugin\manifest.json") (Join-Path $example "manifest.json") -Force
Copy-Item (Join-Path $src "plugin\main.js") (Join-Path $example "main.js") -Force
Write-Host "Synced Chestnut Cat plugin assets to $dst"
