!macro customInstall
  MessageBox MB_YESNO "This app uses Apple Bonjour to allow network discovery. Would you like to install it now?" /SD IDYES true IDNO
  true:
    ExecWait 'msiexec /i "resources\build-resources\externals\Bonjour64.msi" /quiet /passive'
!macroend

