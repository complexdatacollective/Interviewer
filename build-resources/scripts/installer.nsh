 !macro customInstall
   !system "echo '' > ${BUILD_RESOURCES_DIR}/customInstall"
   ExecWait 'msiexec /i "${BUILD_RESOURCES_DIR}/externals/Bonjour64.msi"'
 !macroend
