/**
 * Helper utility to parse incoming SMS text for bKash, Nagad, Rocket, Upay
 */
const parseTransactionText = (text) => {
  if (!text || typeof text !== 'string') {
    return { amount: null, from: 'unknown', trxID: null, date: null, time: null, provider: 'unknown' };
  }

  const cleanText = text.replace(/\r/g, '').trim();
  const lowerText = cleanText.toLowerCase();

  // Detect Provider
  let provider = 'unknown';
  if (lowerText.includes('bkash')) provider = 'bkash';
  else if (lowerText.includes('nagad')) provider = 'nagad';
  else if (lowerText.includes('rocket') || lowerText.includes('dbbl')) provider = 'rocket';
  else if (lowerText.includes('upay') || lowerText.includes('u pay')) provider = 'upay';

  // Amount parsing (supports Tk. 1,000.00 / Tk 500 / BDT 100)
  const amountRegex = /(?:Tk\.?|BDT)\s*([\d,]+\.?\d*)/i;
  const amountMatch = cleanText.match(amountRegex);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  // Sender A/C or Mobile Number parsing
  const fromRegex = /(?:from|Customer|Sender|A\/C:)\s*([0-9X*+]{3,15})/i;
  const fromMatch = cleanText.match(fromRegex);
  const from = fromMatch ? fromMatch[1] : 'unknown';

  // TrxID parsing (supports TrxID: 9X3819A / TxnID / Trx ID)
  const trxIDRegex = /(?:TrxID|TxnID|TxnId|Trx ID)\s*[:\s]*([A-Z0-9]+)/i;
  const trxIDMatch = cleanText.match(trxIDRegex);
  const trxID = trxIDMatch ? trxIDMatch[1] : null;

  // Date & Time parsing
  const dateTimeRegex =
    /(?:(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}-[A-Z]{3}-\d{2,4}))\s+(?:(?:at\s+)?(\d{1,2}:\d{2}(?::\d{2})?\s*[ap]m)|(?:at\s+)?(\d{1,2}:\d{2}))/i;
  const dateTimeMatch = cleanText.match(dateTimeRegex);
  const date = dateTimeMatch ? dateTimeMatch[1] || dateTimeMatch[2] : null;
  const time = dateTimeMatch ? dateTimeMatch[3] || dateTimeMatch[4] : null;

  return { amount, from, trxID, date, time, provider };
};

module.exports = { parseTransactionText };
