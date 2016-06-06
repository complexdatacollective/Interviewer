'use strict'

var Promise = require('es6-promise').Promise
var nugget = require('nugget')

module.exports = function (url, opts) {
	if (typeof url !== 'string') {
		throw new TypeError('Expected a string')
	}

	opts = opts || {}

	return new Promise(function (resolve, reject) {
		nugget(url, opts, function (err) {
			if (err) {
				return reject(new Error(err))
			}
			resolve()
		})
	})
}
