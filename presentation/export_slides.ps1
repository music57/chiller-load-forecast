$pptxPath = (Resolve-Path "Chiller_Forecast_Interview.pptx").Path
$outDir = Join-Path (Get-Location) "slides_png"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$pp = New-Object -ComObject PowerPoint.Application
try {
  $prez = $pp.Presentations.Open($pptxPath, $true, $false, $false)
  for ($i = 1; $i -le $prez.Slides.Count; $i++) {
    $slide = $prez.Slides.Item($i)
    $name = "slide-{0:D2}.png" -f $i
    $outPath = Join-Path $outDir $name
    $slide.Export($outPath, "PNG", 1600, 900)
    "Wrote $outPath"
  }
  $prez.Close()
}
finally {
  $pp.Quit()
}
