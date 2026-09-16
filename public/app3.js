/* ══════ DASHBOARD ══════ */
function cu(el, v, suf = '') { if (RM) { el.textContent = v + suf; return } let s = 0; const t = setInterval(() => { s += Math.ceil(v / 30) || 1; el.textContent = Math.min(s, v) + suf; if (s >= v) clearInterval(t) }, 30) }
function renderDash() {
  const d = tid(), hj = hoje(), m = hj.slice(0, 7);
  const A = DB.agri.filter(x => !d || x.tenantId == d), G = DB.agd.filter(x => !d || x.tenantId == d), GM = G.filter(x => x.data.startsWith(m));
  $('dHello').textContent = `Bom trabalho, ${(S.user.nome || 'User').split(' ')[0]}.`;
  $('dDate').textContent = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const done = GM.filter(x => x.st == 'Concluído').length, nc = GM.filter(x => x.st == 'Não Compareceu').length;
  const kpis = [['Agricultores', A.length, '', 'i-leaf', '#e5f3ea', '#1c5d3a'], ['Agend. hoje', G.filter(x => x.data == hj).length, '', 'i-cal', '#fdf3dd', '#8a5a08'], ['Agend. mês', GM.length, '', 'i-tk', '#eaf2fb', '#2f6fb0'], ['Concluídos mês', done, '', 'i-ck', '#dcefe2', '#14532d'], ['Técnicos ativos', DB.tec.filter(x => (!d || x.tenantId == d) && x.ativo).length, '', 'i-us', '#efece2', '#6b675c'], ['Comparecimento', Math.round(100 * done / Math.max(1, done + nc)), '%', 'i-ch', '#fbe9e5', '#a03325']];
  $('kRow').innerHTML = kpis.map((k, i) => `<div class="col-6 col-md-4 col-xl-2"><div class="panel kpi d-flex justify-content-between"><div><div class="l">${k[0]}</div><div class="n" id="k${i}">0</div></div><div class="kico" style="background:${k[4]};color:${k[5]}"><svg class="ic"><use href="#${k[3]}"/></svg></div></div></div>`).join('');
  kpis.forEach((k, i) => cu($('k' + i), k[1], k[2]));
  Object.values(S.charts).forEach(c => c.destroy()); S.charts = {};
  const cTxt = getComputedStyle(document.body).getPropertyValue('--mut'), grid = getComputedStyle(document.body).getPropertyValue('--ln');
  if (window.Chart) {
    Chart.defaults.font.family = 'IBM Plex Sans'; Chart.defaults.color = cTxt;
    const meses = [...Array(6)].map((_, i) => { const dt = new Date(); dt.setMonth(dt.getMonth() - 5 + i); return dt.toLocaleDateString('pt-BR', { month: 'short' }) });
    S.charts.l = new Chart($('chLine'), { type: 'line', data: { labels: meses, datasets: [{ data: meses.map((_, i) => i == 5 ? GM.length : ri(18, 60) + A.length / 2), borderColor: '#2f9159', backgroundColor: 'rgba(47,145,89,.14)', fill: true, tension: .35, pointRadius: 3 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: grid } }, x: { grid: { display: false } } } } });
    const sv = {}; G.forEach(g => sv[g.serv] = (sv[g.serv] || 0) + 1); const top = Object.entries(sv).sort((a, b) => b[1] - a[1]).slice(0, 5);
    S.charts.b = new Chart($('chBar'), { type: 'bar', data: { labels: top.map(t => t[0]), datasets: [{ data: top.map(t => t[1]), backgroundColor: '#d9931f', borderRadius: 6 }] }, options: { maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: grid } }, y: { grid: { display: false } } } } });
    const st = {}; GM.forEach(g => st[g.st] = (st[g.st] || 0) + 1);
    S.charts.d = new Chart($('chDon'), { type: 'doughnut', data: { labels: Object.keys(st), datasets: [{ data: Object.values(st), backgroundColor: SC }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 7 } } } } });
  }
  const cm = {}; G.forEach(g => cm[g.com] = (cm[g.com] || 0) + 1); const rc = Object.entries(cm).sort((a, b) => b[1] - a[1]).slice(0, 5), mx = rc[0] ? rc[0][1] : 1;
  $('rankCom').innerHTML = rc.map(c => `<div class="mb-2"><div class="d-flex justify-content-between" style="font-size:.78rem"><span>${esc(c[0])}</span><b>${c[1]}</b></div><div class="bar"><i style="width:${100 * c[1] / mx}%"></i></div></div>`).join('');
  $('upList').innerHTML = G.filter(g => g.data >= hj && !['Cancelado', 'Concluído', 'Não Compareceu'].includes(g.st)).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)).slice(0, 5).map(g => { const a = DB.agri.find(x => x.id == g.agriId); return `<div class="d-flex gap-2 align-items-center p-2" style="border-bottom:1px solid var(--ln)"><span class="mn" style="font-size:.68rem;background:var(--sf2);border-radius:8px;padding:4px 7px">${fBR(g.data)} ${g.hora}</span><div style="font-size:.8rem"><b>${esc(a ? a.nome : '—')}</b><div style="color:var(--mut)">${g.serv}</div></div><span class="chip st${STAT.indexOf(g.st)} ms-auto"><i></i>${g.st}</span></div>` }).join('') || '<p class="p-3" style="color:var(--mut)">Sem atendimentos futuros.</p>';
  $('actFeed').innerHTML = DB.audit.filter(a => !d || a.tenantId == d).slice(0, 7).map(a => `<div class="d-flex gap-2 mb-1" style="font-size:.8rem"><span class="mn" style="color:var(--mut);font-size:.68rem">${new Date(a.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span><b>${esc(a.user)}</b><span style="color:var(--mut)">${esc(a.reg)}</span></div>`).join('')
}

