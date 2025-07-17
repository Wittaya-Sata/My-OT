const otDate = document.getElementById('otDate');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const otType = document.getElementById('otType');
const reason = document.getElementById('reason');
const addBtn = document.getElementById('addBtn');
const toggleDark = document.getElementById('toggleDark');

// URL ของ Google Apps Script ที่คุณเตรียมไว้
const API_URL = 'https://script.google.com/macros/s/AKfycbwT93kGhzw62_s9tJQXmvPpuOsmhldAqlpKYdr9ucOyDhW1KB3IEN6ONk-B8V-DP8Ep/exec';

function calcHours(start, end) {
  const s = new Date(`2000-01-01T${start}`);
  const e = new Date(`2000-01-01T${end}`);
  const diff = (e - s) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
}

addBtn.onclick = () => {
  if (!otDate.value || !startTime.value || !endTime.value || !otType.value) {
    alert('กรุณากรอกข้อมูลให้ครบ');
    return;
  }

  const hours = calcHours(startTime.value, endTime.value);
  if (hours <= 0) {
    alert('เวลาไม่ถูกต้อง');
    return;
  }

  const data = {
    date: otDate.value,
    start: startTime.value,
    end: endTime.value,
    hours: parseFloat(hours.toFixed(2)),
    type: otType.value,
    reason: reason.value.trim()
  };

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(msg => {
      alert('✅ ส่งข้อมูลไปยัง Google Sheet แล้ว');
      otDate.value = startTime.value = endTime.value = reason.value = '';
      otType.value = 'ปกติ';
    })
    .catch(err => alert('❌ มีข้อผิดพลาดในการส่งข้อมูล'));
};

toggleDark.onclick = () => {
  document.body.classList.toggle('dark-mode');
};
