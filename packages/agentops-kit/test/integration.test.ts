import {test} from 'node:test';import assert from 'node:assert/strict';
import {inspectElevenLabs} from '../src/index.js';
import {ElevenLabsClient} from '@elevenlabs/elevenlabs-js';
// Compile-time SDK compatibility, no instance and no request.
const typeCheck=(client:ElevenLabsClient)=>inspectElevenLabs(client,'agent_example');void typeCheck;
test('official client structural adapter uses mock transport and redacts',async()=>{const r=await inspectElevenLabs({conversationalAi:{agents:{get:async id=>({agent_id:id,api_key:'PRIVATE',conversation_config:{tts:{voice_id:'voice_example'}}})}}},'agent_example');assert.ok(!JSON.stringify(r).includes('PRIVATE'));});
test('invalid ID fails before transport',async()=>{await assert.rejects(inspectElevenLabs({conversationalAi:{agents:{get:async()=>{throw Error('should not call');}}}},'bad'));});
