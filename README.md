# Windows Phone Utility Library

This is a library of utilities for dealing programmatically with Windows Phone applications,
used namely for tools like [Hyperloop](https://github.com/appcelerator/hyperloop)
and [Titanium](https://github.com/appcelerator/titanium).

windowslib supports Visual Studio XXX.

[![Build Status](https://travis-ci.org/appcelerator/windowslib.svg?branch=master)](https://travis-ci.org/appcelerator/windowslib) [![NPM version](https://badge.fury.io/js/windowslib.svg)](http://badge.fury.io/js/windowslib)

[![NPM](https://nodei.co/npm/windowslib.png?downloads=true&stars=true)](https://nodei.co/npm/windowslib/)

## Installation

From NPM:

	npm install windowslib

From GitHub:

	npm install git://github.com/appcelerator/windowslib.git

## Examples

### Detect all the connected Windows Phone devices:

```javascript
var windowslib = require('windowslib');

windowslib.device.detect(function (err, devices) {
	if (err) {
		console.error(err);
	} else {
		console.log(devices);
	}
});
```

### Install an application on device

```javascript
var deviceUDID = null; // string or null to pick first device

windowslib.device.install(deviceUDID, '/path/to/name.app', 'com.company.appname')
	.on('installed', function () {
		console.log('App successfully installed on device');
	})
	.on('appStarted', function () {
		console.log('App has started');
	})
	.on('log', function (msg) {
		console.log('[LOG] ' + msg);
	})
	.on('appQuit', function () {
		console.log('App has quit');
	})
	.on('error', function (err) {
		console.error(err);
	});
```

### Launch the Windows Phone Simulator

```javascript
windowslib.simulator.launch(null, function (err, simHandle) {
	console.log('Simulator launched');
	windowslib.simulator.stop(simHandle, function () {
		console.log('Simulator stopped');
	});
});
```

### Launch, install, and run an application on simulator

```javascript
var simUDID = null; // string or null to pick a simulator

windowslib.simulator.launch(simUDID, {
		appPath: '/path/to/name.app'
	})
	.on('launched', function (msg) {
		console.log('Simulator has launched');
	})
	.on('appStarted', function (msg) {
		console.log('App has started');
	})
	.on('log', function (msg) {
		console.log('[LOG] ' + msg);
	})
	.on('error', function (err) {
		console.error(err);
	});
```

### Force stop an application running on simulator

```javascript
windowslib.simulator.launch(simUDID, {
		appPath: '/path/to/name.app'
	})
	.on('launched', function (simHandle) {
		console.log('Simulator launched');
		windowslib.simulator.stop(simHandle).on('stopped', function () {
			console.log('Simulator stopped');
		});
	});
```

### Find a valid device/cert/provisioning profile combination

```javascript
windowslib.findValidDeviceCertProfileCombos({
	appId: 'com.company.appname'
}, function (err, results) {
	if (err) {
		console.error(err);
	} else {
		console.log(results);
	}
});
```

### Detect everything

```javascript
windowslib.detect(function (err, info) {
	if (err) {
		console.error(err);
	} else {
		console.log(info);
	}
});
```

### Detect Windows Phone certificates

```javascript
windowslib.certs.detect(function (err, certs) {
	if (err) {
		console.error(err);
	} else {
		console.log(certs);
	}
});
```

### Detect provisioning profiles

```javascript
windowslib.provisioning.detect(function (err, profiles) {
	if (err) {
		console.error(err);
	} else {
		console.log(profiles);
	}
});
```

### Detect Visual Studio installations

```javascript
windowslib.xcode.detect(function (err, xcodeInfo) {
	if (err) {
		console.error(err);
	} else {
		console.log(xcodeInfo);
	}
});
```

## Running Tests

For best results, connect a Windows phone device.

To run all tests:

```
npm test
```

To run a specific test suite:

```
npm run-script test-certs

npm run-script test-device

npm run-script test-env

npm run-script test-windowslib

npm run-script test-provisioning

npm run-script test-simulator

npm run-script test-visualstudio
```

## Known Issues

Simulator tests fail due to issue with NSLog() calls not properly being logged
and thus we don't know when tests are done. The result is the tests timeout.

## Reporting Bugs or Submitting Fixes

If you run into problems, and trust us, there are likely plenty of them at this
point -- please create an [Issue](https://github.com/appcelerator/windowslib/issues)
or, even better, send us a pull request.

## Contributing

windowslib is an open source project. windowslib wouldn't be where it is now without
contributions by the community. Please consider forking windowslib to improve,
enhance or fix issues. If you feel like the community will benefit from your
fork, please open a pull request.

To protect the interests of the windowslib contributors, Appcelerator, customers
and end users we require contributors to sign a Contributors License Agreement
(CLA) before we pull the changes into the main repository. Our CLA is simple and
straightforward - it requires that the contributions you make to any
Appcelerator open source project are properly licensed and that you have the
legal authority to make those changes. This helps us significantly reduce future
legal risk for everyone involved. It is easy, helps everyone, takes only a few
minutes, and only needs to be completed once.

[You can digitally sign the CLA](http://bit.ly/app_cla) online. Please indicate
your email address in your first pull request so that we can make sure that will
locate your CLA.  Once you've submitted it, you no longer need to send one for
subsequent submissions.

## Contributors

The original source and design for this project was developed by
[Jeff Haynie](http://github.com/jhaynie) ([@jhaynie](http://twitter.com/jhaynie)).

## Legal

Copyright (c) 2014 by [Appcelerator, Inc](http://www.appcelerator.com). All Rights Reserved.
This project is licensed under the Apache Public License, version 2.  Please see details in the LICENSE file.
