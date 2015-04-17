#!/bin/bash

shopt -s extglob

# zip app
cd app
zip -r -q ../${PWD##*/}.nw *
cd ..

# get specific OSX version of node webkit
if [ -d build/platform/nwjs-v0.12.1-osx-x64/ ]; then
  if [ ! -d build/platform/nwjs-v0.12.1-osx-x64/nwjs.app ]; then
    echo "OSX App file not found. Downloading."
    wget http://dl.nwjs.io/v0.12.1/nwjs-v0.12.1-osx-x64.zip
    tar -xf nwjs-v0.12.1-osx-x64.zip -C build/platform/
    rm nwjs-v0.12.1-osx-x64.zip
  fi
else
  echo "OSX Dir not found. Downloading."
  wget http://dl.nwjs.io/v0.12.1/nwjs-v0.12.1-osx-x64.zip
  tar -xf nwjs-v0.12.1-osx-x64.zip -C build/platform/
  rm nwjs-v0.12.1-osx-x64.zip
fi

# get specific WIN64 version of node webkit
if [ -d build/platform/nwjs-v0.12.1-win-x64/ ]; then
  if [ ! -f build/platform/nwjs-v0.12.1-win-x64/nw.exe ]; then
    echo "Windows App file not found. Downloading."
    wget http://dl.nwjs.io/v0.12.1/nwjs-v0.12.1-win-x64.zip
    tar -xf nwjs-v0.12.1-win-x64.zip -C build/platform/
    rm nwjs-v0.12.1-win-x64.zip
  fi
else
  echo "Windows Dir not found. Downloading."
  wget http://dl.nwjs.io/v0.12.1/nwjs-v0.12.1-win-x64.zip
  tar -xf nwjs-v0.12.1-win-x64.zip -C build/platform/
  rm nwjs-v0.12.1-win-x64.zip
fi

# define timestamp
EPOC=$(date +%s)

# OSX build
rm -rf -- build/osx
mkdir build/osx
cp -r build/platform/nwjs-v0.12.1-osx-x64/nwjs.app build/osx/netCanvas-$EPOC.app
cp app.nw build/osx/netCanvas-$EPOC.app/Contents/Resources/app.nw

# Windows Build
rm -rf -- build/win
mkdir build/win
cat build/platform/nwjs-v0.12.1-win-x64/nw.exe app.nw > build/win/netCanvas-$EPOC.exe
cp build/platform/nwjs-v0.12.1-win-x64/{nw.pak,icudtl.dat,libEGL.dll,libGLESv2.dll,d3dcompiler_47.dll} build/win

# Remove archive
rm app.nw

cd build/win
zip -r -q netCanvas-$EPOC-win.zip * && rm !(*.zip) && cd .. && cd ..

cd build/osx
zip -r -q netCanvas-$EPOC-osx.zip * && rm -rf -- netCanvas-$EPOC.app && cd .. && cd ..
