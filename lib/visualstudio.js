/**
 * Detects VisualStudio installs and their Windows Phone SDKs.
 *
 * @module visualstudio
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * Copyright (c) 2010-2014 Digital Bazaar, Inc.
 * {@link https://github.com/digitalbazaar/forge}
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const
	appc = require('node-appc'),
	async = require('async'),
	env = require('./env'),
	EventEmitter = require('events').EventEmitter,
	fs = require('fs'),
	path = require('path'),
	__ = appc.i18n(__dirname).__,
	VS_REQUIREMENT = ">=10 <=12";

var cache;

/**
 * Detects VisualStudio installations.
 *
 * @param {Object} [options] - An object containing various settings.
 * @param {Boolean} [options.bypassCache=false] - When true, re-detects all Visual Studio installations.
 * @param {String|Array<String>} [options.searchPath] - One or more path to scan for Visual Studio installations.
 * @param {String} [options.minWindowsPhoneVersion] - The minimum Windows Phone SDK to detect.
 * @param {String} [options.supportedVersions] - A string with a version number or range to check if a Visual Studio install is supported.
 * @param {Function} [callback(err, results)] - A function to call with the Visual Studio information.
 *
 * @emits module:visualstudio#detected
 * @emits module:visualstudio#error
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

	var searchPaths = [
			'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\VisualStudio', // there should not be anything here because VS is currently 32-bit and we'll find it next
			'HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\VisualStudio', // this is where VS should be found because it's 32-bit
			'HKEY_CURRENT_USER\\Software\\Microsoft\\VisualStudio' // should be the same as the one above, but just to be safe
		],
		results = {
			selectedVisualStudio: null,
			xcode: {},
			issues: []
		},
		selectedVisualStudioPath = null,
		keyRegExp = /.+\\(\d+\.\d)_config$/i,
		valueRegExp = /\s(\w+)\s+(REG_\w+)\s+(.+)$/,
		possibleVersions = {},
		vsInfo = {};

		
		async.series([
			// scan the registry to find some Visual Studio installs
			function (next) {
				[searchPaths].map(function (keyPath) {
					appc.subprocess.run('reg', ['query', keyPath], function (code, out, err) {
						if (!code) {
							out.trim().split(/\r\n|\n/).forEach(function (configKey) {
								configKey = configKey.trim();
								var m = configKey.match(keyRegExp);
								if (m) {
									possibleVersions[configKey] = {
										version: m[1],
										configKey: configKey
									};
								}
							});
						}
						next();
					});
				});
			}
		], function () {
			// fetch Visual Studio install information
			async.parallel(Object.keys(possibleVersions).map(function (configKey) {
				return function (next) {
					appc.subprocess.run('reg', ['query', configKey, '/v', '*'], function (code, out, err) {
						if (!code) {
							var ver = possibleVersions[configKey].version,
								info = vsInfo[ver] = {
									version: ver,
									registryKey: configKey,
									supported: appc.version.satisfies(ver, VS_REQUIREMENT, true),
									vcvarsall: null,
									wpsdk: null,
									selected: false
								};

							// get only the values we are interested in
							out.trim().split(/\r\n|\n/).forEach(function (line) {
								var parts = line.trim().split('   ').map(function (p) { return p.trim(); });
								if (parts.length == 3) {
									if (parts[0] == 'CLR Version') {
										info.clrVersion = parts[2];
									} else if (parts[0] == 'ShellFolder') {
										info.path = parts[2];
									}
								}
							});

							// verify that this Visual Studio actually exists
							if (info.path && fs.existsSync(info.path) && fs.existsSync(path.join(info.path, 'Common7', 'IDE', 'devenv.exe'))) {
								// get the vcvarsall script
								var vcvarsall = path.join(info.path, 'VC', 'vcvarsall.bat');
								if (fs.existsSync(vcvarsall)) {
									info.vcvarsall = vcvarsall;
								}

								// detect all Windows Phone SDKs
								var wpsdkDir = path.join(info.path, 'VC', 'WPSDK');
								fs.existsSync(wpsdkDir) && fs.readdirSync(wpsdkDir).forEach(function (ver) {
									var vcvarsphone = path.join(wpsdkDir, ver, 'vcvarsphoneall.bat');
									if (fs.existsSync(vcvarsphone) && /^wp\d+$/i.test(ver)) {
										// we found a windows phone sdk!
										var name = (parseInt(ver.replace(/^wp/i, '')) / 10).toFixed(1);
										info.wpsdk || (info.wpsdk = {});
										info.wpsdk[name] = {
											vcvarsphone: vcvarsphone
										};
									}
								});
							}
						}

						if (info.vcvarsall) {
							appc.subprocess.getRealName(info.vcvarsall, function (err, file) {
								if (!err) {
									info.vcvarsall = file
								}
								next();
							});
						} else {
							next();
						}
					});
				};
			}), function () {
				// double check if we didn't find any Visual Studios, then we're done
				if (!Object.keys(vsInfo).length) {
					results.issues.push({
						id: 'WINDOWS_VISUAL_STUDIO_NOT_INSTALLED',
						type: 'error',
						message: __('Microsoft Visual Studio not found.') + '\n' +
							__('You will be unable to build Windows Phone or Windows Store apps.') + '\n' +
							__('You can install it from %s.', '__http://appcelerator.com/visualstudio__')
					});
					return next();
				}

				var preferredVersion = config.get('windows.visualstudio.selectedVersion');
				vsInfo[preferredVersion && vsInfo[preferredVersion] ? preferredVersion : Object.keys(vsInfo).sort().pop()].selected = true;

				next(null, vsInfo);
			});
		});

	cache = results;
	emitter.emit('detected', results);
	callback(null, results);

	return emitter;
};

exports.getSelectedVisualStudio = function getSelectedVisualStudio(env) {
	if (env.visualstudio) {
		return env.visualstudio[Object.keys(env.visualstudio).sort().filter(function (v) {
			return env.visualstudio[v].selected;
		}).pop()];
	}
};
