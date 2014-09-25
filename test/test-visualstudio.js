/**
 * Tests windowslib's visualstudio module.
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

function checkVisualStudio(visualstudio) {
	should(visualstudio).be.an.Object;
	should(visualstudio).have.keys('version', 'registryKey', 'supported', 'wpsdk', 'path', 'selected');

//	should(visualstudio.visualstudioapp).be.a.String;
//	should(visualstudio.visualstudioapp).not.equal('');
//	should(fs.existsSync(visualstudio.visualstudioapp)).be.true;
//	should(fs.statSync(visualstudio.visualstudioapp).isDirectory()).be.true;

	should(visualstudio.path).be.a.String;
	should(visualstudio.path).not.equal('');
	should(fs.existsSync(visualstudio.path)).be.true;
	should(fs.statSync(visualstudio.path).isDirectory()).be.true;

	should(visualstudio.selected).be.a.Boolean;

	should(visualstudio.version).be.a.String;
	should(visualstudio.version).not.equal('');

//	should(visualstudio.build).be.a.String;
//	should(visualstudio.build).not.equal('');

	should([null, true, false, 'maybe']).containEql(visualstudio.supported);

//	should(visualstudio.sdks).be.an.Array;
//	visualstudio.sdks.forEach(function (s) {
//		should(s).be.a.String;
//		should(s).not.equal('');
//	});

	should(visualstudio.wpsdk).be.an.Object;
}

describe('visualstudio', function () {
	it('namespace should be an object', function () {
		should(windowslib.visualstudio).be.an.Object;
	});

	it('detect should find Visual Studio installations', function (done) {
		this.timeout(5000);
		this.slow(2000);

		windowslib.visualstudio.detect(function (err, results) {
			if (err) {
				return done(err);
			}

			should(results).be.an.Object;
			should(results).have.keys('selectedVisualstudio', 'visualstudio', 'issues');
			should(results.selectedVisualstudio).be.an.Object;
			should(results.visualstudio).be.an.Object;
			should(results.issues).be.an.Array;

			checkVisualStudio(results.selectedVisualstudio);

			Object.keys(results.visualstudio).forEach(function (ver) {
				checkVisualStudio(results.visualstudio[ver]);
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