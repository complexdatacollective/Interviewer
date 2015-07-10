# html5-fs
#### A Node.js fs style FileSystem API Wrapper

The reason I chose write this module was due to the availability of 
FileSystem APIs in regular browsers and Cordova applications and the desire for 
an API consitent with that of the fs module in Node.js. 

I prefer the Node.js callback style system 
when writing asynchronous code so this uses callbacks of the format 
_function (err, result)_. 

It's also CommonJS / RequireJS friendly thanks to wrapped using Browserify.

I initially began this module as a fork of GapFile, but started from scratch 
when I realised the two were radically different in style and aims.


#### Install
Use a file from the _dist_ directory or do an npm install:

```
npm install html5-fs
```


#### Example vs. Standard File System API

This wrapper makes for shorter more concise code vs. the plain FileSystem API. 
It also has the added benefit of working with Node.js style libraries such as 
[async](https://github.com/caolan/async) which means it'll cause less headcahes 
when dealing with the asynchronous nature of the FileSystem API.

Here we use the plain old FileSystem API to create a folder and write a file 
into that created folder.

```javascript

function writeFile(success, fail) {
  // fileSystem would be returned after some initialisation calls
  fileSystem.root.getDirectory('/test/', {
    create: true,
    exclusive: false
  }, function(dirEntry) {
      dirEntry.getFile('somefile.txt', {
        create: true,
        exclusive: false
      }, function(file) {
        file.createWriter(function(writer) {
          writer.onwrite = function(evt) {
              success(null);
          };

          writer.onerror = function(evt) {
              fail(evt.target.error);
          };

          writer.write(new Blob([data], {
            type: 'text/plain'
          }));
      }, fail);
    }, fail);
  }, fail);
}

```

The below code is equivalent to the previous code, but is using this wrapper 
which means it's far more concise and instantly recognisable if you've used the 
Node.js fs module:

```javascript

var fs = require('html5-fs'); // Or use window.fs

function writeFile(callback) {
  fs.mkdir('test', function (err) {
    if (err) {
      callback(err, null);
    } else {
      fs.writeFile('test/somefile.txt', 'Hello world', callback);
    }
  }); 
}

```

You can then compose more aesthetically pleasing code using async:

```javascript

var fs = require('html5-fs'); // Or use window.fs
var async = require('async'); // Or use window.async

function writeFile(callback) {
  function createDir(cb) {
    fs.mkdir('test', cb);
  }

  function writeFile(cb) {
    fs.writeFile('test/somefile.txt', 'Hello world', cb);
  }

  async.waterfall([
    createDir,
    writeFile
  ], callback); 
}

```


## Support
Currently Cordova applications, Chrome and new versions of Opera support 
this API. 

This has only been tested on iOS and Android Cordova applications. It has also 
only been tested with version 1.3.2 of the org.apache.cordova.file plugin.

If using a Cordova application this library assumes you've configured your 
build with FileSystem access and the FileSystem plugin as described 
[here](https://github.com/apache/cordova-plugin-file/blob/master/doc/index.md). 


## Tests
First install all dependencies with ```npm install```.

Also make sure you have Grunt installed ```npm install -g grunt-cli```.

If you plan to test either iOS or Android you'll need to run 
```cordova add platorm [platform-name]```. I did this using the Cordova CLI 
version 4.1.2.

If testing using the iOS Simulator you'll need to 
```npm install -g ios-sim``` too.

To test using Android you'll need an emulator configured.

Now run ```grunt test```. When the relevant browser(s) open allow 
file system access via the popup that appears (this is standard) and the 
tests will run.

To test Android run ```grunt test-android``` and for iOS use 
```grunt test-ios```. 


## Building & Contributing
All contributions are welcome! This project only implements a small subset of 
the Node.js FileSystem API. Naturally some functions may not be applicable or 
possible to implement due to the browser environment but having as a close a 
representation as possible to the original would be ideal.

To manage tests and builds Grunt is used. Running ```grunt test-[platform]``` 
will browserify the files in the __/src__ directory into a single bundle with 
source maps enabled and then execute the tests using Karma or the applicable 
device emulator.

For production builds run ```grunt build```. This command will browserify the 
source and write it to the __/dist__ directory. It will also create a minified 
version.

## API

All callbacks in this API follow the standard Node.js convention taking two 
parameters. An error followed by a result.

Errors returned do not match Node.js File System errors, if someone feels like 
mapping these be my guest, but it might be best to leave them as is!

#### fs.init(desiredBytes, callback)

Request access for a specific number of bytes. Users need to accept this 
request, usually via a popup in the browser. Cordova applications don't require
users to accept any popups. 

Callback format should be as 
follows:

__NOTE:__ for iOS and Android Cordova/PhoneGap applications the 
**desiredBytes** parameter is ignored as they expect a value of 0.

```javascript
// Ask for a 5MB quota of persistent storage
fs.init(5 * 1024 * 1024, function(err) {
    if(err) {
      // Error handling
    } else {
      // Now we can use the other fs API functions!
    }
});
```

#### fs.writeFile(filename, data, callback)
Write data to a file specified by __filename__. __data__ should be a string.


#### fs.appendFile(fullpath, data, callback)
Asynchronously append data to a file, creating the file if it doesn't exist.


#### fs.readFile(filename, [options], callback)
Read data from a file. __options__ is an object that supports an encoding key 
that can have a value of "base64" or "utf8". By default "utf8" is assumed.


#### fs.unlink(path, callback)
Delete a file.


#### fs.readdir(dirname, callback)
Get a list of the files in a directory as an Array. Entries are instances of 
DirectoryEntry and have an _isFile_ property that can be used to differentiate 
folders and files.


#### fs.mkdir(dirName, callback)
Create a directory. Currently this doesn't support creating a nested directory 
unless the parent already exists. In other words to create _dir/subdir_ you'd 
need to first create _dir_ then in a second call create _subdir_. This is the 
same behaviour as the Node.js fs module.


#### fs.rmdir(dirName, callback)
Delete a directory.


#### fs.exists(path, callback)
Test whether or not the given path exists by checking with the file system. 
Works just like the 
[standard Node.js API](http://nodejs.org/api/fs.html#fs_fs_exists_path_callback)
 meaning no error is passed to the callback.


#### fs.stat(path, callback)
Get metadata related to a file or directory. If the provided path doesn't end
with a __/__ character a file lookup is assumed. Result looks as follows:


```json
{
    "size": 13,
    "modificationTime": "2014-04-26T17:01:11.000Z"
}
```