/* ══════ CALENDÁRIO ══════ */
function renderCal() {
  const d = tid(), y = S.cal.getFullYear(), m = S.cal.getMonth();
  $('cLabel').textContent = S.cal.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  $('cHead').innerHTML = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(x => `<div class="cc" style="min-height:0;padding:6px;text-align:center"><span class="mn" style="font-size:.66rem">${x}</span></div>`).join('');
  $('cLeg').innerHTML = STAT.map((s, i) => `<span class="chip st${i}"><i></i>${s}</span>`).join('');
  const G = DB.agd.filter(g => (!d || g.tenantId == d) && (!$('cTec').value || g.tec == $('cTec').value) && (!$('cServ').value || g.serv == $('cServ').value));
  $('cCount').textContent = `${G.filter(g => { const dt = new Date(g.data + 'T12:00'); return dt.getMonth() == m && dt.getFullYear() == y }).length} atendimentos no mês`;
  const off = new Date(y, m, 1).getDay(); let html = '';
  for (let i = 0; i < 42; i++) {
    const dt = new Date(y, m, i - off + 1), ds = iso(dt), dim = dt.getMonth() != m;
    const evs = G.filter(g => g.data == ds).sort((a, b) => a.hora.localeCompare(b.hora));
    html += `<div class="cc ${dim ? 'dim' : ''} ${ds == hoje() ? 'today' : ''}" data-d="${ds}" ondragover="event.preventDefault();this.classList.add('dov')" ondragleave="this.classList.remove('dov')" ondrop="dropEv(event,this)" onclick="openAgd(null,'${ds}')"><span class="dn">${dt.getDate()}</span>${evs.map(g => `<div class="ev b${STAT.indexOf(g.st)}" draggable="${can('agendamentos', 'edi')}" ondragstart="event.dataTransfer.setData('t',this.dataset.id);event.stopPropagation()" data-id="${g.id}" onclick="event.stopPropagation();viewAgd('${g.id}')" title="${g.hora} · ${esc(g.serv)}">${g.hora} ${esc(((DB.agri.find(a => a.id == g.agriId) || {}).nome) || '').split(' ')[0]} · ${(g.serv || '').split(' ')[0]}</div>`).join('')}</div>`
  }
  $('cGrid').innerHTML = html
}
function calNav(n) { if (n == 0) S.cal = new Date(); else S.cal.setMonth(S.cal.getMonth() + n); renderCal() }
function dropEv(e, cell) { e.preventDefault(); cell.classList.remove('dov'); const g = DB.agd.find(x => x.id == e.dataTransfer.getData('t')); if (!g) return; g.data = cell.dataset.d; audit('agd.reagend', `Agendamento ${g.num} → ${fBR(g.data)}`, 'alteracao'); save(); renderCal(); toast(`↻ Reagendado para <b>${fBR(g.data)}</b>. Notificações enviadas.`) }
