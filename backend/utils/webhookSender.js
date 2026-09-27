const axios = require('axios');

/**
 * Dispatch webhook notification to customer callback URL
 */
const sendWebhookCallback = async (callbackUrl, payload) => {
  if (!callbackUrl || !/^https?:\/\//i.test(callbackUrl)) {
    console.warn('[Webhook] Invalid or missing callback URL:', callbackUrl);
    return false;
  }

  try {
    console.log(`[Webhook] Dispatching to ${callbackUrl}...`);
    const response = await axios.post(callbackUrl, payload, {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Opay-Personal-Webhook/1.0',
      },
    });

    console.log(`[Webhook Success] ${callbackUrl} returned status ${response.status}`);
    return true;
  } catch (error) {
    console.error(`[Webhook Failed] ${callbackUrl}: ${error.message}`);
    return false;
  }
};

module.exports = { sendWebhookCallback };
