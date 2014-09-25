/**
 * Detects Windows Phone devices.
 *
 * @module device
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const
	appc = require('node-appc'),
	async = require('async'),
	EventEmitter = require('events').EventEmitter,
	fs = require('fs'),
	path = require('path'),
	windowsphone = require('./windowsphone'),
	__ = appc.i18n(__dirname).__;

var cache;

exports.detect = detect;
// TODO Add install method
//exports.install = install;

/**
 * Detects connected Windows Phone devices.
 *
 * @param {Object} [options] - An object containing various settings.
 * @param {Boolean} [options.bypassCache=false] - When true, re-detects all Windows Phone devices.
 * @param {Function} [callback(err, results)] - A function to call with the device information.
 *
 * @emits module:device#detected
 * @emits module:device#error
 *
 * @returns {EventEmitter}
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

	windowsphone.detect(function (err, results) {
		process.nextTick(function () {
			if (err) {
				emitter.emit('error', err);
				return callback(err);
			}
			async.each(Object.keys(results.sdks), function (version, callback) {
				var wpInfo = results.sdks[version];
		
				if (!wpInfo.deployCmd) return callback();
		
				appc.subprocess.run(wpInfo.deployCmd, '/EnumerateDevices', function (code, out, err) {
					if (err) {
						emitter.emit('error', err);
						return callback(err);
					} else {
						var deviceRegExp = /^ ([0-9]*)\t\t(.*)$/;
						wpInfo.devices = {};
						out.trim().split(/\r\n|\n/).forEach(function (line) {
							var m = line.match(deviceRegExp);
							if (m) {
								wpInfo.devices[m[1]] = m[2];
							}
						});
		
						if (!results.issues.some(function (i) { return i.id == 'WINDOWS_PHONE_EMULATOR_NOT_INSTALLED'; }) && Object.keys(wpInfo.devices).filter(function (d) { return !/device/i.test(wpInfo.devices[d]); }).length == 0) {
							results.issues.push({
								id: 'WINDOWS_PHONE_EMULATOR_NOT_INSTALLED',
								type: 'error',
								message: __('Windows Phone Emulator is not installed.') + '\n' +
									__('Ensure that the Windows Phone Emulator is properly installed.') + '\n' +
									__('You must be running 64-bit Windows 8.1 Pro with Hyper-V support enabled.')
							});
						}
					}
				});
			});
			cache = {
				devices: JSON.parse(JSON.stringify(wpInfo.devices)),
				issues: []
			};

			emitter.emit('detected', cache);
			callback(null, cache);
		});
	});

	return emitter;
};
