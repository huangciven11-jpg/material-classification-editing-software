$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$promptPath = Join-Path $projectRoot 'CLAUDE_RESUME_PROMPT.md'
$prompt = Get-Content -Raw $promptPath

Set-Location $projectRoot
& claude --dangerously-skip-permissions --add-dir $projectRoot -- $prompt
