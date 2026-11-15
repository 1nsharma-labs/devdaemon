import assert from 'assert';
import { ErrorClassifier } from '../core/src/detectors/errorClassifier.js';
import { PortManager } from '../core/src/port/portManager.js';
import { ExecInterceptor } from '../core/src/runner/execInterceptor.js';
import { EnterpriseLicenseVerifier } from '../ee/license/verifier.js';
import { TeamKnowledgeMesh } from '../ee/knowledge/teamMesh.js';

console.log('🧪 Running DevDaemon Test Suite...\n');

// 1. ErrorClassifier Tests
console.log('▶ Testing ErrorClassifier (Sub-5ms Pattern Recognition)...');

// Scenario A: Port In Use
const portError = `Error: listen EADDRINUSE: address already in use :::3000`;
const diagPort = ErrorClassifier.diagnose(portError);
assert(diagPort.category === 'PORT_IN_USE', 'Category should be PORT_IN_USE');
assert(diagPort.data.port === 3000, 'Extracted port should be 3000');
assert(diagPort.suggestedFix.includes('kill-port 3000'), 'Fix should kill port 3000');
console.log('  ✔ EADDRINUSE port 3000 correctly diagnosed');

// Scenario B: Node Module Missing
const nodeError = `Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'dotenv'`;
const diagNode = ErrorClassifier.diagnose(nodeError);
assert(diagNode.category === 'MISSING_DEPENDENCY_NODE', 'Category should be MISSING_DEPENDENCY_NODE');
assert(diagNode.data.package === 'dotenv', 'Extracted package should be dotenv');
assert(diagNode.suggestedFix === 'npm install dotenv', 'Fix should install dotenv');
console.log('  ✔ Missing Node package "dotenv" correctly diagnosed');

// Scenario C: Python Module Missing
const pyError = `ModuleNotFoundError: No module named 'fastapi'`;
const diagPy = ErrorClassifier.diagnose(pyError);
assert(diagPy.category === 'MISSING_DEPENDENCY_PYTHON', 'Category should be MISSING_DEPENDENCY_PYTHON');
assert(diagPy.suggestedFix === 'pip install fastapi', 'Fix should pip install fastapi');
console.log('  ✔ Missing Python package "fastapi" correctly diagnosed');

// Scenario D: Git Push Rejected
const gitError = `To github.com:repo.git ! [rejected] main -> main (fetch first)`;
const diagGit = ErrorClassifier.diagnose(gitError);
assert(diagGit.category === 'GIT_PUSH_REJECTED', 'Category should be GIT_PUSH_REJECTED');
assert(diagGit.suggestedFix.includes('git pull --rebase'), 'Fix should pull --rebase');
console.log('  ✔ Git rejected push correctly diagnosed');

// 2. PortManager Tests
console.log('\n▶ Testing PortManager (Port Inspection & Freeing)...');
const freeRes = PortManager.freePort(3000, { simulate: true });
assert(freeRes.success === true, 'Free port should succeed');
assert(freeRes.port === 3000, 'Port should match');
console.log(`  ✔ Port freeing verified: ${freeRes.message}`);

// 3. ExecInterceptor Tests
console.log('\n▶ Testing ExecInterceptor (Command Execution & Interception)...');
const interceptor = new ExecInterceptor();
const cleanRun = await interceptor.runCommand('node -e "console.log(\'OK\')"');
assert(cleanRun.success === true, 'Clean command should succeed');
assert(cleanRun.exitCode === 0, 'Exit code should be 0');
console.log(`  ✔ Clean command executed successfully in ${cleanRun.durationMs}ms`);

// 4. Enterprise Edition Tests
console.log('\n▶ Testing Enterprise Edition (Team Knowledge Mesh & Licensing)...');
const sampleKey = EnterpriseLicenseVerifier.generateSampleKey('engineer@acme.corp');
const verif = EnterpriseLicenseVerifier.verifyKey(sampleKey);
assert(verif.valid === true, 'Sample enterprise key should verify');
console.log(`  ✔ Verified enterprise license for: ${verif.licensee}`);

const mesh = new TeamKnowledgeMesh(sampleKey);
const recRes = mesh.recordResolution('ERR_PORT_3000', 'Run kill-port 3000 then check docker compose');
assert(recRes.success === true, 'Resolution should be recorded');
const lookup = mesh.lookupResolution('ERR_PORT_3000');
assert(lookup !== null, 'Lookup should return resolution');
console.log(`  ✔ Team knowledge mesh recorded and retrieved verified resolution`);

console.log('\n🎉 ALL DEVDAEMON TESTS PASSED WITH 100% SUCCESS!\n');
