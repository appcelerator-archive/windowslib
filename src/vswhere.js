import fs from 'fs';
import options from './options';
import path from 'path';

import { arrayify, cache, get } from 'appcd-util';
import { expandPath } from 'appcd-path';
import { isDir, isFile } from 'appcd-fs';
import { run } from 'appcd-subprocess';

export const defaultPath = '%ProgramFiles(x86)%\\Microsoft Visual Studio\\Installer\\vswhere.exe';

const exeRegExp = /.+\.exe$/;

/**
 * Wraps the `vswhere` executable.
 */
export class VSWhere {
	/**
	 * Validates and initializes the vswhere executable.
	 *
	 * @param {String} exe - The path to the `vswhere` executable.
	 * @access public
	 */
	constructor(exe) {
		if (typeof exe !== 'string' || !exe) {
			throw new TypeError('Expected executable to be a valid string');
		}

		if (!exeRegExp.test(exe)) {
			throw Error('Executable must have a .exe extension');
		}

		if (!isFile(exe)) {
			throw Error('Executable does not exist or is not a file');
		}

		this.exe = exe;
	}

	/**
	 * Executes _vswhere_ with the provided arguments.
	 *
	 * @param {Object} [opts] - Various options.
	 * @param {String|Array.<String>} [opts.requires] - One or more required components to filter by.
	 * @param {String} [opts.find] - A file pattern to search for within the found product(s).
	 * @param {String} [opts.version] - A product version to filter by.
	 * @returns {Promise.<Array.<Object|String>>}
	 * @access public
	 */
	async query(opts = {}) {
		if (!opts || typeof opts !== 'object') {
			throw new TypeError('Expected options to be an object');
		}

		const args = [ '-nologo', '-format', 'json', '-utf8' ];
		const { requires, find, version } = opts;

		if (requires) {
			args.push('-requires', ...arrayify(requires, true));
		}
		if (find) {
			args.push('-find', find);
		}
		if (version) {
			args.push('-version', version[0] === '[' ? version : `[${version}]`);
		}

		const result = await run(this.exe, args);
		if (result.code) {
			throw new Error(`Failed to run vswhere: ${result.stderr.toString().trim()} (code ${result.code})`);
		}

		return JSON.parse(result.stdout);
	}
}

export default VSWhere;

/**
 * Detects installed VSWhere executable, caching and returning the result
 *
 * @param {Boolean} [force=false] - When `true`, bypasses cache and forces redetection.
 * @returns {Promise<VSWhere>}
 */
export function getVSWhere(force) {
	return cache('windowslib:vswhere', force, () => {
		const searchPaths = arrayify(get(options, 'vswhere.searchPaths') || defaultPath, true);

		for (let exeOrDir of searchPaths) {
			exeOrDir = expandPath(exeOrDir);
			if (exeRegExp.test(exeOrDir)) {
				try {
					return new VSWhere(exeOrDir);
				} catch (e) {
					// squelch
				}
			} else if (isDir(exeOrDir)) {
				for (const filename of fs.readdirSync(exeOrDir)) {
					try {
						return new VSWhere(path.join(exeOrDir, filename));
					} catch (e) {
						// squelch
					}
				}
			}
		}

		return null;
	});
}
