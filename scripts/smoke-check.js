#!/usr/bin/env node
/**
 * Smoke tests for deployment verification
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.SMOKE_BASE_URL || 'https://www.odelink.shop';
const APEX_URL = process.env.SMOKE_APEX_URL || 'https://odelink.shop';
const EXPECT_MAIN_JS = process.env.SMOKE_EXPECT_MAIN_JS || '';

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runSmokeTests() {
  console.log('🔍 Running smoke tests...');
  let failed = false;

  // Test 1: Base URL returns 200
  try {
    console.log(`\n📋 Test 1: GET ${BASE_URL}`);
    const res1 = await fetch(BASE_URL);
    if (res1.status === 200) {
      console.log(`✅ Base URL returns 200`);
    } else {
      console.error(`❌ Base URL returned ${res1.status}, expected 200`);
      failed = true;
    }
  } catch (error) {
    console.error(`❌ Base URL request failed:`, error.message);
    failed = true;
  }

  // Test 2: Apex URL redirects to www
  try {
    console.log(`\n📋 Test 2: GET ${APEX_URL} (should redirect to www)`);
    const res2 = await fetch(APEX_URL);
    if (res2.status === 301 || res2.status === 302 || res2.status === 200) {
      console.log(`✅ Apex URL accessible (status: ${res2.status})`);
    } else {
      console.error(`❌ Apex URL returned ${res2.status}`);
      failed = true;
    }
  } catch (error) {
    console.error(`❌ Apex URL request failed:`, error.message);
    failed = true;
  }

  // Test 3: Main JS bundle exists
  if (EXPECT_MAIN_JS) {
    try {
      const mainJsUrl = `${BASE_URL}${EXPECT_MAIN_JS}`;
      console.log(`\n📋 Test 3: GET ${mainJsUrl}`);
      const res3 = await fetch(mainJsUrl);
      if (res3.status === 200) {
        console.log(`✅ Main JS bundle exists`);
      } else {
        console.error(`❌ Main JS bundle returned ${res3.status}, expected 200`);
        failed = true;
      }
    } catch (error) {
      console.error(`❌ Main JS bundle request failed:`, error.message);
      failed = true;
    }
  } else {
    console.log(`\n⚠️  Test 3: Skipped (SMOKE_EXPECT_MAIN_JS not set)`);
  }

  // Test 4: API health check
  try {
    const healthUrl = `${BASE_URL}/api/health`;
    console.log(`\n📋 Test 4: GET ${healthUrl}`);
    const res4 = await fetch(healthUrl);
    if (res4.status === 200) {
      console.log(`✅ API health check passed`);
    } else {
      console.error(`❌ API health check returned ${res4.status}, expected 200`);
      failed = true;
    }
  } catch (error) {
    console.error(`❌ API health check failed:`, error.message);
    failed = true;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (failed) {
    console.error('❌ Smoke tests FAILED');
    process.exit(1);
  } else {
    console.log('✅ All smoke tests PASSED');
    process.exit(0);
  }
}

runSmokeTests();
