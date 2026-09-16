/* ══════ CADASTROS ══════ */
const CAD = [['Técnicos', ['Nome', 'Função', 'Situação'], () => DB.tec.filter(x => x.tenantId == S.user.tenantId).map(t => [esc(t.nome), t.funcao, t.ativo ? '<span class="chip st1"><i></i>Ativo</span>' : '<span class="chip st4"><i></i>Inativo</span>']), 'Técnico'],
['Comunidades', ['Comunidade', 'Agricultores', 'Agendamentos'], () => DB.com.filter(x => x.tenantId == S.user.tenantId).map(c => [esc(c.nome), DB.agri.filter(a => a.com == c.nome).length, DB.agd.filter(g => g.com == c.nome).length]), 'Comunidade'],
['Associações & Cooperativas', ['Entidade', 'Tipo', 'Presidente', 'Membros'], () => DB.ent.filter(x => x.tenantId == S.user.tenantId).map(e => [esc(e.nome), e.tipo, esc(e.presidente), e.membros]), 'Entidade'],
['Veículos & Máquinas', ['Item', 'Categoria', 'Placa', 'Status'], () => DB.frota.filter(x => x.tenantId == S.user.tenantId).map(f => [esc(f.nome), f.cat, f.placa, f.status == 'Operacional' ? '<span class="chip st1"><i></i>Operacional</span>' : '<span class="chip st2"><i></i>Manutenção</span>']), 'Item']];
function cadTab(i, btn) { S.cadTab = i; document.querySelectorAll('#cadTabs button').forEach(b => b.className = 'btn-g'); btn.className = 'btn-p'; renderCad() }
function renderCad() {
  const c = CAD[S.cadTab]; $('cadTitle').textContent = c[0]; $('cadHead').innerHTML = '<tr>' + c[1].map(h => `<th>${h}</th>`).join('') + '</tr>';
  $('cadBody').innerHTML = c[2]().map(r => '<tr>' + r.map(x => `<td>${x}</td>`).join('') + '</tr>').join('') || '<tr><td colspan="4" class="p-3 text-center" style="color:var(--mut)">Vazio.</td></tr>'
}
let ENT = null; function openEnt() {
  if (S.user.role == 'user' && !can('cadastros', 'ins')) return denied(); ENT = CAD[S.cadTab]; $('eT2').textContent = 'Adicionar · ' + ENT[3];
  const fields = { 0: [['Nome', 'n'], ['Função (registro profissional)', 'f']], 1: [['Nome da comunidade', 'n']], 2: [['Nome', 'n'], ['Tipo', 't'], ['Presidente', 'p'], ['Membros', 'm']], 3: [['Descrição', 'n'], ['Categoria', 't'], ['Placa', 'p']] }[S.cadTab];
  $('eDyn').innerHTML = fields.map(f => `<div class="col-${f[0] == 'Nome' || f[0] == 'Descrição' ? '12' : '6'}"><label class="fl">${f[0]}</label><input class="inp" id="e_${f[1]}" title="Preencha: ${f[0]}"></div>`).join(''); M('mEnt').show()
}
function saveEnt() {
  const v = x => ($('e_' + x) ? $('e_' + x).value : ''); if (!v('n')) return toast('Preencha o nome.'); const d = S.user.tenantId;
  if (S.cadTab == 0) DB.tec.push({ id: 't' + Date.now(), tenantId: d, nome: v('n'), funcao: v('f') || 'Técnico', ativo: true });
  if (S.cadTab == 1) DB.com.push({ id: 'c' + Date.now(), tenantId: d, nome: v('n') });
  if (S.cadTab == 2) DB.ent.push({ id: 'e' + Date.now(), tenantId: d, nome: v('n'), tipo: v('t') || 'Associação', presidente: v('p'), membros: +v('m') || 0 });
  if (S.cadTab == 3) DB.frota.push({ id: 'f' + Date.now(), tenantId: d, nome: v('n'), cat: v('t') || 'Veículo', placa: v('p') || '—', status: 'Operacional' });
  audit('cad.novo', `${ENT[3]}: ${v('n')}`, 'inclusao'); save(); M('mEnt').hide(); renderCad(); toast('✓ Adicionado.')
}

