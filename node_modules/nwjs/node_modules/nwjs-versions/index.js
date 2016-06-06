'use strict'

var aimer = require('aimer')
var isSemver = require('is-semver')

module.exports = function () {
	return aimer('http://dl.nwjs.io/')
		.then(function ($) {
			var versions = []
			$('tr').each(function () {
				var v = $(this).find('a').text()
				v = v.substring(1, v.length - 1)
				if (isSemver(v)) {
					versions.push(v)
				}
			})
			return versions
		})
		.catch(function (e) {
			throw e
		})
}
