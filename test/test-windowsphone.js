/**
 * Tests windowslib's windowsphone module.
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const
	fs = require('fs'),
	windowslib = require('..');

function checkSDK(sdk) {
	should(sdk).be.an.Object;
	should(sdk).have.keys('registryKey', 'path', 'selected', 'version', 'deployCmd', 'supported');//, 'devices');

	should(sdk.registryKey).be.a.String;
	should(sdk.registryKey).not.equal('');

	should(sdk.path).be.a.String;
	should(sdk.path).not.equal('');
	should(fs.existsSync(sdk.path)).be.true;
	should(fs.statSync(sdk.path).isDirectory()).be.true;

	should(sdk.selected).be.a.Boolean;

	should(sdk.version).be.a.String;
	should(sdk.version).not.equal('');

	should(sdk.deployCmd).be.a.String;
	should(sdk.deployCmd).not.equal('');

	should([null, true, false, 'maybe']).containEql(sdk.supported);

//	should(sdk.devices).be.an.Array;
//	sdk.devices.forEach(function (s) {
//		should(s).be.a.String;
//		should(s).not.equal('');
//	});
}

describe('windowsphone', function () {
	it('namespace should be an object', function () {
		should(windowslib.windowsphone).be.an.Object;
	});

	it('detect should find Windows Phone SDK installations', function (done) {
		this.timeout(5000);
		this.slow(2000);

		windowslib.windowsphone.detect(function (err, results) {
			if (err) {
				return done(err);
			}

			should(results).be.an.Object;
			should(results).have.keys('sdks', 'issues');
			should(results.sdks).be.an.Object;
			should(results.issues).be.an.Array;

			Object.keys(results.sdks).forEach(function (ver) {
				checkSDK(results.sdks[ver]);
			});

			results.issues.forEach(function (issue) {
				should(issue).be.an.Object;
				should(issue).have.keys('id', 'type', 'message');
				should(issue.id).be.a.String;
				should(issue.type).be.a.String;
				should(issue.type).match(/^info|warning|error$/);
				should(issue.message).be.a.String;
			});

			done();
		});
	});
});