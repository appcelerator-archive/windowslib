/**
 * Detects the Windows Phone development environment and its dependencies.
 *
 * @module lib/wp8
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
	minMSBuild = ">=4.0",
	visualstudioRequirement = ">=10 <=12",
	windowPhoneSDKRequirement = "8.0",
	cachedResults;

/**
 * Detects current Windows Phone environment.
 * @param {Object} config - The CLI config object
 * @param {Object} opts - Detect options
 * @param {Function} finished - Callback when detection is finished
 */
exports.detect = function detect(config, opts, finished) {
	if (process.platform != 'win32') return finished();

	opts || (opts = {});

	if (cachedResults && !opts.bypassCache) return finished(cachedResults);

	var results = {
		issues: []
	};

	async.parallel({
		'visualstudio': function (next) {
			var keyRegExp = /.+\\(\d+\.\d)_config$/i,
				valueRegExp = /\s(\w+)\s+(REG_\w+)\s+(.+)$/,
				possibleVersions = {},
				vsInfo = {};

			// scan the registry to find some Visual Studio installs
			async.parallel([
				'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\VisualStudio', // there should not be anything here because VS is currently 32-bit and we'll find it next
				'HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\VisualStudio', // this is where VS should be found because it's 32-bit
				'HKEY_CURRENT_USER\\Software\\Microsoft\\VisualStudio' // should be the same as the one above, but just to be safe
			].map(function (keyPath) {
				return function (next) {
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
				};
			}), function () {
				// if we didn't find any Visual Studios, then we're done
				if (!Object.keys(possibleVersions).length) {
					results.issues.push({
						id: 'WINDOWS_VISUAL_STUDIO_NOT_INSTALLED',
						type: 'error',
						message: __('Microsoft Visual Studio not found.') + '\n' +
							__('You will be unable to build Windows Phone or Windows Store apps.') + '\n' +
							__('You can install it from %s.', '__http://appcelerator.com/visualstudio__')
					});
					return next();
				}

				// fetch Visual Studio install information
				async.parallel(Object.keys(possibleVersions).map(function (configKey) {
					return function (next) {
						appc.subprocess.run('reg', ['query', configKey, '/v', '*'], function (code, out, err) {
							if (!code) {
								var ver = possibleVersions[configKey].version,
									info = vsInfo[ver] = {
										version: ver,
										registryKey: configKey,
										supported: appc.version.satisfies(ver, visualstudioRequirement, true),
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
		},

		'windowsphone': function (next) {
			var wpInfo = {};

			async.parallel([
				'HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Microsoft SDKs\\WindowsPhone', // probably nothing here
				'HKEY_LOCAL_MACHINE\\Software\\Wow6432Node\\Microsoft\\Microsoft SDKs\\WindowsPhone' // this is most likely where WPSDK will be found
			].map(function (keyPath) {
				return function (next) {
					appc.subprocess.run('reg', ['query', keyPath], function (code, out, err) {
						var keyRegExp = /.+\\(v\d+\.\d)$/;
						if (!code) {
							out.trim().split(/\r\n|\n/).forEach(function (key) {
								key = key.trim();
								var m = key.match(keyRegExp),
									version = m[1].replace(/^v/, '');
								if (m) {
									wpInfo[version] = {
										version: version,
										registryKey: keyPath + '\\' + m[1],
										supported: appc.version.satisfies(version, windowPhoneSDKRequirement, false), // no maybes
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
				if (!Object.keys(wpInfo).length) {
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
				async.parallel(Object.keys(wpInfo).map(function (ver) {
					return function (next) {
						appc.subprocess.run('reg', ['query', wpInfo[ver].registryKey + '\\Install Path', '/v', '*'], function (code, out, err) {
							if (code) {
								// bad key? either way, remove this version
								delete wpInfo[ver];
							} else {
								// get only the values we are interested in
								out.trim().split(/\r\n|\n/).forEach(function (line) {
									var parts = line.trim().split('   ').map(function (p) { return p.trim(); });
									if (parts.length == 3) {
										if (parts[0] == 'Install Path') {
											wpInfo[ver].path = parts[2];
											var deployCmd = path.join(parts[2], 'Tools', 'XAP Deployment', 'XapDeployCmd.exe');
											// check the old WP8 location
											if (fs.existsSync(deployCmd)) {
												wpInfo[ver].deployCmd = deployCmd;
											// check the new WP8.1 location
											} else if (fs.existsSync(deployCmd = path.join(parts[2], 'Tools', 'AppDeploy', 'AppDeployCmd.exe'))) {
												wpInfo[ver].deployCmd = deployCmd;
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
					if (Object.keys(wpInfo).every(function (v) { return !wpInfo[v].path; })) {
						results.issues.push({
							id: 'WINDOWS_PHONE_SDK_NOT_INSTALLED',
							type: 'error',
							message: __('Microsoft Windows Phone SDK not found.') + '\n' +
								__('You will be unable to build Windows Phone apps.') + '\n' +
								__('You can install it from %s.', '__http://appcelerator.com/windowsphone__')
						});
						return next();
					}

					if (Object.keys(wpInfo).every(function (v) { return !wpInfo[v].deployCmd; })) {
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
					if (!wpInfo[preferredVersion] || !wpInfo[preferredVersion].supported) {
						preferredVersion = Object.keys(wpInfo).sort().filter(function (v) { return wpInfo[v].supported; }).shift();
					}
					if (preferredVersion) {
						wpInfo[preferredVersion].selected = true;
					}

					next(null, wpInfo);
				});
			});
		}
	}, function (err, result) {
		appc.util.mix(results, result);

		// now that we've detected Visual Studio, we can try to find MSBuild
		var selectedVisualStudio = exports.getSelectedVisualStudio(results);

		async.parallel({
			'msbuild': function (next) {
				if (!selectedVisualStudio) return next();

				appc.subprocess.run('cmd', [ '/C', selectedVisualStudio.vcvarsall + ' && MSBuild /version' ], function (code, out, err) {
					var msbuildInfo = null;

					if (code) {
						results.issues.push({
							id: 'WINDOWS_MSBUILD_ERROR',
							type: 'error',
							message: __('Failed to run MSBuild.') + '\n' +
								__('This is most likely due to Visual Studio cannot find a suitable .NET framework.') + '\n' +
								__('Please install the latest .NET framework.')
						});
					} else {
						var chunks = out.trim().split(/\r\n\r\n|\n\n/);
						chunks.shift(); // strip off the first chunk

						msbuildInfo = {
							version: chunks.shift().split(/\r\n|\n/).pop().trim()
						};

						if (!appc.version.satisfies(msbuildInfo.version, minMSBuild)) {
							results.issues.push({
								id: 'WINDOWS_MSBUILD_TOO_OLD',
								type: 'error',
								message: __('The MSBuild version %s is too old.', msbuildInfo.version) + '\n' +
									__("Titanium requires .NET MSBuild '%s'.", minMSBuild) + '\n' +
									__('Please install the latest .NET framework.')
							});
						}
					}

					next(null, msbuildInfo);
				});
			},

			'devices': function (next) {
				if (!result.windowsphone) return next();

				async.each(Object.keys(result.windowsphone), function (version, callback) {
					var wpInfo = result.windowsphone[version];

					if (!wpInfo.deployCmd) return callback();

					appc.subprocess.run(wpInfo.deployCmd, '/EnumerateDevices', function (code, out, err) {
						if (err) {
							if (!results.issues.some(function (i) { return i.id == 'WINDOWS_PHONE_ENUMERATE_DEVICES_FAILED'; })) {
								results.issues.push({
									id: 'WINDOWS_PHONE_ENUMERATE_DEVICES_FAILED',
									type: 'error',
									message: __('Failed to enumerate Windows Phone devices.') + '\n' +
										__('Ensure that the Windows Phone SDK is properly installed.')
								});
							}
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

						callback();
					});
				}, next);
			},

			'powershell': function (next) {
				if (!selectedVisualStudio) return next();

				var args = [
						'&&',
						config.get('windows.executables.powershell', 'powershell'),
						'-command',
						path.resolve(__dirname, '..', '..', '..', 'node_modules', 'titanium-sdk', 'bin', 'test_permissions.ps1')
					],
					child = spawn(selectedVisualStudio.vcvarsall, args, {
						cwd: path.join(selectedVisualStudio.path, 'VC')
					}),
					timer,
					errored = false;

				child.stdout.on('data', function (data) {
					if (/success/i.test(data.toString())) {
						clearTimeout(timer);
						timer = setTimeout(function () {
							child.kill('SIGTERM');
						}, 250);
					}
				});
				child.stderr.on('data', function (data) {
					// on Windows 7, PowerShell doesn't like to quit properly,
					// so we watch stderr and force ourselves to quit
					if (/exception/i.test(data.toString())) {
						clearTimeout(timer);
						errored = true;
						timer = setTimeout(function () {
							child.kill('SIGTERM');
						}, 250);
					}
				});

				child.on('close', function (code) {
					if (errored || code) {
						results.issues.push({
							id: 'WINDOWS_PHONE_POWERSHELL_SCRIPTS_DISABLED',
							type: 'error',
							message: __('Executing PowerShell scripts is disabled.') + '\n' +
								__('In order to build Windows Hybrid apps for the Windows Store (winstore), you must change the execution policy to allow PowerShell scripts.') + '\n' +
								__('To enable PowerShell scripts, search __PowerShell__ in the __Start__ menu, right click the icon, select __Run as administrator__, then run:') + '\n' +
								'    __Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser__'
						});
					}
					next(null, { enabled: !errored && !code });
				});
			}
		}, function (err, result) {
			finished(cachedResults = appc.util.mix(results, result));
		});
	});
};

exports.getSelectedVisualStudio = function getSelectedVisualStudio(env) {
	if (env.visualstudio) {
		return env.visualstudio[Object.keys(env.visualstudio).sort().filter(function (v) {
			return env.visualstudio[v].selected;
		}).pop()];
	}
};