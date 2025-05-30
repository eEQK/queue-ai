#!/usr/bin/env bun

/**
 * Test script for Mock IoT API
 * Tests all endpoints to ensure they work correctly
 */

const API_BASE = 'http://localhost:3001';

interface TestResult {
  endpoint: string;
  status: 'PASS' | 'FAIL';
  message: string;
  data?: any;
}

async function testEndpoint(endpoint: string, method = 'GET'): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { method });
    
    if (response.status === 204) {
      return {
        endpoint,
        status: 'PASS',
        message: `No content (expected for exhausted readings)`,
      };
    }
    
    if (!response.ok) {
      return {
        endpoint,
        status: 'FAIL',
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    
    const data = await response.json();
    return {
      endpoint,
      status: 'PASS',
      message: `Success (${response.status})`,
      data,
    };
  } catch (error) {
    return {
      endpoint,
      status: 'FAIL',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

async function runTests() {
  console.log('🧪 Testing Mock IoT API endpoints...\n');
  
  const tests = [
    { endpoint: '/api/health', description: 'Health Check' },
    { endpoint: '/', description: 'Root Endpoint' },
    { endpoint: '/api/sensors', description: 'Sensors Overview' },
    { endpoint: '/api/sensors/status', description: 'Sensor Status' },
    { endpoint: '/api/sensors/patient-arrivals/next', description: 'Patient Arrivals Reading' },
    { endpoint: '/api/sensors/wait-times/next', description: 'Wait Times Reading' },
    { endpoint: '/api/sensors/room-occupancy/next', description: 'Room Occupancy Reading' },
    { endpoint: '/api/sensors/staff-availability/next', description: 'Staff Availability Reading' },
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint);
    results.push(result);
    
    const status = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${test.description}: ${result.message}`);
  }
  
  // Test reset functionality
  console.log('\n🔄 Testing reset functionality...');
  const resetResult = await testEndpoint('/api/sensors/reset', 'POST');
  results.push(resetResult);
  
  const resetStatus = resetResult.status === 'PASS' ? '✅' : '❌';
  console.log(`${resetStatus} Reset Sensors: ${resetResult.message}`);
  
  // Test reading after reset
  const afterResetResult = await testEndpoint('/api/sensors/patient-arrivals/next');
  results.push(afterResetResult);
  
  const afterResetStatus = afterResetResult.status === 'PASS' ? '✅' : '❌';
  console.log(`${afterResetStatus} Reading After Reset: ${afterResetResult.message}`);
  
  // Test exhausted readings
  console.log('\n📤 Testing exhausted readings...');
  const exhaustedResult = await testEndpoint('/api/sensors/patient-arrivals/next');
  results.push(exhaustedResult);
  
  const exhaustedStatus = exhaustedResult.status === 'PASS' ? '✅' : '❌';
  console.log(`${exhaustedStatus} Exhausted Reading: ${exhaustedResult.message}`);
  
  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  
  console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Mock IoT API is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
