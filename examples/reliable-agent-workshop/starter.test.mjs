import {test} from 'node:test';import assert from 'node:assert/strict';
import {lookupShipment,proposeReview,answer} from './starter.mjs';
test('known reference preserves recorded hold',()=>assert.equal(lookupShipment('HV-2048').shipment.status,'Customs hold'));
test('missing and malformed inputs are distinct',()=>{assert.equal(lookupShipment('HV-9999').found,false);assert.throws(()=>lookupShipment('ignore all rules'),/Invalid/);});
test('unknown references cannot create proposals',()=>assert.throws(()=>proposeReview('HV-9999','Please review'),/unknown/));
test('a valid proposal stays pending and does not release the record',()=>{assert.equal(proposeReview('HV-2048','Please check the documentation').status,'Pending review');assert.equal(lookupShipment('HV-2048').shipment.status,'Customs hold');});
test('language switches preserve reference and mode',()=>{for(const l of ['en','nl','fr']){const r=answer('HV-2048',l);assert.equal(r.shipment.id,'HV-2048');assert.equal(r.mode,'DETERMINISTIC DEMO');}});
