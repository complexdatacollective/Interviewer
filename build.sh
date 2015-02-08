!#/bin/bash

# zip app
cd app
zip -r -q ../${PWD##*/}.nw *
cd ..

# get specific version of node webkit
if [ -d build/node-webkit-v0.11.6-osx-x64/ ]; then
  if [ ! -d build/node-webkit-v0.11.6-osx-x64/node-webkit.app ]; then
    wget http://dl.node-webkit.org/v0.11.6/node-webkit-v0.11.6-osx-x64.zip
    tar -xf node-webkit-v0.11.6-osx-x64.zip -C build/
    rm node-webkit-v0.11.6-osx-x64.zip
  fi
else
  wget http://dl.node-webkit.org/v0.11.6/node-webkit-v0.11.6-osx-x64.zip
  tar -xf node-webkit-v0.11.6-osx-x64.zip -C build/
  rm node-webkit-v0.11.6-osx-x64.zip
fi


EPOC=$(date +%s)

cp -r build/node-webkit-v0.11.6-osx-x64/node-webkit.app build/netCanvas-$EPOC.app

# for zipped version
# cp app.nw build/netCanvas-$EPOC.app/Contents/Resources/app.nw

# non-zipped version
cp -r app/ build/netCanvas-$EPOC.app/Contents/Resources/app.nw

# Remove archive
rm app.nw
