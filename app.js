let otData = JSON.parse(localStorage.getItem('otData')) || [];

const otDate = document.getElementById('otDate');
const otHours = document.getElementById('otHours');
const addBtn = document.getElementById('addBtn');
const otList = document.getElementById('otList');
const summaryResult = document.getElementById('summaryResult');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const toggleDark = document.getElementById('toggleDark');
const chartCanvas = document.getElementById('otChart');

function saveData() {
  localStorage.setItem('otData', JSON.stringify(otData));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH');
}

function renderList() {
  otList.innerHTML = '';
  otData.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${formatDate(item.date)} — ${item.hours} ชม.
      <span>
        <button onclick="edit(${index})">✏️</button>
        <button onclick="remove(${index})">❌</button>
      </span>`;
    otList.appendChild(li);
  });
}

function renderSummaryAndChart() {
  const monthly = {};
  otData.forEach(d => {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    monthly[key] = (monthly[key] || 0) + parseFloat(d.hours);
  });

  summaryResult.innerHTML = '';
  const labels = [];
  const data = [];

  Object.entries(monthly).sort().forEach(([month, total]) => {
    summaryResult.innerHTML += `<div>${month}: ${total.toFixed(1)} ชม.</div>`;
    labels.push(month);
    data.push(total.toFixed(1));
  });

  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'ยอด OT / เดือน',
        data,
        backgroundColor: '#007bff',
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    }
  });
}

addBtn.onclick = () => {
  if (!otDate.value || !otHours.value) return alert('กรุณากรอกข้อมูลให้ครบ');
  otData.push({ date: otDate.value, hours: otHours.value });
  saveData();
  renderList();
  renderSummaryAndChart();
  otDate.value = '';
  otHours.value = '';
};

function edit(index) {
  const newHours = prompt('แก้ไข OT', otData[index].hours);
  if (newHours) {
    otData[index].hours = newHours;
    saveData();
    renderList();
    renderSummaryAndChart();
  }
}

function remove(index) {
  if (confirm('ลบรายการนี้?')) {
    otData.splice(index, 1);
    saveData();
    renderList();
    renderSummaryAndChart();
  }
}

exportBtn.onclick = () => {
  let csv = 'วันที่,ชั่วโมง\n';
  otData.forEach(d => {
    csv += `${d.date},${d.hours}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ot_data.csv';
  a.click();
};

clearBtn.onclick = () => {
  if (confirm('ล้างข้อมูลทั้งหมด?')) {
    otData = [];
    saveData();
    renderList();
    renderSummaryAndChart();
  }
};

toggleDark.onclick = () => {
  document.body.classList.toggle('dark-mode');
};

renderList();
renderSummaryAndChart();
