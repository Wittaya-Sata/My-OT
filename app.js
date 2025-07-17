const otDate = document.getElementById('otDate');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const otType = document.getElementById('otType');
const reason = document.getElementById('reason');
const addBtn = document.getElementById('addBtn');
const toggleDark = document.getElementById('toggleDark');
const otList = document.getElementById('otList');
const summaryToday = document.getElementById('summaryToday');
const summaryMonth = document.getElementById('summaryMonth');
const summaryYear = document.getElementById('summaryYear');
const otChart = document.getElementById('otChart');

const API_URL = 'https://script.google.com/macros/s/AKfycbwT93kGhzw62_s9tJQXmvPpuOsmhldAqlpKYdr9ucOyDhW1KB3IEN6ONk-B8V-DP8Ep/exec';
let otData = [];

function calcHours(start, end) {
  const s = new Date(`2000-01-01T${start}`);
  const e = new Date(`2000-01-01T${end}`);
  const diff = (e - s) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
}

function sendToSheet(entry) {
  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
    .then(res => res.text())
    .then(msg => {
      alert('✅ ส่งข้อมูลสำเร็จแล้ว');
      otDate.value = startTime.value = endTime.value = reason.value = '';
      otType.value = 'ปกติ';
      fetchDataFromSheet();
    })
    .catch(err => {
      alert('❌ ส่งข้อมูลไม่สำเร็จ');
      console.error(err);
    });
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

  const entry = {
    date: otDate.value,
    start: startTime.value,
    end: endTime.value,
    hours: parseFloat(hours.toFixed(2)),
    type: otType.value.trim() || '-',
    reason: reason.value.trim() || '-'
  };

  sendToSheet(entry);
};

function fetchDataFromSheet() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      otData = data;
      renderList();
      renderSummary();
    })
    .catch(err => console.error('❌ ดึงข้อมูลไม่สำเร็จ:', err));
}

function renderList() {
  otList.innerHTML = '';
  otData.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.date}</strong><br/>
      เวลา: ${item.start} - ${item.end} (${item.hours} ชม.)<br/>
      ประเภท: ${item.type} | เหตุผล: ${item.reason}
    `;
    otList.appendChild(li);
  });
}

function renderSummary() {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const year = today.slice(0, 4);

  let sumToday = 0, sumMonth = 0, sumYear = 0;
  let typeMonth = { 'ปกติ': 0, 'วันหยุด': 0, 'กิจกรรม': 0 };
  let chartData = {};

  otData.forEach(d => {
    const h = parseFloat(d.hours);
    if (d.date === today) sumToday += h;
    if (d.date.startsWith(month)) {
      sumMonth += h;
      if (d.type in typeMonth) typeMonth[d.type] += h;
    }
    if (d.date.startsWith(year)) sumYear += h;

    const key = d.date.slice(0, 7);
    chartData[key] = chartData[key] || { 'ปกติ': 0, 'วันหยุด': 0, 'กิจกรรม': 0 };
    if (d.type in chartData[key]) chartData[key][d.type] += h;
  });

  summaryToday.innerText = `${sumToday.toFixed(2)} ชม.`;
  summaryMonth.innerHTML = `
    📆 เดือนนี้:<br/>
    ➤ ปกติ&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ${typeMonth['ปกติ'].toFixed(2)} ชม.<br/>
    ➤ วันหยุด&nbsp;&nbsp;: ${typeMonth['วันหยุด'].toFixed(2)} ชม.<br/>
    ➤ กิจกรรม&nbsp;: ${typeMonth['กิจกรรม'].toFixed(2)} ชม.
  `;
  summaryYear.innerText = `${sumYear.toFixed(2)} ชม.`;

  renderChart(chartData);
}

function renderChart(dataObj) {
  const labels = Object.keys(dataObj).sort();
  const normal = labels.map(m => dataObj[m]['ปกติ'] || 0);
  const holiday = labels.map(m => dataObj[m]['วันหยุด'] || 0);
  const event = labels.map(m => dataObj[m]['กิจกรรม'] || 0);

  new Chart(otChart, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'ปกติ', data: normal, backgroundColor: '#007bff' },
        { label: 'วันหยุด', data: holiday, backgroundColor: '#dc3545' },
        { label: 'กิจกรรม', data: event, backgroundColor: '#28a745' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

toggleDark.onclick = () => {
  document.body.classList.toggle('dark-mode');
};

window.onload = () => {
  fetchDataFromSheet();
};
