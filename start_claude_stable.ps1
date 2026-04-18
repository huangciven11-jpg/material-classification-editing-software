$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$launchScript = Join-Path $projectRoot 'launch_claude_with_prompt.ps1'

Start-Process -FilePath 'C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe' `
  -WorkingDirectory $projectRoot `
  -ArgumentList '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $launchScript
