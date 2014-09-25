/**
 * Tests windowslib's device module.
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const
	appc = require('node-appc'),
	exec = require('child_process').exec,
	fs = require('fs'),
	windowslib = require('..'),
	path = require('path');

describe('device', function () {
	it('namespace should be an object', function () {
		should(windowslib.device).be.an.Object;
	});

	it('detect Windows Phone devices', function (done) {
		this.timeout(5000);
		this.slow(2000);

		windowslib.device.detect(function (err, results) {
			if (err) {
				return done(err);
			}

			should(results).be.an.Object;
			should(results).have.keys('devices', 'issues');

			should(results.devices).be.an.Array;
			results.devices.forEach(function (dev) {
				should(dev).be.an.Object;
				should(dev).have.keys('udid', 'name', 'buildVersion', 'cpuArchitecture', 'deviceClass', 'deviceColor',
					'hardwareModel', 'modelNumber', 'productType', 'productVersion', 'serialNumber');

				should(dev.udid).be.a.String;
				should(dev.udid).not.equal('');

				should(dev.name).be.a.String;
				should(dev.name).not.equal('');

				should(dev.buildVersion).be.a.String;
				should(dev.buildVersion).not.equal('');

				should(dev.cpuArchitecture).be.a.String;
				should(dev.cpuArchitecture).not.equal('');

				should(dev.deviceClass).be.a.String;
				should(dev.deviceClass).not.equal('');

				should(dev.deviceColor).be.a.String;
				should(dev.deviceColor).not.equal('');

				should(dev.hardwareModel).be.a.String;
				should(dev.hardwareModel).not.equal('');

				should(dev.modelNumber).be.a.String;
				should(dev.modelNumber).not.equal('');

				should(dev.productType).be.a.String;
				should(dev.productType).not.equal('');

				should(dev.productVersion).be.a.String;
				should(dev.productVersion).not.equal('');

				should(dev.serialNumber).be.a.String;
				should(dev.serialNumber).not.equal('');
			});

			should(results.issues).be.an.Array;
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