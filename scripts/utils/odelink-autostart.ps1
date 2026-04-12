$root = Resolve-Path (Join-Path $PSScriptRoot '..')

Start-Process -FilePath "npm.cmd" -ArgumentList @("run", "dev") -WorkingDirectory $root -WindowStyle Hidden
