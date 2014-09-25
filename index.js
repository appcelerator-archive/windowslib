/**
 * Main namespace for the windowslib.
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const
	async = require('async'),
	EventEmitter = require('events').EventEmitter,

	//certs        = exports.certs        = require('./lib/certs'),
	device       = exports.device       = require('./lib/device'),
	env          = exports.env          = require('./lib/env'),
	//provisioning = exports.provisioning = require('./lib/provisioning'),
	//simulator    = exports.simulator    = require('./lib/simulator'),
	visualstudio = exports.visualstudio = require('./lib/visualstudio'),
	windowsphone = exports.visualstudio = require('./lib/windowsphone'),

	cache;

exports.detect = detect;
exports.findValidDeviceCertProfileCombos = findValidDeviceCertProfileCombos;

/**
 * Detects the entire Windows phone environment information.
 *
 * @param {Object} [options] - An object containing various settings.
 * @param {Boolean} [options.bypassCache=false] - When true, re-detects the all Windows phone information.
 * @param {Function} [callback(err, simHandle)] - A function to call when the simulator has launched.
 */
function detect(options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	} else if (!options) {
		options = {};
	}
	typeof callback === 'function' || (callback = function () {});

	var emitter = new EventEmitter;

	if (process.platform !== 'win32') {
		process.nextTick(function () {
			var err = new Error(__('Unsupported platform "%s"', process.platform));
			emitter.emit('error', err);
			callback(err);
		});
		return emitter;
	}

	if (cache && !options.bypassCache) {
		process.nextTick(function () {
			emitter.emit('detected', cache);
			callback(null, cache);
		});
		return emitter;
	}

	var results = {
		detectVersion: '3.0',
		issues: []
	};

	function mix(src, dest) {
		Object.keys(src).forEach(function (name) {
			if (Array.isArray(src[name])) {
				if (Array.isArray(dest[name])) {
					dest[name] = dest[name].concat(src[name]);
				} else {
					dest[name] = src[name];
				}
			} else if (src[name] !== null && typeof src[name] === 'object') {
				dest[name] || (dest[name] = {});
				Object.keys(src[name]).forEach(function (key) {
					dest[name][key] = src[name][key];
				});
			} else {
				dest[name] = src[name];
			}
		});
	}

	async.parallel([
//		function certificates(done) {
//			certs.detect(options, function (err, result) {
//				err || mix(result, results);
//				done(err);
//			});
//		},
		function devices(done) {
			device.detect(options, function (err, result) {
				err || mix(result, results);
				done(err);
			});
		},
		function environment(done) {
			env.detect(options, function (err, result) {
				err || mix(result, results);
				done(err);
			});
		},
//		function provisioningProfiles(done) {
//			provisioning.detect(options, function (err, result) {
//				err || mix(result, results);
//				done(err);
//			});
//		},
//		function simulators(done) {
//			simulator.detect(options, function (err, result) {
//				err || mix(result, results);
//				done(err);
//			});
//		},
		function visualstudios(done) {
			visualstudio.detect(options, function (err, result) {
				err || mix(result, results);
				done(err);
			});
		},
		function windowsphones(done) {
			windowsphone.detect(options, function (err, result) {
				err || mix(result, results);
				done(err);
			});
		}
	], function (err) {
		if (err) {
			emitter.emit('error', err);
			callback(err);
		} else {
			cache = results;
			emitter.emit('detected', results);
			callback(null, results);
		}
	});

	return emitter;
};
