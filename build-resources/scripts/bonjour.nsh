!macro customInstall
  FindProcDLL::FindProc "mDNSResponder.exe"
  IntCmp $R0 1 0 notRunning
      MessageBox MB_OK|MB_ICONEXCLAMATION "Bonjour running" /SD IDOK
      Abort
  notRunning:
      MessageBox MB_OK|MB_ICONEXCLAMATION "This app uses Apple Bonjour to allow network discovery, but it doesn't seem to be installed on your system. Click OK to install it." /SD IDOK
      ExecWait 'msiexec /i "resources\build-resources\externals\Bonjour64.msi" /quiet /passive'
!macroend