/* ══════ RELATÓRIOS ══════ */
const REPS = [['com', 'Agricultores por comunidade', 'Distribuição territorial do cadastro rural.'], ['cult', 'Agricultores por cultura', 'Matriz produtiva do município.'], ['per', 'Agendamentos por período', 'Movimento da secretaria no intervalo.'], ['tec', 'Agendamentos por técnico', 'Carga de trabalho da equipe.'], ['serv', 'Agendamentos por serviço', 'Demanda por tipo de atendimento.'], ['prod', 'Produtividade', 'Realizados × pendentes por técnico.']];
function renderRep() { $('repCards').innerHTML = REPS.map(r => `<div class="col-md-4"><div class="panel p-3"><b class="df">${r[1]}</b><p style="font-size:.78rem;color:var(--mut)">${r[2]}</p><div class="d-flex gap-2"><button class="btn btn-a btn-sm" onclick="gerRel('${r[0]}','pdf')">PDF</button><button class="btn btn-p btn-sm" onclick="gerRel('${r[0]}','xls')">Excel</button><button class="btn btn-g btn-sm" onclick="gerRel('${r[0]}')">Ver</button></div></div></div>`).join('') }
function repData(k) {
  const d = tid(), de = $('repDe').value, ate = $('repAte').value;
  const A = DB.agri.filter(a => !d || a.tenantId == d), G = DB.agd.filter(g => (!d || g.tenantId == d) && (!de || g.data >= de) && (!ate || g.data <= ate));
  const grp = (arr, f) => { const o = {}; arr.forEach(x => o[f(x)] = (o[f(x)] || 0) + 1); return Object.entries(o).sort((a, b) => b[1] - a[1]) };
  if (k == 'com') return { t: 'Agricultores por comunidade', h: ['Comunidade', 'Agricultores', '%'], r: grp(A, a => a.com).map(x => [x[0], x[1], (100 * x[1] / Math.max(1, A.length)).toFixed(1) + '%']) };
  if (k == 'cult') return { t: 'Agricultores por cultura', h: ['Cultura', 'Agricultores', '%'], r: grp(A, a => a.cul).map(x => [x[0], x[1], (100 * x[1] / Math.max(1, A.length)).toFixed(1) + '%']) };
  if (k == 'per') return { t: 'Agendamentos por período', h: ['Nº', 'Data', 'Serviço', 'Agricultor', 'Status'], r: G.map(g => [g.num, fBR(g.data), g.serv, (DB.agri.find(a => a.id == g.agriId) || {}).nome, g.st]) };
  if (k == 'tec') return { t: 'Agendamentos por técnico', h: ['Técnico', 'Atendimentos'], r: grp(G, g => g.tec) };
  if (k == 'serv') return { t: 'Agendamentos por serviço', h: ['Serviço', 'Atendimentos'], r: grp(G, g => g.serv) };
  return { t: 'Produtividade por técnico', h: ['Técnico', 'Concluídos', 'Pendentes', 'Taxa'], r: grp(G, g => g.tec).map(([t]) => { const c = G.filter(g => g.tec == t && g.st == 'Concluído').length, p = G.filter(g => g.tec == t && !['Concluído', 'Cancelado', 'Não Compareceu'].includes(g.st)).length; return [t, c, p, Math.round(100 * c / Math.max(1, c + p)) + '%'] }) }
}
function gerRel(k, fmt) {
  if (!can('relatorios', 'ver')) return denied(); const d = repData(k);
  $('repPrev').hidden = false; $('repTitle').textContent = d.t;
  $('repTbl').innerHTML = '<thead><tr>' + d.h.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>' + d.r.map(r => '<tr>' + r.map(c => `<td>${esc(c)}</td>`).join('') + '</tr>').join('') + '</tbody>';
  if (fmt == 'xls') { if (!can('relatorios', 'xls')) return denied(); csv(d.t.replace(/\s/g, '_') + '.csv', d.h, d.r); audit('rel.xls', 'Exportação Excel: ' + d.t, 'alteracao') }
  if (fmt == 'pdf') { if (!can('relatorios', 'pdf')) return denied(); printRep(d); audit('rel.pdf', 'Exportação PDF: ' + d.t, 'alteracao') }
}
function csv(n, h, r) { const b = '\uFEFF' + [h, ...r].map(x => x.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([b], { type: 'text/csv' })); a.download = n; a.click() }
function printRep(d) { $('printArea').innerHTML = `<div style="font-family:'IBM Plex Sans';padding:30px;color:#111"><div style="display:flex;justify-content:space-between;border-bottom:3px solid #1c5d3a;padding-bottom:10px"><b style="font-family:Archivo;font-size:20px">SIGA PARÁ · ${T() ? T().nome.toUpperCase() : 'PLATAFORMA'}</b><span>${new Date().toLocaleDateString('pt-BR')}</span></div><h2 style="font-family:Archivo;margin:18px 0 6px">${d.t}</h2><table style="width:100%;border-collapse:collapse;font-size:12px"><tr>${d.h.map(h => `<th style="text-align:left;border-bottom:2px solid #333;padding:6px">${h}</th>`).join('')}</tr>${d.r.map(r => `<tr>${r.map(c => `<td style="border-bottom:1px solid #ccc;padding:6px">${esc(c)}</td>`).join('')}</tr>`).join('')}</table><p style="margin-top:20px;font-size:10px;color:#666">Documento gerado pelo SIGA Pará — uso interno.</p></div>`; window.print() }
