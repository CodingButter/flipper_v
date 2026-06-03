# Developer scripts

These are **maintainer / contributor convenience scripts** — end users of
Flipper V don't need them. Right now there's just one tool: an auto-attach
setup for developing in WSL2 against a real Flipper plugged into Windows.

## Auto-attach the Flipper to WSL2

USB devices plugged into Windows aren't visible from WSL2 by default. To
test the WebSerial connect path while developing inside WSL, you share
the device with [`usbipd-win`](https://github.com/dorssel/usbipd-win) and
have it auto-re-attach across replugs / logons.

### One-time setup

**Step 1 — install usbipd-win.** Open Windows Terminal as **Administrator**
(right-click Start → *Terminal (Admin)*), then:

```powershell
winget install --exact dorssel.usbipd-win
wsl --shutdown
```

After WSL restarts (just reopen your WSL shell), plug the Flipper in.

**Step 2 — bind the device.** Still in the **admin** terminal:

```powershell
usbipd list
# Find the row with 0483:5740 — note the BUSID (e.g. "2-3")

usbipd bind --busid 2-3   # admin required; one time per device
```

**Step 3 — install the scheduled task.** Admin not required for this step
(but harmless from an admin shell). From any PowerShell:

```powershell
cd \\wsl.localhost\Ubuntu\home\codingbutter\development\flipper_zero_mirror
powershell -ExecutionPolicy Bypass -File .\scripts\install-flipper-auto-attach.ps1
```

`-ExecutionPolicy Bypass` lets the script run without you having to
change the system-wide policy. You can also kick the task off without
logging out:

```powershell
Start-ScheduledTask -TaskName 'FlipperV-AutoAttach'
```

### What it does

`install-flipper-auto-attach.ps1` registers a Windows Scheduled Task
called **`FlipperV-AutoAttach`** that runs `flipper-auto-attach.ps1`
at every logon. That inner script calls
`usbipd attach --wsl --auto-attach --busid <X-Y>`, which:

- attaches the Flipper to the running WSL distro,
- watches and re-attaches on every replug,
- survives WSL shutdown / restart cycles.

Net result: as long as the Flipper is plugged into your Windows host,
WSL sees `/dev/ttyACM*` (also aliased to `/dev/flipper*` by the udev
rule), and Flipper V's Connect button works.

### Verify

In WSL:

```bash
lsusb | grep -i flipper
ls -l /dev/ttyACM* /dev/flipper*
```

In Windows:

```powershell
Get-ScheduledTask -TaskName 'FlipperV-AutoAttach' | Get-ScheduledTaskInfo
```

### Uninstall

```powershell
Unregister-ScheduledTask -TaskName 'FlipperV-AutoAttach' -Confirm:$false
usbipd unbind --busid 2-3  # admin required
```

### Troubleshooting

- **`usbipd list` doesn't show the Flipper** — swap the USB cable. A lot
  of cables are charge-only and the device won't enumerate.
- **`bun run dev` opens the picker but it's empty** — the auto-attach
  task isn't running. Check it with `Get-ScheduledTask`. If it's "Ready"
  but not running, kick it off with `Start-ScheduledTask`.
- **Policy blocks the install script** — make sure you used
  `-ExecutionPolicy Bypass -File ...`. Don't `Set-ExecutionPolicy
  Unrestricted` globally; the per-invocation bypass is safer.
