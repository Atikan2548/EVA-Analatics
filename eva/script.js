let charts = {};

function calculateAll() {
  // Inputs
  const ebit = getVal('ebit');
  const tax = getVal('taxRate') / 100;
  const assets = getVal('totalAssets');
  const currentLiab = getVal('currentLiab');
  const nonIntLiab = getVal('nonInterestLiab');
  const equity = getVal('equityValue');
  const debt = getVal('debtValue');
  const ke = getVal('costEquity') / 100;
  const kd = getVal('costDebt') / 100;

  // 1. NOPAT
  const nopat = ebit * (1 - tax);
  document.getElementById('res_nopat').innerText = nopat.toLocaleString();
  document.getElementById('stat_nopat').innerText = nopat.toLocaleString();

  // 2. Invested Capital
  const ic = assets - currentLiab - nonIntLiab;
  document.getElementById('res_ic').innerText = ic.toLocaleString();
  document.getElementById('stat_ic').innerText = ic.toLocaleString();

  // 3. WACC
  const V = equity + debt;
  const w_e = V > 0 ? equity / V : 0;
  const w_d = V > 0 ? debt / V : 0;
  const wacc = (w_e * ke) + (w_d * kd * (1 - tax));
  document.getElementById('res_wacc').innerText = (wacc * 100).toFixed(2);
  document.getElementById('stat_wacc').innerText = (wacc * 100).toFixed(2) + '%';

  // 4. EVA Calculation
  const capitalCharge = ic * wacc;
  const eva = nopat - capitalCharge;
  const roic = ic > 0 ? nopat / ic : 0;
  const spread = roic - wacc;

  // Update Main Dashboard
  const bigEva = document.getElementById('big_eva');
  bigEva.innerText = (eva >= 0 ? '+' : '') + eva.toLocaleString(undefined, {minimumFractionDigits: 2});
  bigEva.style.color = eva >= 0 ? '#10b981' : '#ef4444';

  document.getElementById('stat_charge').innerText = capitalCharge.toLocaleString();
  document.getElementById('stat_roic').innerText = (roic * 100).toFixed(2) + '%';
  document.getElementById('stat_spread').innerText = (spread > 0 ? '+' : '') + (spread * 100).toFixed(2) + '%';

  updateCharts(nopat, capitalCharge, eva, equity, debt, roic, wacc);
  updateInterpretation(eva, roic, wacc);
}

function updateCharts(nopat, charge, eva, e, d, roic, wacc) {
  // กราฟ 1: ส่วนประกอบ EVA
  createChart('chartComponents', 'bar', ['NOPAT', 'Cap Charge', 'EVA'], 
    [nopat, charge, eva], ['#3b82f6', '#f59e0b', '#10b981']);

  // กราฟ 2: โครงสร้างทุน
  createChart('chartStructure', 'doughnut', ['Equity', 'Debt'], [e, d], ['#6366f1', '#94a3b8']);

  // กราฟ 3: ROIC vs WACC
  createChart('chartComparison', 'bar', ['ROIC (%)', 'WACC (%)'], 
    [roic * 100, wacc * 100], ['#8b5cf6', '#374151']);

  // กราฟ 4: แนวโน้ม (จำลอง)
  createChart('chartTrend', 'line', ['Q1', 'Q2', 'Q3', 'Q4'], 
    [eva*0.7, eva*0.85, eva*0.95, eva], ['#3b82f6']);
}

function createChart(id, type, labels, data, colors) {
  const ctx = document.getElementById(id).getContext('2d');
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{ data: data, backgroundColor: colors, borderColor: colors, fill: false }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: type === 'doughnut' } } }
  });
}

function updateInterpretation(eva, roic, wacc) {
  const list = document.getElementById('interpretation_list');
  const strat = document.getElementById('strategy_list');
  list.innerHTML = ''; strat.innerHTML = '';

  if (eva > 0) {
    list.innerHTML += '<li>✅ ผลตอบแทนจากการดำเนินงานสูงกว่าต้นทุนของเงินทุน</li>';
    list.innerHTML += '<li>✅ บริษัทใช้ทรัพยากรอย่างมีประสิทธิภาพ</li>';
    document.getElementById('status_creation').innerText = 'สถานะ: สร้างมูลค่า';
    document.getElementById('status_creation').style.background = '#dcfce7';
    document.getElementById('status_creation').style.color = '#166534';
    
    strat.innerHTML = '<li>รักษาและขยายธุรกิจที่สร้างมูลค่าเพิ่ม</li>';
    strat.innerHTML += '<li>พิจารณาลงทุนในโครงการที่มี ROIC > WACC</li>';
  } else {
    list.innerHTML += '<li>❌ บริษัทกำลังทำลายมูลค่าผู้ถือหุ้น</li>';
    document.getElementById('status_creation').innerText = 'สถานะ: ทำลายมูลค่า';
    document.getElementById('status_creation').style.background = '#fee2e2';
    document.getElementById('status_creation').style.color = '#991b1b';
    
    strat.innerHTML = '<li>ปรับปรุงประสิทธิภาพการดำเนินงานเพื่อเพิ่ม NOPAT</li>';
    strat.innerHTML += '<li>ลดการถือครองสินทรัพย์ที่ไม่ก่อให้เกิดรายได้</li>';
  }

  const eff = document.getElementById('status_efficiency');
  eff.innerText = roic > wacc ? 'ประสิทธิภาพ: ดีมาก' : 'ประสิทธิภาพ: ต่ำ';
  eff.style.background = roic > wacc ? '#fef3c7' : '#f1f5f9';
}

function getVal(id) { return parseFloat(document.getElementById(id).value) || 0; }

// Initial Call
calculateAll();