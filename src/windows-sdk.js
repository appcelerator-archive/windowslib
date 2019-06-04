import fs from 'fs';
import path from 'path';
import winreglib from 'winreglib';

import { cache } from 'appcd-util';
import { DOMParser } from 'xmldom';
import { expandPath } from 'appcd-path';
import { isDir, isFile } from 'appcd-fs';

/**
 * Known Windows Registry keys that contain information about installed Windows SDKs.
 * @type {Array.<String>}
 */
export const registryKeys = [
	'HKLM\\Software\\Microsoft\\Microsoft SDKs\\Windows',
	'HKLM\\Software\\Wow6432Node\\Microsoft\\Microsoft SDKs\\Windows'
];

/**
 * The default path where Windows SDKs are installed.
 * @type {String}
 */
export const defaultPath = '%ProgramFiles(x86)%\\Windows Kits';

/**
 * Encapsulates a Windows SDK install.
 */
export class SDK {
	/**
	 * Scans the specified `sdkDir` for a `revision` and discovers it's capabilities
	 *
	 * @param {Object} opts - Various options.
	 * @param {String} opts.dir - The path to the Windows SDK we're scanning for the specified
	 * `version`.
	 * @param {String} [opts.minVSVersion] - The default minimum supported Visual Studio version
	 * if not defined in the `Platform.xml`.
	 * @param {String} [opts.name] - The default name for this SDK if not defined in the
	 * `Platform.xml`.
	 * @param {String} opts.version - The revision name to scan for.
	 * @access public
	 */
	constructor(opts) {
		if (!opts || typeof opts !== 'object') {
			throw new TypeError('Expected options to be an object');
		}

		const { dir, minVSVersion, name, version } = opts;

		if (!dir || typeof dir !== 'string') {
			throw new TypeError('Expected SDK directory to be a valid string');
		}

		if (typeof version !== 'string' || !version) {
			throw new TypeError('Expected version to be a valid string');
		}

		this.majorVersion = parseInt(version);
		this.version      = version;
		this.binDir       = path.join(dir, 'bin', version);
		this.includeDir   = path.join(dir, 'Include', version);
		this.platformsDir = path.join(dir, 'Platforms', 'UAP', version);
		this.executables  = {};

		if (!isFile(path.join(this.includeDir, 'um', 'Windows.h'))) {
			throw new Error(`Unable to find "Windows.h" for SDK revision "${version}"`);
		}

		if (!isDir(this.platformsDir)) {
			throw new Error(`Unable to find the platform directory for SDK revision "${version}"`);
		}

		const platformXmlFile = path.join(this.platformsDir, 'Platform.xml');
		if (!isFile(platformXmlFile)) {
			throw new Error(`Unable to find the "Platform.xml" file for SDK revision "${version}"`);
		}

		const platformXML = new DOMParser({
			errorHandler: {
				warning() {},
				error() {}
			}
		}).parseFromString(fs.readFileSync(platformXmlFile, 'utf8'), 'text/xml');

		if (!platformXML) {
			throw new Error(`Invalid "Platform.xml" file for SDK revision "${version}"`);
		}

		const props = getProps(platformXML, 'ApplicationPlatform');

		if (props.version !== this.version) {
			throw new Error(`Version "${props.version}" in "Platform.xml" does not match specified version "${this.version}"`);
		}

		this.name = props.friendlyName || name;

		const minVS = platformXML.getElementsByTagName('MinimumVisualStudioVersion');
		this.minVSVersion = minVS && minVS[0] && minVS[0].firstChild && minVS[0].firstChild.data || minVSVersion || null;

		// find executables
		const architectures = [ 'arm', 'arm64', 'x86', 'x64' ];
		const executables = [ 'makecert', 'pvk2pfx', 'WinAppDeployCmd' ];
		for (const exe of executables) {
			this.executables[exe] = {};
			for (const arch of architectures) {
				const file = path.join(this.binDir, arch, `${exe}.exe`);
				this.executables[exe][arch] = isFile(file) ? file : null;
			}
		}
	}
}

export default SDK;

/**
 * Scans a single directory for SDKs.
 *
 * @param {String} dir - The directory to scan for SDKs.
 * @returns {Array.<SDK>}
 */
export function detectSDKs(dir) {
	const sdkManifestFile = path.join(dir, 'SDKManifest.xml');

	if (!isFile(sdkManifestFile)) {
		throw new Error('Directory does not contain an "SDKManifest.xml" file');
	}

	const sdkManifest = new DOMParser({
		errorHandler: {
			warning() {},
			error() {}
		}
	}).parseFromString(fs.readFileSync(sdkManifestFile, 'utf8'), 'text/xml');

	if (!sdkManifest) {
		throw new Error(`Unable to read Windows SDK manifest: ${sdkManifestFile}`);
	}

	const includeDir = path.join(dir, 'Include');
	if (!isDir(includeDir)) {
		throw new Error('Directory does not contain an "Include" directory');
	}

	const props = getProps(sdkManifest, 'FileList');
	const results = [];

	for (const version of fs.readdirSync(includeDir)) {
		try {
			results.push(new SDK({
				dir,
				minVSVersion: props.MinVSVersion,
				name: props.DisplayName,
				version
			}));
		} catch (e) {
			// squelch
		}
	}

	return results;
}

/**
 * Scans all directories for installed Windows SDKs.
 *
 * @param {Boolean} [force=false] - When `true`, bypasses cache and forces redetection.
 * @returns {Promise.<Array.<SDK>>}
 */
export function getWindowsSDKs(force) {
	return cache('windowslib:sdk', force, () => {
		const verRegExp = /^v?\d+/;
		const searchPaths = new Set();
		let results = [];

		const kitsDir = expandPath(defaultPath);
		if (isDir(kitsDir)) {
			for (const filename of fs.readdirSync(kitsDir)) {
				if (verRegExp.test(filename)) {
					const dir = path.join(kitsDir, filename);
					searchPaths.add(dir);
					try {
						results = results.concat(detectSDKs(dir));
					} catch (e) {
						// squelch
					}
				}
			}
		}

		for (const key of registryKeys) {
			try {
				for (const ver of winreglib.list(key).subkeys) {
					try {
						const dir = expandPath(winreglib.get(`${key}\\${ver}`, 'InstallationFolder'));
						if (!searchPaths.has(dir)) {
							searchPaths.add(dir);
							results = results.concat(detectSDKs(results, dir));
						}
					} catch (e) {
						// squelch
					}
				}
			} catch (e) {
				// squelch
			}
		}

		return results;
	});
}

/**
 * Gets the attributes for a specific DOM element.
 *
 * @param {Object} el - The parent DOM element to look for the `tag`.
 * @param {String} tag - The name of the tag to get the attributes.
 * @returns {Object}
 */
function getProps(el, tag) {
	const props = {};
	const elems = el.getElementsByTagName(tag);
	for (let i = 0, len = elems.length; i < len; i++) {
		const el = elems[i];
		for (let j = 0, len2 = el.attributes.length; j < len2; j++) {
			const attr = el.attributes.item(j);
			props[attr.name] = attr.value.trim();
		}
	}
	return props;
}
