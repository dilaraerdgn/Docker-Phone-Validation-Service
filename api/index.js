const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());

function validatePhoneStr(numStr) {
  if (typeof numStr !== 'string' || !/^\d{6}$/.test(numStr)) {
    const err = new Error('phone must be a 6-digit string.');
    err.status = 400;
    throw err;
  }

  const digits = numStr.split('').map(d => parseInt(d, 10));
  const hasNonZero = digits.some(d => d !== 0);
  const sumFirst = digits[0] + digits[1] + digits[2];
  const sumLast = digits[3] + digits[4] + digits[5];
  const sumOdd = digits[0] + digits[2] + digits[4];
  const sumEven = digits[1] + digits[3] + digits[5];

  return {
    hasNonZeroDigit: hasNonZero,
    sumFirstEqualsLast: sumFirst === sumLast,
    sumOddEqualsEven: sumOdd === sumEven,
    isValid: hasNonZero && sumFirst === sumLast && sumOdd === sumEven
  };
}

//count
function calculateValidPhoneCount() {
  let count = 0;

  for (let i = 0; i <= 999999; i++) {
    const numStr = i.toString().padStart(6, '0');
    const rules = validatePhoneStr(numStr);

    if (rules.isValid) count++;
  }

  return count;
}
//cache'ye kaydetmek için
let cachedCount = null;

// ✅ POST /api/phone/validate
app.post('/api/phone/validate', (req, res) => {
  try {
    const { number } = req.body;
    const rules = validatePhoneStr(number);
    return res.json({
      number,
      rules: {
        hasNonZeroDigit: rules.hasNonZeroDigit,
        sumFirstEqualsLast: rules.sumFirstEqualsLast,
        sumOddEqualsEven: rules.sumOddEqualsEven
      },
      isValid: rules.isValid
    });
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

// ✅ POST /api/registration
app.post('/api/registration', async (req, res) => {
  const { name, email, phone } = req.body || {};
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'name, email and phone are required.' });
  }

  let rules;
  try {
    rules = validatePhoneStr(phone);
  } catch (err) {
    return res.status(err.status || 400).json({ error: err.message });
  }

  if (!rules.isValid) {
    return res.status(422).json({
      status: 'denied',
      message: 'Geçersiz telefon numarası. Lütfen yeni bir numara deneyin.',
      isValid: false
    });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO registrations (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );

    return res.status(201).json({
      status: 'accepted',
      message: 'Telefon numarası geçerli, kayıt başarıyla oluşturuldu.',
      data: {
        id: result.insertId,
        name,
        email,
        phone,
        createdAt: new Date().toISOString()
      }
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Bu telefon daha önce kayıtlı.'
      });
    }

    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

// ✅ GET /api/phone/count
/*
app.get('/api/phone/count', (req, res) => {
  return res.json({ count: 6699 });
});
*/

app.get('/api/phone/count', (req, res) => {
  if (cachedCount !== null) {
    return res.json({ count: cachedCount, cached: true });
  }

  const count = calculateValidPhoneCount();
  cachedCount = count;

  return res.json({ count, cached: false });
});

// ✅ GET /api/registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, created_at as createdAt FROM registrations ORDER BY created_at DESC LIMIT 50'
    );

    return res.json({ data: rows });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API listening on ${PORT}`));
