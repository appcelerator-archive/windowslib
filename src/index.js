// istanbul ignore if
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

export { default as options } from './options';
export { default as os } from './os';

import * as certs from './certs';
import * as sdk from './windows-sdk';
import * as vs from './visual-studio';
import * as vswhere from './vswhere';

export {
	certs,
	sdk,
	vs,
	vswhere
};
