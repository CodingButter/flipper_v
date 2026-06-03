# Flipper V — install the Flipper auto-attach scheduled task
#
# Registers a Windows scheduled task that runs flipper-auto-attach.ps1 at
# every user logon, so the Flipper Zero is automatically attached to WSL
# without any manual `usbipd attach` step. Runs at the current user's
# Limited level — no admin needed for *this* script, but you must have
# run `usbipd bind --busid X-Y` once from an admin shell beforehand.
#
# Run from any PowerShell:
#   .\scripts\install-flipper-auto-attach.ps1
#
# Uninstall:
#   Unregister-ScheduledTask -TaskName 'FlipperV-AutoAttach' -Confirm:$false

$ErrorActionPreference = 'Stop'

$taskName = 'FlipperV-AutoAttach'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$attachScript = Join-Path $scriptDir 'flipper-auto-attach.ps1'

if (-not (Test-Path $attachScript)) {
    Write-Error "flipper-auto-attach.ps1 not found next to this installer ($attachScript)"
    exit 1
}

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$attachScript`""

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# ExecutionTimeLimit = 0 → never time out (the auto-attach process is
# long-lived). RestartCount handles transient usbipd-list failures.
$settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
    -TaskName $taskName `
    -Description 'Flipper V — auto-attach the Flipper Zero to WSL on every logon' `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -RunLevel Limited `
    -Force | Out-Null

Write-Host ""
Write-Host "Installed scheduled task '$taskName'." -ForegroundColor Green
Write-Host "It will run at every logon and keep the Flipper attached to WSL."
Write-Host ""
Write-Host "Start it now without logging out:"
Write-Host "  Start-ScheduledTask -TaskName '$taskName'"
Write-Host ""
Write-Host "Check status:"
Write-Host "  Get-ScheduledTask -TaskName '$taskName' | Get-ScheduledTaskInfo"
Write-Host ""
Write-Host "Remove:"
Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false"
