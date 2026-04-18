$env:ELECTRON_ENABLE_LOGGING='1'
$env:ELECTRON_ENABLE_STACK_DUMPING='1'
Set-Location $PSScriptRoot
npx electron .
