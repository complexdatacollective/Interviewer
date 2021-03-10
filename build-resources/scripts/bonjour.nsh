!macro customInstall
  IfFileExists $PROGRAMFILES\Bonjour\mDNSResponder.exe bonjour noBonjour
    noBonjour:  
      MessageBox MB_YESNO "This app requires Bonjour to be installed to enable automatic server discovery. Would you like to install it now?" IDYES true
        goto end
      true: 
        ExecWait 'msiexec /i "resources\build-resources\externals\Bonjour64.msi" /quiet /passive'
        goto end
    bonjour:
      goto end
  end:
!macroend

