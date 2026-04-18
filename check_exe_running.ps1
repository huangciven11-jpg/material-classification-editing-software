$exePath = Join-Path $PSScriptRoot 'release\win-unpacked\素材分类剪辑软件.exe'
$p = Start-Process -FilePath $exePath -PassThru
Start-Sleep -Seconds 4
if (-not $p.HasExited) {
  Write-Output ("RUNNING:" + $p.Id)
} else {
  Write-Output ("EXITED:" + $p.ExitCode)
}
