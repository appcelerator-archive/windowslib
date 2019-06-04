import path from 'path';

import { sdk } from '../dist/index';

describe('Windows SDK', () => {
	describe('SDK', () => {
		it('should error if options is invalid', () => {
			expect(() => {
				new sdk.SDK();
			}).to.throw(TypeError, 'Expected options to be an object');

			expect(() => {
				new sdk.SDK(null);
			}).to.throw(TypeError, 'Expected options to be an object');

			expect(() => {
				new sdk.SDK('');
			}).to.throw(TypeError, 'Expected options to be an object');
		});

		it('should error if directory is invalid', () => {
			expect(() => {
				new sdk.SDK({});
			}).to.throw(TypeError, 'Expected SDK directory to be a valid string');

			expect(() => {
				new sdk.SDK({ dir: null });
			}).to.throw(TypeError, 'Expected SDK directory to be a valid string');

			expect(() => {
				new sdk.SDK({ dir: '' });
			}).to.throw(TypeError, 'Expected SDK directory to be a valid string');
		});

		it('should error if version is invalid', () => {
			expect(() => {
				new sdk.SDK({ dir: 'foo' });
			}).to.throw(Error, 'Expected version to be a valid string');

			expect(() => {
				new sdk.SDK({ dir: 'foo', version: null });
			}).to.throw(Error, 'Expected version to be a valid string');

			expect(() => {
				new sdk.SDK({ dir: 'foo', version: '' });
			}).to.throw(Error, 'Expected version to be a valid string');
		});

		it('should error if unable to find the windows.h', () => {
			expect(() => {
				new sdk.SDK({
					dir: path.join(__dirname, 'mocks', 'empty'),
					version: '1.2.3'
				});
			}).to.throw(Error, 'Unable to find "Windows.h" for SDK revision');
		});

		it('should error if unable to find the platform directory', () => {
			expect(() => {
				new sdk.SDK({
					dir: path.join(__dirname, 'mocks', 'sdk', 'bad-no-platform'),
					version: '1.2.3'
				});
			}).to.throw(Error, 'Unable to find the platform directory for SDK revision "1.2.3"');
		});

		it('should error if platform is missing a Platform.xml file', () => {
			expect(() => {
				new sdk.SDK({
					dir: path.join(__dirname, 'mocks', 'sdk', 'bad-incomplete-platform'),
					version: '1.2.3'
				});
			}).to.throw(Error, 'Unable to find the "Platform.xml" file for SDK revision "1.2.3"');
		});

		it('should error if platform has bad Platform.xml file', () => {
			expect(() => {
				new sdk.SDK({
					dir: path.join(__dirname, 'mocks', 'sdk', 'bad-platform-xml'),
					version: '1.2.3'
				});
			}).to.throw(Error, 'Invalid "Platform.xml" file for SDK revision "1.2.3"');
		});

		it('should error if platform version does not match specified version', () => {
			expect(() => {
				new sdk.SDK({
					dir: path.join(__dirname, 'mocks', 'sdk', 'bad-platform-version'),
					version: '1.2.3'
				});
			}).to.throw(Error, 'Version "10.0.17763.0" in "Platform.xml" does not match specified version "1.2.3"');
		});

		it('should find a valid SDK', () => {
			const result = new sdk.SDK({
				dir: path.join(__dirname, 'mocks', 'sdk', 'good'),
				version: '10.0.17763.0'
			});

			const binDir = path.join(__dirname, 'mocks', 'sdk', 'good', 'bin', '10.0.17763.0');

			expect(result).to.deep.equal({
				binDir,
				executables: {
					makecert: {
						arm: path.join(binDir, 'arm', 'makecert.exe'),
						arm64: path.join(binDir, 'arm64', 'makecert.exe'),
						x64: path.join(binDir, 'x64', 'makecert.exe'),
						x86: path.join(binDir, 'x86', 'makecert.exe')
					},
					pvk2pfx: {
						arm: path.join(binDir, 'arm', 'pvk2pfx.exe'),
						arm64: path.join(binDir, 'arm64', 'pvk2pfx.exe'),
						x64: path.join(binDir, 'x64', 'pvk2pfx.exe'),
						x86: path.join(binDir, 'x86', 'pvk2pfx.exe')
					}
				},
				includeDir: path.join(__dirname, 'mocks', 'sdk', 'good', 'Include', '10.0.17763.0'),
				majorVersion: 10,
				minVSVersion: '15.0.25909.02',
				name: 'Windows 10, version 1809',
				platformsDir: path.join(__dirname, 'mocks', 'sdk', 'good', 'Platforms', 'UAP', '10.0.17763.0'),
				version: '10.0.17763.0'
			});
		});

		it('should fallback to a default name and min vs version', () => {
			const result = new sdk.SDK({
				dir: path.join(__dirname, 'mocks', 'sdk', 'good-no-name'),
				minVSVersion: '4.5.6',
				name: 'foo',
				version: '10.0.17763.0'
			});

			const binDir = path.join(__dirname, 'mocks', 'sdk', 'good-no-name', 'bin', '10.0.17763.0');

			expect(result).to.deep.equal({
				binDir,
				executables: {
					makecert: {
						arm: path.join(binDir, 'arm', 'makecert.exe'),
						arm64: path.join(binDir, 'arm64', 'makecert.exe'),
						x64: path.join(binDir, 'x64', 'makecert.exe'),
						x86: path.join(binDir, 'x86', 'makecert.exe')
					},
					pvk2pfx: {
						arm: path.join(binDir, 'arm', 'pvk2pfx.exe'),
						arm64: path.join(binDir, 'arm64', 'pvk2pfx.exe'),
						x64: path.join(binDir, 'x64', 'pvk2pfx.exe'),
						x86: path.join(binDir, 'x86', 'pvk2pfx.exe')
					}
				},
				includeDir: path.join(__dirname, 'mocks', 'sdk', 'good-no-name', 'Include', '10.0.17763.0'),
				majorVersion: 10,
				minVSVersion: '4.5.6',
				name: 'foo',
				platformsDir: path.join(__dirname, 'mocks', 'sdk', 'good-no-name', 'Platforms', 'UAP', '10.0.17763.0'),
				version: '10.0.17763.0'
			});
		});
	});

	describe('detectSDKs()', () => {
		it('should error if directory does not contain an SDK', () => {
			expect(() => {
				sdk.detectSDKs(path.join(__dirname, 'mocks', 'empty'));
			}).to.throw(Error, 'Directory does not contain an "SDKManifest.xml" file');
		});

		it('should error if directory contains a bad manifest', () => {
			const dir = path.join(__dirname, 'mocks', 'sdk', 'bad-manifest');
			expect(() => {
				sdk.detectSDKs(dir);
			}).to.throw(Error, `Unable to read Windows SDK manifest: ${path.join(dir, 'SDKManifest.xml')}`);
		});

		it('should error if SDK does not have an "Include" directory', () => {
			expect(() => {
				sdk.detectSDKs(path.join(__dirname, 'mocks', 'sdk', 'bad-no-include'));
			}).to.throw(Error, 'Directory does not contain an "Include" directory');
		});

		it('should find a valid SDK', () => {
			const results = sdk.detectSDKs(path.join(__dirname, 'mocks', 'sdk', 'good'));
			expect(results).to.be.an('array');

			const binDir = path.join(__dirname, 'mocks', 'sdk', 'good', 'bin', '10.0.17763.0');

			expect(results[0]).to.deep.equal({
				binDir,
				executables: {
					makecert: {
						arm: path.join(binDir, 'arm', 'makecert.exe'),
						arm64: path.join(binDir, 'arm64', 'makecert.exe'),
						x64: path.join(binDir, 'x64', 'makecert.exe'),
						x86: path.join(binDir, 'x86', 'makecert.exe')
					},
					pvk2pfx: {
						arm: path.join(binDir, 'arm', 'pvk2pfx.exe'),
						arm64: path.join(binDir, 'arm64', 'pvk2pfx.exe'),
						x64: path.join(binDir, 'x64', 'pvk2pfx.exe'),
						x86: path.join(binDir, 'x86', 'pvk2pfx.exe')
					}
				},
				includeDir: path.join(__dirname, 'mocks', 'sdk', 'good', 'Include', '10.0.17763.0'),
				majorVersion: 10,
				minVSVersion: '15.0.25909.02',
				name: 'Windows 10, version 1809',
				platformsDir: path.join(__dirname, 'mocks', 'sdk', 'good', 'Platforms', 'UAP', '10.0.17763.0'),
				version: '10.0.17763.0'
			});
		});
	});

	describe('getWindowsSDKs()', () => {
		it('should detect all installed Windows SDKs', async function () {
			this.timeout(5000);
			this.slow(4000);

			const sdks = await sdk.getWindowsSDKs(true);
			expect(sdks).to.be.an('array');

			for (const sdk of sdks) {
				expect(sdk.version).to.not.equal('');
			}
		});
	});
});
