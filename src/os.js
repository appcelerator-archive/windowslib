import { spawnSync } from 'child_process';

/**
 * Initialize the name and version of the operating system.
 */
class OS {
	_name = 'Windows';
	_version = '';

	load() {
		const result = spawnSync('wmic', [ 'os', 'get', 'Caption,Version' ]);
		if (!result.status) {
			const s = result.stdout.toString().split('\n')[1].split(/ {2,}/);
			if (s.length > 0) {
				this._name = s[0].trim() || this._name;
			}
			if (s.length > 1) {
				this._version = s[1].trim() || this._version;
			}
			this.ready = true;
		}
	}

	get name() {
		this.ready || this.load();
		return this._name;
	}

	get version() {
		this.ready || this.load();
		return this._version;
	}
}

export default new OS();
