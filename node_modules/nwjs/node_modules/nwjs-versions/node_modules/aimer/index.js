'use strict'

/**
 * Module dependencies
 */
const fetch = require('node-fetch')
const cheerio = require('cheerio')

module.exports = function (url, opts) {
	if (typeof url !== 'string') {
		throw new TypeError('Expected a string')
	}

	opts = opts || {}

	return fetch(url)
		.then(data => {
			if (data.status !== 200) {
				return Promise.reject(new Error(data.statusText))
			}
			return data.text()
		})
		.then(data => cheerio.load(data, opts))
}
