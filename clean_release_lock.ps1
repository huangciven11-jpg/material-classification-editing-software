Get-Process | Where-Object {
  $_.ProcessName -like 'electron*' -or $_.Path -like '*素材分类剪辑软件.exe'
} | ForEach-Object {
  Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2
