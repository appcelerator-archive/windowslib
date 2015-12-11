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
	fs = require('fs'),
	magik = require('./utilities').magik,
	path = require('path'),
	spawn = require('child_process').spawn,
	windowsphone = require('./windowsphone'),
	wptool = require('./wptool'),
	__ = appc.i18n(__dirname).__;

var cache;

exports.detect = detect;
exports.connect = connect;
exports.install = install;

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
	return magik(options, callback, function (emitter, options, callback) {
		if (cache && !options.bypassCache) {
			emitter.emit('detected', cache);
			return callback(null, cache);
		}

		wptool.enumerate(options, function (err, results) {
			var result = {
				devices: [],
				issues: []
			};

			if (!err) {
				var tmp = {};

				Object.keys(results).forEach(function (wpsdk) {
					results[wpsdk].devices.forEach(function (dev) {
						if (!tmp[dev.udid]) {
							tmp[dev.udid] = 1;
							result.devices.push(dev);
						}
					});
				});

				cache = result;
			}

			emitter.emit('detected', result);
			callback(null, result);
		});
	});
};

/**
 * Tries to connect to the specified device and will error if there are no devices connected
 * or there are more than one connected devices.
 *
 * @param {String} udid - The UDID of the device to connect to or null if you want windowslib to pick one.
 * @param {Object} [options] - An object containing various settings.
 * @param {Boolean} [options.bypassCache=false] - When true, re-detects the environment configuration.
 * @param {Function} [callback(err)] - A function to call when the simulator has launched.
 *
 * @returns {EventEmitter}
 */
function connect(udid, options, callback) {
	return wptool.connect(udid, options, callback);
}

/**
 * Installs the specified app to an Windows Phone device. If the device is not
 * connected or more than one is connected, then an error is returned. After the
 * app is installed, it will be automatically launched.
 *
 * @param {String} udid - The UDID of the device to install the app to or null if you want windowslib to pick one.
 * @param {String} appPath - The path to the Windows Phone app to install.
 * @param {Object} [options] - An object containing various settings.
 * @param {Boolean} [options.bypassCache=false] - When true, re-detects the environment configuration.
 * @param {Number} [options.timeout] - Number of milliseconds to wait before timing out. Minimum of 1000 milliseconds.
 * @param {String} [options.wpsdk] - The Windows Phone SDK to use for the deploy tool. If not specified, it will autodetect.
 * @param {Function} [callback(err)] - A function to call when the simulator has launched.
 *
 * @emits module:device#error
 * @emits module:device#installed
 *
 * @returns {EventEmitter}
 */
function install(udid, appPath, options, callback) {
	return magik(options, callback, function (emitter, options, callback) {
		if (typeof appPath !== 'string' || !appPath) {
			var ex = new Error(__('Missing required "%s" argument', 'appPath'));
			emitter.emit('error', ex);
			return callback(ex);
		}

		if (!fs.existsSync(appPath)) {
			var ex = new Error(__('App path does not exist: ' + appPath));
			emitter.emit('error', ex);
			return callback(ex);
		}

		// detect devices
		wptool.enumerate(options, function (err, devInfo) {
			if (err) {
				emitter.emit('error', err);
				return callback(err);
			}

			var devHandle;

			if (udid) {
				// validate the udid
				Object.keys(devInfo).filter(function (wpsdk) {
					return !options.wpsdk || wpsdk === options.wpsdk;
				}).some(function (wpsdk) {
					return devInfo[wpsdk].devices.some(function (dev) {
						if (dev.udid === udid) {
							devHandle = appc.util.mix({}, dev);
							return false;
						}
						return true;
					});
				});

				if (!devHandle) {
					err = new Error(__('Unable to find an Windows Phone device with the UDID "%s"', options.udid));
				}
			} else {
				Object.keys(devInfo).filter(function (wpsdk) {
					return !options.wpsdk || wpsdk === options.wpsdk;
				}).some(function (wpsdk) {
					if (devInfo[wpsdk].devices.length) {
						devHandle = appc.util.mix({}, devInfo[wpsdk].devices[0]);
						return true;
					}
				});

				if (!devHandle) {
					// user experience!
					if (options.wpsdk) {
						err = new Error(__('Unable to find an Windows Phone %s device.', options.wpsdk));
					} else {
						err = new Error(__('Unable to find an Windows Phone device.'));
					}
				}
			}

			if (err) {
				emitter.emit('error', err);
				return callback(err);
			}

			// connect to the device to see if it's connected...
			// this will add a second or two to the build time, but at least if there was
			// an error, we'll get a decent message
			wptool.connect(devHandle.udid, options)
				.on('error', function (err) {
					emitter.emit('error', err);
					return callback(err);
				})
				.on('connected', function () {
					// device is good to go, install the app!
					var timeout = options.timeout !== void 0 && Math.max(~~options.timeout, 1000); // minimum of 1 second
					wptool.install(devHandle, appPath, appc.util.mix({timeout: timeout}, options))
					.on('error', function (err) {
						emitter.emit('error', err);
						callback(err);
					}).on('launched', function () {
						emitter.emit('installed', devHandle);
						callback(null, devHandle);
					}).on('timeout', function (err) {
						err || (err = new Error(__('Timed out after %d milliseconds waiting to launch the device.', timeout)));
						emitter.emit('timeout', err);
						callback(err);
					});
				});
		});
	});
}
