'use strict';

var utils = require('./utils')
  , pathm = require('path');

var DEFAULT_QUOTA = (10 * 1024 * 1024); // 10MB

var fileSystem = null;

/**
 * Get a FileSystem instance.
 * @param {Function} callback
 */
exports.getInstance = function(callback) {
  if (fileSystem) {
    callback(null, fileSystem);
  } else {
    init(null, callback);
  }
};


/**
 * Initialises access to browser File System
 * @param {Number}      bytes
 * @param {Function}    callback
 */
var init = exports.init = function(bytes, callback) {
  requestQuota(bytes, function(err, grantedBytes) {
    if (err) {
      return callback(err, null);
    } else {
      requestFileSystem(grantedBytes, function(instance) {
        fileSystem = instance;
        callback(null, grantedBytes);
      }, function(err) {
        callback(err, null);
      });
    }
  });
};


/**
 * Write data to a file optionally appending it.
 * @param {String}      path
 * @param {Mixed}       data
 * @param {Function}    callback
 * @param {Boolean}     append
 */
exports.writeFile = function(path, data, callback, append) {
  var fail = utils.wrapFail(callback)
    , success = utils.wrapSuccess(callback);

  this.getFile(path, {
    create: true,
    exclusive: false
  }, function(err, file) {
    if (err) {
      return callback(err, null);
    } else {
      file.createWriter(function(writer) {
        writer.onwrite = function(/*evt*/) {
          success(file.toURL());
        };

        writer.onerror = function(evt) {
          fail(evt.target.error);
        };

        if (append === true) {
          writer.seek(writer.length);
        }

        if (utils.isMobile()) {
          writer.write(data);
        } else {
          // Only desktop has blob support AFAIK
          writer.write(new Blob([data], {
            type: 'text/plain'
          }));
        }
      }, fail);
    }
  });
};


/**
 * Get a directory specified by path.
 * By default if the dir does not exist it is not created.
 * @param {String}      path
 * @param {Object}      [opts]
 * @param {Function}    callback
 */
exports.getDirectory = function(path, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {
      create: false
    };
  }

  var success = utils.wrapSuccess(callback)
    , fail = utils.wrapFail(callback);

  fileSystem.root.getDirectory(path, opts, success, fail);
};


/**
 * Get a file at a specified path.
 * By default if the file does not exist it is not created.
 * @param {String}      path
 * @param {Object}      [opts]
 * @param {Function}    callback
 */
exports.getFile = function(path, opts, callback) {
  if (!callback) {
    callback = opts;
    opts = {
      create: false
    };
  }

  var fileName = pathm.basename(path)
    , basePath = pathm.dirname(path)
    , success = utils.wrapSuccess(callback)
    , fail = utils.wrapFail(callback);

  function doGet (dirRef) {
    dirRef.getFile(fileName, opts, success, fail);
  }

  if (basePath === '.') {
    // File is in root directory
    doGet(fileSystem.root);
  } else {
    // Need to get container directory ref for the requested file
    this.getDirectory(basePath, function (err, dir) {
      if (err) {
        callback(err, null);
      } else {
        doGet(dir);
      }
    });
  }
};


/**
 * Request access to the file system.
 * This is called only after quota is granted.
 * @param {Number}       bytes
 * @param {Function}     success
 * @param {Function}     fail
 */
function requestFileSystem(bytes, success, fail) {
  // These are in order of preference due to some being deprecated
  if (window.navigator.webkitRequestFileSystem) {
    window.navigator.webkitRequestFileSystem(bytes, success, fail);
  } else if (window.requestFileSystem) {
    window.requestFileSystem(
      window.LocalFileSystem.PERSISTENT,
      bytes,
      success,
      fail
    );
  } else if (window.webkitRequestFileSystem) {
    window.webkitRequestFileSystem(
      window.PERSISTENT_FLAG,
      bytes,
      success,
      fail
    );
  } else {
    fail('NO_SUPPORT');
  }
}


/**
 * Request a quota from the FileSystem.
 * @param {Number}     bytes
 * @param {Function}   callback
 */
function requestQuota(quota, callback) {
  // Allow user overide the default quota
  quota = quota || DEFAULT_QUOTA;

  function success(bytes) {
    callback(null, bytes);
  }

  function fail(err) {
    callback(err, null);
  }

  // These are in order of preference due to some being deprecated
  if (navigator.webkitPersistentStorage &&
      navigator.webkitPersistentStorage.requestQuota) {
    navigator.webkitPersistentStorage.requestQuota(quota, success, fail);
  } else if (window.webkitStorageInfo &&
      window.webkitStorageInfo.requestQuota) {
    window.webkitStorageInfo.requestQuota(
      window.PERSISTENT,
      quota,
      success,
      fail
    );
  } else if (window.requestFileSystem) {
    // PhoneGap apps should request a 0 quota
    if (utils.isPhoneGap() === true) {
      quota = 0;
    }

    success(quota);
  } else {
    fail('NO_SUPPORT');
  }
}
