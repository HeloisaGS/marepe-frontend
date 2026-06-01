const axios = require('axios');

const API_BASE_URL = 'https://marepe-backend.onrender.com';

async function testNearbyVendors() {
  console.log('🔍 Testing getNearbyVendors endpoint...\n');

  // Test coordinates (Recife, PE)
  const testCases = [
    { lat: -8.0476, lng: -34.8770, radius: 2000, name: 'Recife center' },
    { lat: -8.0500, lng: -34.8800, radius: 5000, name: 'Recife wider area' },
  ];

  for (const test of testCases) {
    console.log(`\n📍 Testing: ${test.name}`);
    console.log(`   Coordinates: ${test.lat}, ${test.lng}`);
    console.log(`   Radius: ${test.radius}m`);

    try {
      const url = `${API_BASE_URL}/cliente/vendedor-location`;
      console.log(`   URL: ${url}?lat=${test.lat}&lng=${test.lng}&radius=${test.radius}`);

      const response = await axios.get(url, {
        params: {
          lat: Number(parseFloat(test.lat).toFixed(7)),
          lng: Number(parseFloat(test.lng).toFixed(7)),
          radius: Number(test.radius)
        },
        timeout: 10000
      });

      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Results: ${response.data?.data?.length || 0} vendors found`);

      if (response.data?.data && response.data.data.length > 0) {
        console.log(`   📦 Sample vendor:`, JSON.stringify(response.data.data[0], null, 2));
      } else {
        console.log(`   ⚠️  No vendors found (empty result)`);
      }

    } catch (error) {
      console.log(`   ❌ ERROR:`);
      if (error.response) {
        console.log(`      Status: ${error.response.status}`);
        console.log(`      Data:`, JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.log(`      Network error: No response from server`);
        console.log(`      Message: ${error.message}`);
      } else {
        console.log(`      Error: ${error.message}`);
      }
    }
  }

  // Test without authentication (should fail)
  console.log('\n\n🔐 Testing without authentication token...');
  try {
    const response = await axios.get(`${API_BASE_URL}/cliente/vendedor-location`, {
      params: { lat: -8.0476, lng: -34.8770, radius: 2000 },
      timeout: 10000
    });
    console.log('   ⚠️  Unexpectedly succeeded without auth token');
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('   ✅ Correctly requires authentication (401/403)');
    } else {
      console.log('   ❌ Unexpected error:', error.response?.status || error.message);
    }
  }

  // Test health endpoint
  console.log('\n\n🏥 Testing API health...');
  try {
    const response = await axios.get(`${API_BASE_URL}/`, { timeout: 5000 });
    console.log('   ✅ API is responsive');
    console.log('   Response:', response.data);
  } catch (error) {
    console.log('   ❌ API health check failed:', error.message);
  }
}

testNearbyVendors().then(() => {
  console.log('\n\n✨ Test complete');
}).catch(err => {
  console.error('\n\n💥 Test script failed:', err);
});
