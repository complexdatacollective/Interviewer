'use strict';
var isRoot = require('is-root');
var defaultUid = require('default-uid');

module.exports = function () {
	if (isRoot() && process.setuid) {
		var uid = parseInt(process.env.SUDO_UID, 10) || defaultUid();
		if (uid && uid > 0) {
			process.setuid(uid);
		}
	}
};
