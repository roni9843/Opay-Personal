const axios = require('axios');
const SmsLog = require('../models/SmsLog');

const OSMS_API_KEY = process.env.OSMS_API_KEY || '4cd4c55e26d7571c49f553efba7890db14dadbd3b260a6d39a75ea1373f0b316';
const OSMS_API_URL = process.env.OSMS_API_URL || 'https://api.o-sms.com/api/service';

/**
 * Generate & Send 6-digit OTP via O-SMS API
 */
const sendOtpSms = async (phoneNumber) => {
  if (!phoneNumber) return { success: false, message: 'Phone number is required' };

  // Format Bangladesh phone number e.g. 88017XXXXXXXX
  let formattedPhone = phoneNumber.trim().replace(/\D/g, '');
  if (!formattedPhone.startsWith('88')) {
    formattedPhone = '88' + formattedPhone;
  }

  try {
    console.log(`[O-SMS Gateway] Sending OTP to ${formattedPhone}...`);
    const response = await axios.post(
      `${OSMS_API_URL}/send-otp`,
      { phoneNumber: formattedPhone },
      {
        headers: {
          Authorization: `Bearer ${OSMS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    const data = response.data;
    const otp = data.otp || null;

    // Log to DB
    await SmsLog.create({
      recipient: formattedPhone,
      message: `Your verification OTP is ${otp}`,
      type: 'otp',
      otp: otp,
      status: data.success ? 'sent' : 'failed',
      response: data,
    });

    return {
      success: true,
      message: data.message || 'OTP sent successfully',
      otp: otp,
    };
  } catch (error) {
    console.error('[O-SMS Gateway Error]:', error.response?.data || error.message);

    // Generate fallback 6-digit OTP if API gateway times out
    const fallbackOtp = String(Math.floor(100000 + Math.random() * 900000));
    await SmsLog.create({
      recipient: formattedPhone,
      message: `Fallback OTP generated: ${fallbackOtp}`,
      type: 'otp',
      otp: fallbackOtp,
      status: 'failed',
      response: error.response?.data || { error: error.message },
    });

    return {
      success: true,
      message: 'OTP generated',
      otp: fallbackOtp,
    };
  }
};

/**
 * Send Single SMS via O-SMS API
 */
const sendSingleSms = async (recipient, message) => {
  let formattedPhone = recipient.trim().replace(/\D/g, '');
  if (!formattedPhone.startsWith('88')) {
    formattedPhone = '88' + formattedPhone;
  }

  try {
    const response = await axios.post(
      `${OSMS_API_URL}/send-single`,
      { recipient: formattedPhone, message },
      {
        headers: {
          Authorization: `Bearer ${OSMS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    await SmsLog.create({
      recipient: formattedPhone,
      message,
      type: 'single',
      status: 'sent',
      response: response.data,
    });

    return { success: true, data: response.data };
  } catch (error) {
    await SmsLog.create({
      recipient: formattedPhone,
      message,
      type: 'single',
      status: 'failed',
      response: error.response?.data || { error: error.message },
    });
    return { success: false, error: error.message };
  }
};

module.exports = { sendOtpSms, sendSingleSms };
