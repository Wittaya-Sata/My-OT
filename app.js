let otData = JSON.parse(localStorage.getItem('otData')) || [];

const otDate = document.getElementById('otDate');
const otHours = document.getElementById('otHours');
const addBtn = document.getElementById('addBtn');
const otList = document.getElementById('otList');
const summaryType = document.getElementById('summaryType');
const summaryResult = document.getElementById('summaryResult');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const toggleDark = document.getElementById('toggleDark');

function saveData() {
  localStorage.setItem('otData', JSON.stringify(otData));
}

function renderList() {
  otList.innerHTML = '';
  otData.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.date} — ${item.hours} ชม.
      <span>
        <button onclick="edit(${index})">✏️</button>
        <button onclick="remove(${index})">❌</button>
      </span>`;
    otList.appendChild(li);
  });
}

function renderSummary() {
  const type = summaryType.value;
  const grouped = {};

  otData.forEach(item => {
    const date = new Date(item.date);
    let key = '';
    if (type === 'daily') key = item.date;
    if (type === 'monthly') key = `${date.getFullYear()}-${date.getMonth()+1}`;
    if (type === 'yearly') key = `${date.getFullYear()}`;
    grouped[key] = (grouped[key] || 0) + parseFloat(item.hours);
  });

  summaryResult.innerHTML = Object.entries(grouped)
    .sort()
    .map(([k, v]) => `<div>${k}: ${v.toFixed(1)} ชม.</div>`)
    .join('');
}

addBtn.onclick = () => {
  if (!otDate.value || !otHours.value) return alert('กรุณากรอกข้อมูลให้ครบ');
  otData.push({ date: otDate.value, hours: otHours.value });
  saveData();
  renderList();
  renderSummary();
  otDate.value = '';
  otHours.value = '';
};

function edit(index) {
  const newHours = prompt('แก้ไขชั่วโมง OT', otData[index].hours);
  if (newHours !== null) {
    otData[index].hours = newHours;
    saveData();
    renderList();
    renderSummary();
  }
}

function remove(index) {
  if (confirm('ลบรายการนี้?')) {
    otData.splice(index, 1);
    saveData();
    renderList();
    renderSummary();
  }
}

summaryType.onchange = renderSummary;

exportBtn.onclick = () => {
  const csv = 'วันที่,ชั่วโมง\n' + otData.map(d => `${d.date},${d.hours}`).join('\n');
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
    renderSummary();
  }
};

toggleDark.onclick = () => {
  document.body.classList.toggle('dark');
};

renderList();
renderSummary();
