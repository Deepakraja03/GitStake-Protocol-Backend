const axios = require('axios');

async function testPollinationsAPI() {
  console.log('🌐 Testing Pollinations API Direct Connection\n');

  const apiUrl = 'https://text.pollinations.ai/';
  const testPrompt = 'Generate a simple JSON object with a "message" field containing "Hello World"';

  try {
    console.log('Testing API URL:', apiUrl);
    console.log('Test prompt:', testPrompt);
    
    // Test 1: Simple text format
    console.log('\n1. Testing simple text format...');
    try {
      const response1 = await axios.post(apiUrl, testPrompt, {
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('✅ Simple text format worked');
      console.log('Response status:', response1.status);
      console.log('Response data:', typeof response1.data === 'string' ? response1.data.substring(0, 200) : response1.data);
    } catch (error1) {
      console.log('❌ Simple text format failed:', error1.message);
      if (error1.response) {
        console.log('Response status:', error1.response.status);
        console.log('Response data:', error1.response.data);
      }
    }

    // Test 2: JSON format with messages array
    console.log('\n2. Testing JSON format with messages array...');
    try {
      const response2 = await axios.post(apiUrl, {
        messages: [
          {
            role: 'user',
            content: testPrompt
          }
        ],
        model: 'openai'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('✅ JSON format with messages worked');
      console.log('Response status:', response2.status);
      console.log('Response data:', typeof response2.data === 'string' ? response2.data.substring(0, 200) : response2.data);
    } catch (error2) {
      console.log('❌ JSON format with messages failed:', error2.message);
      if (error2.response) {
        console.log('Response status:', error2.response.status);
        console.log('Response data:', error2.response.data);
      }
    }

    // Test 3: Simple JSON format
    console.log('\n3. Testing simple JSON format...');
    try {
      const response3 = await axios.post(apiUrl, {
        message: testPrompt,
        model: 'openai'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('✅ Simple JSON format worked');
      console.log('Response status:', response3.status);
      console.log('Response data:', typeof response3.data === 'string' ? response3.data.substring(0, 200) : response3.data);
    } catch (error3) {
      console.log('❌ Simple JSON format failed:', error3.message);
      if (error3.response) {
        console.log('Response status:', error3.response.status);
        console.log('Response data:', error3.response.data);
      }
    }

    console.log('\n🎉 Pollinations API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPollinationsAPI();