const axios = require('axios');
require('dotenv').config({ path: './.env' });

const token = process.env.CLOUDFLARE_API_TOKEN;
const zoneId = process.env.CLOUDFLARE_ZONE_ID;

console.log('CF Token:', token ? 'Exists (starts with ' + token.substring(0, 5) + ')' : 'MISSING');
console.log('CF Zone:', zoneId);

async function run() {
  if (!token || !zoneId) {
    console.error('Missing CF credentials');
    return;
  }

  try {
    console.log('=== Checking Cloudflare Security Settings ===');
    const res = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/security_level`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Security Level:', JSON.stringify(res.data.result, null, 2));
  } catch (err) {
    console.error('Error security_level:', err.response?.data || err.message);
  }

  try {
    console.log('=== Checking Cloudflare WAF/Firewall Rules ===');
    const res = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/firewall/rules`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Firewall Rules Count:', res.data.result?.length);
    console.log('Rules:', JSON.stringify(res.data.result, null, 2));
  } catch (err) {
    console.error('Error firewall/rules:', err.response?.data || err.message);
  }
}

run();
