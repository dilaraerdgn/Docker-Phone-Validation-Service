const apiBase = '/api';

document.getElementById('submit').addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  const msgDiv = document.getElementById('msg');
  msgDiv.innerHTML = '';

  if (!name || !email || !/^\d{6}$/.test(phone)) {
    msgDiv.innerHTML = '<div class="msg error">Lütfen geçerli ad, e-posta ve 6 haneli telefon girin.</div>';
    return;
  }

  try {
    const res = await fetch(`${apiBase}/registration`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name, email, phone })
    });

    const data = await res.json();

    if (res.status === 201 && data.status === 'accepted') {
      msgDiv.innerHTML = '<div class="msg success">Kayıt başarılı.</div>';
      loadList();
    } else {
      const text = data.message || data.error || JSON.stringify(data);
      msgDiv.innerHTML = `<div class="msg error">${text}</div>`;
    }

  } catch (err) {
    msgDiv.innerHTML = `<div class="msg error">Sunucu hatası: ${err.message}</div>`;
  }
});

// ✅ BONUS LIST
async function loadList() {
  try {
    const res = await fetch(`${apiBase}/registrations`);
    if (!res.ok) return;

    const json = await res.json();
    const tbody = document.querySelector('#list tbody');
    tbody.innerHTML = '';

    json.data.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${idx+1}</td><td>${r.name}</td><td>${r.email}</td><td>${r.phone}</td>`;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
  }
}

loadList();
