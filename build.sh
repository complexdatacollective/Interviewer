!#/bin/bash

# zip app
cd app
zip -r -q ../${PWD##*/}.nw *
cd ..

# get specific OSX version of node webkit
if [ -d build/platform/node-webkit-v0.11.6-osx-x64/ ]; then
  if [ ! -d build/platform/node-webkit-v0.11.6-osx-x64/node-webkit.app ]; then
    echo "OSX App file not found. Downloading."
    wget http://dl.node-webkit.org/v0.11.6/node-webkit-v0.11.6-osx-x64.zip
    tar -xf node-webkit-v0.11.6-osx-x64.zip -C build/platform/
    rm node-webkit-v0.11.6-osx-x64.zip
  fi
else
  echo "OSX Dir not found. Downloading."
  wget http://dl.node-webkit.org/v0.11.6/node-webkit-v0.11.6-osx-x64.zip
  tar -xf node-webkit-v0.11.6-osx-x64.zip -C build/platform/
  rm node-webkit-v0.11.6-osx-x64.zip
fi

# get specific WIN64 version of node webkit
if [ -d build/platform/node-webkit-v0.11.6-win-x64/ ]; then
  if [ ! -f build/platform/node-webkit-v0.11.6-win-x64/nw.exe ]; then
    echo "Windows App file not found. Downloading."
    wget http://dl.node-webkit.org/v0.11.6/node-webkit-v0.11.6-win-x64.zip
    tar -xf node-webkit-v0.11.6-win-x64.zip -C build/platform/
    rm node-webkit-v0.11.6-win-x64.zip
  fi
else
  echo "Windows Dir not found. Downloading."
  wget http://dl.node-webkit.org/v0.11.6/node-webkit-v0.11.6-win-x64.zip
  tar -xf node-webkit-v0.11.6-win-x64.zip -C build/platform/
  rm node-webkit-v0.11.6-win-x64.zip
fi

# define timestamp
EPOC=$(date +%s)

# copy node webkit app to build directory
cp -r build/platform/node-webkit-v0.11.6-osx-x64/node-webkit.app build/osx/netCanvas-$EPOC.app


# Windows Build
cat build/platform/node-webkit-v0.11.6-win-x64/nw.exe app.nw > build/win/netCanvas-$EPOC.exe
cp build/platform/node-webkit-v0.11.6-win-x64/{nw.pak,icudtl.dat,libEGL.dll,libGLESv2.dll,d3dcompiler_46.dll} build/win

# Copy netCanvas into nw app (OSX)

# for zipped version
cp app.nw build/osx/netCanvas-$EPOC.app/Contents/Resources/app.nw

# non-zipped version
#cp -r app/ build/netCanvas-$EPOC.app/Contents/Resources/app.nw

# Remove archive
rm app.nw
