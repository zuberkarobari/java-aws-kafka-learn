$results = @()
$files = Get-ChildItem -Recurse -Filter '*.html' 'topics' -ErrorAction SilentlyContinue
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $c) { continue }
    $t = 'A-Standalone'
    if ($c -match 'cdn\.tailwindcss') { $t = 'C-Tailwind' }
    elseif ($c -match 'id="topic-content"') { $t = 'B-Wrapped' }
    $rel = $f.FullName.Replace((Get-Location).Path + '\topics\', '')
    $results += [PSCustomObject]@{Type=$t; File=$rel}
}
Write-Host "=== PAGE TYPE SUMMARY ==="
$results | Group-Object Type | ForEach-Object { Write-Host "$($_.Name): $($_.Count)" }
Write-Host ""
Write-Host "=== CLASS A PAGES (No framework) ==="
$results | Where-Object { $_.Type -eq 'A-Standalone' } | ForEach-Object { Write-Host "  $($_.File)" }
Write-Host ""
Write-Host "=== CLASS C TAILWIND PAGES ==="
$results | Where-Object { $_.Type -eq 'C-Tailwind' } | ForEach-Object { Write-Host "  $($_.File)" }
