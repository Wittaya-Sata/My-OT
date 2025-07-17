let otData = JSON.parse(localStorage.getItem('otData')) || [];
let editIndex = null;

const otDate = document.getElementById('otDate');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const otType = document.getElementById('otType');
const reason = document.getElementById('reason');
const addBtn = document.getElementById('addBtn');
const otList = document.getElementById('otList');
const summaryToday = document.getElementById('summaryToday');
const summaryMonth = document.getElementById('summaryMonth');
const summaryYear = document.getElementById('summaryYear');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const toggleDark = document.getElementById('toggleDark');
const chartCanvas = document.getElementById('otChart');

function saveData() {
  localStorage.setItem('otData', JSON.stringify(otData));
}

function calcHours(start, end) {
  const s = new Date(`2000-01-01T${start}`);
  const e = new Date(`2000-01-01T${end}`);
  const diff = (e - s) / (1000 * 60 * 60);
  return diff > 0 ? diff : 0;
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('th-TH');
}

function renderList() {
  otList.innerHTML = '';
  otData.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${formatDate(item.date)}</strong><br/>
      เวลา: ${item.start} - ${item.end} (${item.hours} ชม.)<br/>
      ประเภท: ${item.type} | เหตุผล: ${item.reason || '-'}<br/>
      <button onclick="edit(${index})">✏️ แก้ไข</button>
      <button onclick="remove(${index})">❌ ลบ</button>
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
    if (d.date === today) sumToday += d.hours;
    if (d.date.startsWith(month)) {
      sumMonth += d.hours;
      typeMonth[d.type] += d.hours;
    }
    if (d.date.startsWith(year)) sumYear += d.hours;

    const key = d.date.slice(0, 7);
    chartData[key] = chartData[key] || { 'ปกติ': 0, 'วันหยุด': 0, 'กิจกรรม': 0 };
    chartData[key][d.type] += d.hours;
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

  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'ปกติ', data: normal, backgroundColor: '#007bff' },
        { label: 'วันหยุด', data: holiday, backgroundColor: '#dc3545' },
        { label: 'กิจกรรม', data: event, backgroundColor: '#28a745' },
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function edit(index) {
  const item = otData[index];
  otDate.value = item.date;
  startTime.value = item.start;
  endTime.value = item.end;
  otType.value = item.type;
  reason.value = item.reason || '';
  editIndex = index;
  addBtn.innerText = 'อัปเดตข้อมูล OT';
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const newEntry = {
    date: otDate.value,
    start: startTime.value,
    end: endTime.value,
    hours: parseFloat(hours.toFixed(2)),
    type: otType.value,
    reason: reason.value.trim()
  };

  if (editIndex !== null) {
    otData[editIndex] = newEntry;
    editIndex = null;
    addBtn.innerText = 'บันทึก OT';
  } else {
    otData.push(newEntry);
  }

  saveData();
  renderList();
  renderSummary();

  otDate.value = startTime.value = endTime.value = reason.value = '';
  otType.value = 'ปกติ';
};

function remove(index) {
  if (confirm('ลบรายการนี้ใช่หรือไม่?')) {
    otData.splice(index, 1);
    saveData();
    renderList();
    renderSummary();
  }
}

exportBtn.onclick = () => {
  let csv = 'วันที่,เวลาเริ่ม,เวลาสิ้นสุด,ชั่วโมง,ประเภท,เหตุผล\n';
  otData.forEach(d => {
    csv += `${d.date},${d.start},${d.end},${d.hours},${d.type},"${d.reason}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ot_data.csv';
  a.click();
};

clearBtn.onclick = () => {
  if (confirm('ต้องการล้างข้อมูลทั้งหมด?')) {
    otData = [];
    saveData();
    renderList();
    renderSummary();
  }
};

toggleDark.onclick = () => {
  document.body.classList.toggle('dark-mode');
};

renderList();
renderSummary();
