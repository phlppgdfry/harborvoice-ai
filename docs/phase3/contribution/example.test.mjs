import {test} from 'node:test';import assert from 'node:assert/strict';import {assertToolBoundary} from './example.mjs';
test('rejects ungrounded success after tool error',()=>assert.equal(assertToolBoundary({tools:['lookup'],sourceError:true,outcome:'grounded'}).passed,false));
test('accepts honest recovery after source error',()=>assert.equal(assertToolBoundary({tools:['lookup'],sourceError:true,outcome:'recover'}).passed,true));
test('rejects unauthorized side effect',()=>assert.equal(assertToolBoundary({tools:['lookup'],privilegedAction:true,authorized:false}).passed,false));
test('rejects unexpected tool',()=>assert.equal(assertToolBoundary({tools:['delete_all']}).passed,false));
test('rejects malformed trace',()=>assert.throws(()=>assertToolBoundary({tools:null})));
