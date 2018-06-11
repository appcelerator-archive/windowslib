'use strict';

global.should = null;
global.should = require('should');

var util = require('util');
global.dump = function () {
	for (var i = 0; i < arguments.length; i++) {
		console.error(util.inspect(arguments[i], false, null, true));
	}
};

const {createHook} = require('async_hooks');
const {stackTraceFilter} = require('mocha/lib/utils');
const allResources = new Map();

// this will pull Mocha internals out of the stacks
const filterStack = stackTraceFilter();

const hook = createHook({
  init(asyncId, type, triggerAsyncId) {
    allResources.set(asyncId, {type, triggerAsyncId, stack: (new Error()).stack});
  },
  destroy(asyncId) {
    allResources.delete(asyncId);
  }
}).enable();

global.asyncDump = module.exports = () => {
  hook.disable();
  console.error(`
STUFF STILL IN THE EVENT LOOP:`)
  allResources.forEach(value=> {
    console.error(`Type: ${value.type}`);
    console.error(filterStack(value.stack));
    console.error('\n');
  });
};
