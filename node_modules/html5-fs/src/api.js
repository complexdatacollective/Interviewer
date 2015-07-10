'use strict';

var utils = require('./utils')
  , pathm = require('path')
  , fs = require('./fileSystem');

var wrapSuccess = utils.wrapSuccess
  , wrapFail = utils.wrapFail;

exports.getFsInstance = fs.getInstance;

exports.appendFile = function(path, data, callback) {
  fs.writeFile(path, data, callback, true);
};


exports.writeFile = function(path, data, callback) {
  fs.writeFile(path, data, callback, false);
};


exports.readFile = function(path, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {
      encoding: 'utf8'
    };
  }

  var success = wrapSuccess(callback)
    , fail = wrapFail(callback);

  fs.getFile(path, function(err, fileEntry) {
    fileEntry.file(function(file) {
      var reader = new FileReader();

      reader.onloadend = function(evt) {
        success(evt.target.result);
      };

      reader.onerror = function(err) {
        fail(err);
      };

      if (opts.encoding === 'utf8') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }, fail);
  });
};


exports.unlink = function(path, callback) {
  var success = wrapSuccess(callback)
    , fail = wrapFail(callback);

  fs.getFile(path, function(err, file) {
    if (err) {
      fail(err);
    } else {
      file.remove(success, fail);
    }
  });
};


exports.readdir = function(path, callback) {
  var success = wrapSuccess(callback)
    , fail = wrapFail(callback);

  fs.getDirectory(path, function(err, dirEntry) {
    if (err) {
      fail(err);
    } else {
      var directoryReader = dirEntry.createReader();
      directoryReader.readEntries(success, fail);
    }
  });
};


exports.mkdir = function(path, callback) {
  var newFolderName = pathm.basename(path)
    , basePath = pathm.dirname(path)
    , success = utils.wrapSuccess(callback)
    , fail = utils.wrapFail(callback)
    , opts = {
      create: true,
      exclusive: true
    };

  if (basePath === '.') {
    fs.getDirectory(newFolderName, opts, callback);
  } else {
    fs.getDirectory(basePath, function (err, dir) {
      if (err) {
        callback(err, null);
      } else {
        dir.getDirectory(newFolderName, opts, success, fail);
      }
    });
  }
};


/**
 * Remove a directory.
 * The FileSystem API expects directories to be empty but returns a
 * non-informative error on Android and possibly iOS so we check here
 * to ensure users know why directory deletes might fail.
 * @param  {String}   path
 * @param  {Function} callback
 */
exports.rmdir = function(path, callback) {
  var success = wrapSuccess(callback)
    , fail = wrapFail(callback);

  this.readdir(path, function(err, list) {
    if (err) {
      fail(err);
    } else if (list && list.length > 0) {
      fail('ENOTEMPTY: Directory must be empty');
    } else {
      fs.getDirectory(path, function(err, dirEntry) {
        if (err) {
          fail(err);
        } else {
          dirEntry.remove(success, fail);
        }
      });
    }
  });
};


exports.exists = function(path, callback) {
  var success = wrapSuccess(callback)
    , fail = wrapFail(callback);

  fs.getFile(path, {
    // Don't create the file, just look for it
    create: false
  }, function(err) {
    if (err && err.code === 1) { // NOT FOUND
      // If the file isn't found we don't want an error, pass false!
      success(false);
    } else if (err) {
      // An actual error occured, pass it along
      fail(err);
    } else {
      success(true);
    }
  });
};


exports.stat = function(path, callback) {
  var success = wrapSuccess(callback)
    , fail = wrapFail(callback)
    , fn = fs.getFile;

  // TODO: Perhaps check for folder AND file instead, use whichever exists
  if (utils.isDirectory(path)) {
    fn = fs.getDirectory;
  }

  fn(path, function(err, res) {
    if (err) {
      fail(err);
    } else {
      res.getMetadata(success, fail);
    }
  });
};


/**
 * Initialise the file system component for use.
 * @param {Number}     [quota]
 * @param {Function}   callback
 */
exports.init = function(bytes, callback) {
  fs.init(bytes, function(err) {
    if (err) {
      callback(err, null);
    } else {
      fs.getInstance(function(err /*, instance */) {
        callback(err, null);
      });
    }
  });
};
