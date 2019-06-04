import path from 'path';

import { cache } from 'appcd-util';
import { getVSWhere } from './vswhere';

/**
 * A map of known Visual Studio keys to filter parameters used for watching for changes.
 * @type {Object.<String>}
 */
export const registryKeys = {
	'HKCU\\Software\\Microsoft\\VisualStudio':              {},
	'HKCU\\Software\\Microsoft\\VSCommon':                  {},
	'HKLM\\Software\\RegisteredApplications':               { values: /^VisualStudio.+/ },
	'HKLM\\Software\\Microsoft\\VisualStudio':              {},
	'HKLM\\Software\\WOW6432Node\\Microsoft':               { subkeys: /^VisualStudio.+/ },
	'HKLM\\Software\\WOW6432Node\\Microsoft\\VisualStudio': {}
};

/**
 * The default path where Windows SDKs are installed.
 * @type {String}
 */
export const defaultPath = '%ProgramFiles(x86)%\\Microsoft Visual Studio';

/**
 * Encapsulates information for a specific Visual Studio installation.
 */
export class VisualStudio {
	/**
	 * Parses the output from _vswhere_.
	 *
	 * @param {Object} info - The Visual Studio info returned by _vswhere_.
	 * @access public
	 */
	constructor(info) {
		if (typeof info !== 'object') {
			throw new TypeError('Expected info to be an object');
		}

		if (!info.displayName || typeof info.displayName !== 'string') {
			throw new TypeError('Expected display name to be a string');
		}

		if (!info.installationPath || typeof info.installationPath !== 'string') {
			throw new TypeError('Expected installation path to be a string');
		}

		if (!info.installationVersion || typeof info.installationVersion !== 'string') {
			throw new TypeError('Expected installation version to be a string');
		}

		this.complete  = info.isComplete;
		this.msbuild   = info.msbuild;
		this.name      = info.displayName;
		this.path      = info.installationPath;
		this.productId = info.productId;
		this.version   = info.installationVersion;
		this.vsdevcmd  = path.join(this.path, 'Common7', 'Tools', 'VsDevCmd.bat');
	}
}

export default VisualStudio;

/**
 * Detects installed Visual Studios, then caches the results. By default, only complete
 * Visual Studio installations are returned.
 *
 * @param {Object} [opts] - Various options.
 * @param {Boolean} [opts.all=false] - When `true`, returns all Visual Studio installations
 * regardless if they are "complete".
 * @param {Boolean} [opts.force=false] - When `true`, bypasses cache and forces redetection.
 * @returns {Promise<Array.<VisualStudio>>}
 */
export function getVisualStudios({ all, force } = {}) {
	return cache('windowslib:visualstudio', force, async () => {
		const results = [];
		const vswhere = await getVSWhere(force);

		if (vswhere) {
			// detect the Visual Studio installations
			for (const info of await vswhere.query()) {
				try {
					// detect MSBuild
					info.msbuild = (await vswhere.query({
						requires: 'Microsoft.Component.MSBuild',
						find:     'MSBuild\\**\\Bin\\MSBuild.exe',
						version:  info.installationVersion
					}))[0];

					if (all || info.isComplete) {
						results.push(new VisualStudio(info));
					}
				} catch (e) {
					// squelch
				}
			}
		}

		return results;
	});
}
