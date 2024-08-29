var exec = require('cordova/exec');

var ZipFileWriter = {
  saveZipFile: function (base64Data, fileName, successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'ZipFileWriter', 'saveZipFile', [base64Data, fileName]);
  }
};

module.exports = ZipFileWriter;
