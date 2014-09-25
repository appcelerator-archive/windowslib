/**
 * Detects the Windows Phone SDKs.
 *
 * @module windowsphone
 *
 * @copyright
 * Copyright (c) 2009-2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

var appc = require('node-appc'),
	async = require('async'),
	fs = require('fs'),
	path = require('path'),
	spawn = require('child_process').spawn,
	__ = appc.i18n(__dirname).__,
	windowsPhoneSDKRequirement = "8.0";
	
var cache;

/**
 * Detects Windows Phone SDKs.
 * @param {Object} [options] - An object containing various settings.
 * @param {Function} [callback(err, results)] - A function to call with the Windows Phone SDK information.
 *
 * @emits module:windowsphone#detected
 * @emits module:windowsphone#error
 *
 * @returns {EventEmitter}
 */
exports.detect = function detect(options, callback) {
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
			sdks: {},
			issues: []
		},
		searchPaths = [
			'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Microsoft SDKs\\WindowsPhone', // probably nothing here
			'HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Microsoft SDKs\\WindowsPhone' // this is most likely where WPSDK will be found
		];

	async.parallel(searchPaths.map(function (keyPath) {
		return function (next) {
			appc.subprocess.run('reg', ['query', keyPath], function (code, out, err) {
				var keyRegExp = /.+\\(v\d+\.\d)$/;
				if (!code) {
					out.trim().split(/\r\n|\n/).forEach(function (key) {
						key = key.trim();
						var m = key.match(keyRegExp),
							version = m[1].replace(/^v/, '');
						if (m) {
							results.sdks[version] = {
								version: version,
								registryKey: keyPath + '\\' + m[1],
								supported: appc.version.satisfies(version, windowsPhoneSDKRequirement, false), // no maybes
								path: null,
								deployCmd: null,
								selected: false,
								devices: null
							};
						}
					});
				}
				next();
			});
		};
	}), function () {
		// check if we didn't find any Windows Phone SDKs, then we're done
		if (!Object.keys(results.sdks).length) {
			results.issues.push({
				id: 'WINDOWS_PHONE_SDK_NOT_INSTALLED',
				type: 'error',
				message: __('Microsoft Windows Phone SDK not found.') + '\n' +
					__('You will be unable to build Windows Phone apps.') + '\n' +
					__('You can install it from %s.', '__http://appcelerator.com/windowsphone__')
			});
			return next();
		}

		// fetch Windows Phone SDK install information
		async.parallel(Object.keys(results.sdks).map(function (ver) {
			return function (next) {
				appc.subprocess.run('reg', ['query', results.sdks[ver].registryKey + '\\Install Path', '/v', '*'], function (code, out, err) {
					if (code) {
						// bad key? either way, remove this version
						delete results.sdks[ver];
					} else {
						// get only the values we are interested in
						out.trim().split(/\r\n|\n/).forEach(function (line) {
							var parts = line.trim().split('   ').map(function (p) { return p.trim(); });
							if (parts.length == 3) {
								if (parts[0] == 'Install Path') {
									results.sdks[ver].path = parts[2];
									var deployCmd = path.join(parts[2], 'Tools', 'XAP Deployment', 'XapDeployCmd.exe');
									// check the old WP8 location
									if (fs.existsSync(deployCmd)) {
										results.sdks[ver].deployCmd = deployCmd;
									// check the new WP8.1 location
									} else if (fs.existsSync(deployCmd = path.join(parts[2], 'Tools', 'AppDeploy', 'AppDeployCmd.exe'))) {
										results.sdks[ver].deployCmd = deployCmd;
									}
								}
							}
						});
					}
					next();
				});
			};
		}), function () {
			// double check if we didn't find any Windows Phone SDKs, then we're done
			if (Object.keys(results.sdks).every(function (v) { return !results.sdks[v].path; })) {
				results.issues.push({
					id: 'WINDOWS_PHONE_SDK_NOT_INSTALLED',
					type: 'error',
					message: __('Microsoft Windows Phone SDK not found.') + '\n' +
						__('You will be unable to build Windows Phone apps.') + '\n' +
						__('You can install it from %s.', '__http://appcelerator.com/windowsphone__')
				});
				return next();
			}

			if (Object.keys(results.sdks).every(function (v) { return !results.sdks[v].deployCmd; })) {
				results.issues.push({
					id: 'WINDOWS_PHONE_SDK_MISSING_DEPLOY_CMD',
					type: 'error',
					message: __('Microsoft Windows Phone SDK is missing the deploy command.') + '\n' +
						__('You will be unable to build Windows Phone apps.') + '\n' +
						__('You can install it from %s.', '__http://appcelerator.com/windowsphone__')
				});
				return next();
			}

			var preferredVersion = config.get('windows.wpsdk.selectedVersion');
			if (!results.sdks[preferredVersion] || !results.sdks[preferredVersion].supported) {
				preferredVersion = Object.keys(results.sdks).sort().filter(function (v) { return results.sdks[v].supported; }).shift();
			}
			if (preferredVersion) {
				results.sdks[preferredVersion].selected = true;
			}
			
			cache = results;
			emitter.emit('detected', results);
			callback(null, results);
		});
	});
	
	return emitter;
};
