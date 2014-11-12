/**
 * Utility functions used by windowslib.
 *
 * @module utilities
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const EventEmitter = require('events').EventEmitter;

/**
 * Creates an event emitter, validates that the platform is Windows,
 * normalizes the 'options' and 'callback' arguments, and passes all
 * these goodies to the 'body' function. It's magik!
 *
 * @param {Object} [options] - An object containing various settings.
 * @param {Function} [callback(err, ...)] - A function to call with the task is complete. This is guaranteed to be called asynchronously.
 *
 * @returns {EventEmitter}
 */
exports.magik = function magik(options, callback, body) {
	var emitter = new EventEmitter;

	process.nextTick(function () {
		if (process.platform !== 'win32') {
			var err = new Error(__('Unsupported platform "%s"', process.platform));
			emitter.emit('error', err);
			return callback(err);
		}

		if (typeof options === 'function') {
			callback = options;
			options = {};
		} else if (!options) {
			options = {};
		}
		typeof callback === 'function' || (callback = function () {});

		body(emitter, options, callback);
	});

	return emitter;
};
