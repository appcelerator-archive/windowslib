/**
 * Tests windowslib's log relay module.
 *
 * @copyright
 * Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License.
 * Please see the LICENSE included with this distribution for details.
 */

const
	dgram = require('dgram'),
	net = require('net'),
	windowslib = require('..');

describe('log relay', function () {
	it('namespace should be an object', function () {
		should(windowslib.LogRelay).be.an.Function;
	});

	it('start log relay, receive UDP signal, respond with TCP port & tokens, and shutdown', function (done) {
		this.timeout(5000);
		this.slow(4000);

		var relay = new windowslib.LogRelay(),
			client = dgram.createSocket("udp4");

		relay.start();

		var message = new Buffer(relay.serverToken);
		client.send(message, 0, message.length, relay.multicastPort, relay.multicastAddress);

		client.on('message', function (data) {
			relay.stop();

			var parts = data.toString().split(':');

			should(parts).have.length(3);

			var tcpPort = ~~parts[0],
				sessionToken = parts[1],
				serverVerifyToken = parts[2];

			should(tcpPort).equal(relay.tcpPort);
			should(sessionToken).equal(relay.sessionToken);
			should(serverVerifyToken).equal(relay.serverVerifyToken);

			done();
		});
	});

	it('start log relay, connect to TCP server, send message, receive, and shutdown', function (done) {
		this.timeout(5000);
		this.slow(4000);

		var testMsg = 'Hello World!';

		var relay = new windowslib.LogRelay();
		relay.start();

		relay.on('message', function (msg) {
			relay.stop();
			should(msg).equal(testMsg);
			done();
		});

		// need to wait for the relay server to start before we try to access the tcpPort
		var client = net.createConnection(relay.tcpPort, function (conn) {
			client.write(relay.sessionToken + '\n' + testMsg);
			client.destroy();
		});
	});
});