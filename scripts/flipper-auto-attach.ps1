# Flipper V — Flipper auto-attach watcher
#
# Finds a Flipper Zero (VID:PID 0483:5740) in `usbipd list` and starts
# `usbipd attach --wsl --auto-attach` against it. The auto-attach flag
# keeps the device attached across replugs and WSL restarts; the process
# exits only when killed or the device is unbound.
#
# Prerequisites — run once from an *admin* PowerShell:
#   winget install --exact dorssel.usbipd-win   # if not installed yet
#   usbipd bind --busid <X-Y>                   # one-time per device
#
# Then this script is what install-flipper-auto-attach.ps1 wires into a
# scheduled task. You can also run it interactively for debugging.

$ErrorActionPreference = 'Stop'
$VID = '0483'
$PID_ = '5740'

function Find-FlipperBusId {
    $out = & usbipd list 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "usbipd not found on PATH. Install with: winget install dorssel.usbipd-win"
        exit 1
    }
    foreach ($line in $out) {
        # `usbipd list` rows look like: "2-3    0483:5740  STMicroelectronics ..."
        if ($line -match "^\s*(\d+-\d+)\s+${VID}:${PID_}") {
            return $matches[1]
        }
    }
    return $null
}

# Wait up to ~60s for the Flipper to show up — usbipd often races with
# the user plugging the device in or with the system enumerating after a
# cold boot.
$busid = $null
for ($i = 0; $i -lt 30; $i++) {
    $busid = Find-FlipperBusId
    if ($busid) { break }
    Start-Sleep -Seconds 2
}

if (-not $busid) {
    Write-Warning "No Flipper Zero (${VID}:${PID_}) found in usbipd list after 60s."
    Write-Warning "Plug in the device and re-run, or check the FlipperV-AutoAttach task in Task Scheduler."
    exit 1
}

Write-Host "Attaching Flipper at busid $busid to WSL..."
# `--auto-attach` blocks and re-attaches on every replug. Bind must
# already have been run with admin rights (see header).
& usbipd attach --wsl --auto-attach --busid $busid
