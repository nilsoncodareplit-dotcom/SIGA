/* ══════ AGENDAMENTOS ══════ */
const agdF = () => { const d = tid(); return DB.agd.filter(g => (!d || g.tenantId == d) && (!S.f.a.q || ((DB.agri.find(a => a.id == g.agriId) || {}).nome || '').toLowerCase().includes(S.f.a.q.toLowerCase()) || g.num.toLowerCase().includes(S.f.a.q.toLowerCase())) && (!S.f.a.s || g.st == S.f.a.s) && (!S.f.a.v || g.serv == S.f.a.v) && (!S.f.a.t || g.tec == S.f.a.t)).sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora)) };
function renderAgd() {
  const L = agdF(), PP = 9, pg = Math.min(S.pg.a, Math.ceil(L.length / PP) || 1); S.pg.a = pg; $('aCount').textContent = `${L.length} registro(s)`;
  $('aTbody').innerHTML = L.slice((pg - 1) * PP, pg * PP).map(g => { const a = DB.agri.find(x => x.id == g.agriId); return `<tr><td class="mn" style="font-size:.7rem">${g.num}</td><td>${fBR(g.data)} · ${g.hora}</td><td><b>${esc(a ? a.nome : '—')}</b><div style="font-size:.7rem;color:var(--mut)">${esc(g.com)}</div></td><td>${g.serv}</td><td>${esc(g.tec)}</td><td><span class="chip st${STAT.indexOf(g.st)}"><i></i>${g.st}</span></td><td class="text-end"><button class="ib" onclick="viewAgd('${g.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-eye"/></svg></button> <button class="ib" onclick="openAgd('${g.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-pen"/></svg></button> <button class="ib" onclick="delAgd('${g.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-tr"/></svg></button></td></tr>` }).join('') || '<tr><td colspan="7" class="text-center p-4" style="color:var(--mut)">Nenhum agendamento encontrado.</td></tr>';
  $('aPag').innerHTML = pagBtns(pg, L.length, PP, 'S.pg.a', 'renderAgd')
}
const pagBtns = (pg, tot, pp, v, fn) => tot <= pp ? '' : `<button class="ib" ${pg == 1 ? 'disabled' : ''} onclick="${v}=${pg - 1};${fn}()">‹</button> <span class="mn mx-2" style="font-size:.7rem">${pg}/${Math.ceil(tot / pp)}</span> <button class="ib" ${pg == Math.ceil(tot / pp) ? 'disabled' : ''} onclick="${v}=${pg + 1};${fn}()">›</button>`;
function openAgd(id, dt) {
  if (!can('agendamentos', id ? 'edi' : 'ins')) return denied(); S.editAgd = id || null; const d = tid();
  $('fAgri').innerHTML = DB.agri.filter(a => !d || a.tenantId == d).map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join('');
  $('fServ').innerHTML = (T() ? T().serv : SERV).map(s => `<option>${s}</option>`).join('');
  $('fTec').innerHTML = DB.tec.filter(x => !d || x.tenantId == d).map(x => `<option>${esc(x.nome)}</option>`).join('');
  $('fStat').innerHTML = STAT.map(s => `<option>${s}</option>`).join('');
  if (id) { const g = DB.agd.find(x => x.id == id); $('maT').textContent = 'Editar ' + g.num; $('fAgri').value = g.agriId; $('fServ').value = g.serv; $('fTec').value = g.tec; $('fData').value = g.data; $('fHora').value = g.hora; $('fStat').value = g.st; $('fObs').value = g.obs || '' }
  else { $('maT').textContent = 'Novo agendamento'; $('fData').value = dt || hoje(); $('fHora').value = '09:00'; $('fObs').value = ''; $('fStat').value = 'Agendado' }
  M('mAgd').show()
}
function saveAgd() {
  if (!$('fAgri').value || !$('fServ').value) return toast('Informe agricultor e serviço.');
  const base = { agriId: $('fAgri').value, serv: $('fServ').value, tec: $('fTec').value, data: $('fData').value, hora: $('fHora').value, st: $('fStat').value, obs: $('fObs').value, com: (DB.agri.find(a => a.id == $('fAgri').value) || {}).com };
  if (S.editAgd) { Object.assign(DB.agd.find(x => x.id == S.editAgd), base); audit('agd.edit', 'Agendamento alterado', 'alteracao'); toast('✎ Agendamento atualizado.') }
  else { DB.agd.unshift({ id: 'g' + Date.now(), tenantId: tid(), num: `AGD-${new Date().getFullYear()}-${DB.seq++}`, ...base }); audit('agd.novo', `Agendamento criado (${base.serv})`, 'inclusao'); const t = T(); toast(t && t.notif.mail ? '✉ Confirmação enviada por e-mail' + (t.notif.whats ? ' e WhatsApp' : '') + '.' : '✓ Agendamento criado.') }
  save(); M('mAgd').hide(); renderAgd()
}
function viewAgd(id) {
  const g = DB.agd.find(x => x.id == id), a = DB.agri.find(x => x.id == g.agriId); $('avT').textContent = g.num;
  $('avB').innerHTML = `<div class="row g-2" style="font-size:.85rem"><div class="col-6"><label class="fl">Agricultor</label><b>${esc(a ? a.nome : '—')}</b></div><div class="col-6"><label class="fl">Comunidade</label>${esc(g.com)}</div><div class="col-6"><label class="fl">Data · hora</label>${fBR(g.data)} às ${g.hora}</div><div class="col-6"><label class="fl">Status</label><span class="chip st${STAT.indexOf(g.st)}"><i></i>${g.st}</span></div><div class="col-12"><label class="fl">Serviço</label>${g.serv}</div><div class="col-12"><label class="fl">Técnico</label>${esc(g.tec)}</div>${g.obs ? `<div class="col-12"><label class="fl">Obs.</label>${esc(g.obs)}</div>` : ''}</div>`;
  let act = `<button class="btn-g" data-bs-dismiss="modal">Fechar</button>`;
  if (can('agendamentos', 'edi')) { if (g.st == 'Agendado') act += `<button class="btn-p" onclick="setSt('${g.id}','Confirmado')">Confirmar</button>`; if (g.st == 'Confirmado') act += `<button class="btn-p" onclick="setSt('${g.id}','Em Atendimento')">Iniciar</button>`; if (g.st == 'Em Atendimento') act += `<button class="btn-p" onclick="setSt('${g.id}','Concluído')">Concluir</button>`; if (!['Cancelado', 'Concluído'].includes(g.st)) act += `<button class="btn btn-sm" style="color:var(--rd)" onclick="setSt('${g.id}','Cancelado')">Cancelar</button>` }
  $('avA').innerHTML = act; M('mAgdV').show()
}
function setSt(id, st) { const g = DB.agd.find(x => x.id == id); g.st = st; audit('agd.status', `${g.num} → ${st}`, st == 'Cancelado' ? 'exclusao' : 'alteracao'); save(); M('mAgdV').hide(); renderAgd(); toast(st == 'Cancelado' ? '⚠ Cancelado. Agricultor notificado.' : '✓ Status: ' + st) }
async function delAgd(id) { if (!can('agendamentos', 'del')) return denied(); if (!await ask('Excluir agendamento', 'Esta ação será registrada em auditoria e o item irá para a lixeira.', 'Excluir')) return; const i = DB.agd.findIndex(x => x.id == id); DB.trash.unshift({ kind: 'agd', snap: DB.agd[i], ts: new Date().toISOString(), reg: DB.agd[i].num }); DB.agd.splice(i, 1); audit('agd.del', 'Exclusão de agendamento', 'exclusao'); save(); renderAgd(); toast('🗑 Registro excluído e enviado à lixeira.') }
function expAgd() { const L = agdF(); csv('agendamentos.csv', ['Numero', 'Data', 'Hora', 'Agricultor', 'Servico', 'Tecnico', 'Comunidade', 'Status'], L.map(g => [g.num, fBR(g.data), g.hora, (DB.agri.find(a => a.id == g.agriId) || {}).nome, g.serv, g.tec, g.com, g.st])); audit('rel.xls', 'Exportação Excel de agendamentos', 'alteracao') }

/* ══════ AGRICULTORES ══════ */
const agriF = () => { const d = tid(); return DB.agri.filter(a => (!d || a.tenantId == d) && (!S.f.r.q || a.nome.toLowerCase().includes(S.f.r.q.toLowerCase()) || a.cpf.includes(S.f.r.q)) && (!S.f.r.c || a.com == S.f.r.c)) };
function renderAgri() {
  const L = agriF(), PP = 8, pg = Math.min(S.pg.r, Math.ceil(L.length / PP) || 1); S.pg.r = pg; $('rCount').textContent = `${L.length} cadastro(s)`;
  $('rTbody').innerHTML = L.slice((pg - 1) * PP, pg * PP).map(a => `<tr><td><b>${esc(a.nome)}</b><div style="font-size:.7rem;color:var(--mut)">${a.tel}</div></td><td class="mn" style="font-size:.72rem">${a.cpf}</td><td>${esc(a.com)}</td><td>${a.cul}</td><td>${a.dap ? `<span class="chip st1"><i></i>CAF ativo</span>` : `<span class="chip st5"><i></i>sem CAF</span>`}</td><td class="text-end"><button class="ib" onclick="viewAgri('${a.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-eye"/></svg></button> <button class="ib" onclick="openAgri('${a.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-pen"/></svg></button> <button class="ib" onclick="delAgri('${a.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-tr"/></svg></button></td></tr>`).join('') || '<tr><td colspan="6" class="text-center p-4" style="color:var(--mut)">Nenhum agricultor.</td></tr>';
  $('rPag').innerHTML = pagBtns(pg, L.length, PP, 'S.pg.r', 'renderAgri')
}
function openAgri(id) {
  if (!can('cadastros', id ? 'edi' : 'ins')) return denied(); S.editAgri = id || null; const d = tid();
  $('gCoop').innerHTML = '<option value="">— Nenhuma —</option>' + DB.ent.filter(e => !d || e.tenantId == d).map(e => `<option>${esc(e.nome)}</option>`).join('');
  ['gNome', 'gCpf', 'gRg', 'gNis', 'gDap', 'gNasc', 'gTel', 'gWha', 'gMail', 'gCep', 'gCom', 'gRam', 'gBai', 'gRua', 'gNum', 'gGps', 'gCul', 'gAre', 'gPro'].forEach(i => $(i).value = '');
  if (id) { const a = DB.agri.find(x => x.id == id); $('gT').textContent = 'Editar agricultor'; $('gNome').value = a.nome; $('gCpf').value = a.cpf; $('gNis').value = a.nis; $('gDap').value = a.dap; $('gTel').value = a.tel; $('gCom').value = a.com; $('gCul').value = a.cul; $('gAre').value = a.area; $('gPro').value = a.prod; $('gFam').checked = a.fam; $('gCoop').value = a.coop || '' } else $('gT').textContent = 'Novo agricultor';
  M('mAgri').show()
}
function saveAgri() {
  if (!$('gNome').value) return toast('Nome é obrigatório.');
  const o = { nome: $('gNome').value, cpf: $('gCpf').value, nis: $('gNis').value, dap: $('gDap').value, tel: $('gTel').value, com: $('gCom').value || 'Centro', cul: $('gCul').value || '—', area: +$('gAre').value || 0, prod: +$('gPro').value || 0, fam: $('gFam').checked, coop: $('gCoop').value };
  if (S.editAgri) { Object.assign(DB.agri.find(x => x.id == S.editAgri), o); audit('agri.edit', 'Cadastro de agricultor alterado', 'alteracao') }
  else { DB.agri.unshift({ id: 'a' + Date.now(), tenantId: tid(), ...o }); audit('agri.novo', `Agricultor(a) ${o.nome}`, 'inclusao') }
  save(); M('mAgri').hide(); renderAgri(); toast('✓ Cadastro salvo.')
}
async function delAgri(id) { if (!can('cadastros', 'del')) return denied(); if (!await ask('Excluir agricultor', 'Somente administradores excluem cadastros. Ação auditada.', 'Excluir')) return; const i = DB.agri.findIndex(x => x.id == id); DB.trash.unshift({ kind: 'agri', snap: DB.agri[i], ts: new Date().toISOString(), reg: DB.agri[i].nome }); DB.agri.splice(i, 1); audit('agri.del', 'Exclusão de agricultor', 'exclusao'); save(); renderAgri(); toast('🗑 Cadastro excluído.') }
function viewAgri(id) {
  const a = DB.agri.find(x => x.id == id); $('drwT').textContent = a.nome; const G = DB.agd.filter(g => g.agriId == id);
  $('drwB').innerHTML = `<span class="chip st1 mb-2"><i></i>${a.fam ? 'Agricultura familiar' : 'Produção empresarial'}</span>
 <div class="row g-2 mt-1" style="font-size:.84rem"><div class="col-6"><label class="fl">CPF</label>${a.cpf}</div><div class="col-6"><label class="fl">NIS</label>${a.nis}</div><div class="col-6"><label class="fl">CAF/DAP</label>${a.dap || '—'}</div><div class="col-6"><label class="fl">Telefone</label>${a.tel}</div><div class="col-12"><label class="fl">Comunidade</label>${esc(a.com)}</div></div>
 <div class="panel p-3 mt-3"><b class="df" style="font-size:.85rem">Produção rural</b><div class="row g-2 mt-1"><div class="col-6"><label class="fl">Cultura</label>${a.cul}</div><div class="col-3"><label class="fl">Área</label>${a.area} ha</div><div class="col-3"><label class="fl">Produção</label>${a.prod} t</div><div class="col-12"><label class="fl">Cooperativa</label>${esc(a.coop) || '—'}</div></div></div>
 <div class="panel p-3 mt-3"><b class="df" style="font-size:.85rem">Documentos</b>${['RG.pdf', 'CPF.pdf', 'CAF.pdf', 'Comprovante de residência.pdf', 'Foto da propriedade.jpg'].map(x => `<div class="d-flex gap-2 align-items-center mt-2" style="font-size:.8rem"><svg class="ic" style="color:var(--g6)"><use href="#i-doc"/></svg>${x}<button class="ib ms-auto" style="width:26px;height:26px"><svg class="ic" style="width:13px;height:13px"><use href="#i-dl"/></svg></button></div>`).join('')}</div>
 <div class="panel p-3 mt-3"><b class="df" style="font-size:.85rem">Histórico (${G.length})</b>${G.slice(0, 5).map(g => `<div class="d-flex justify-content-between mt-2" style="font-size:.78rem"><span>${fBR(g.data)} · ${g.serv}</span><span class="chip st${STAT.indexOf(g.st)}"><i></i>${g.st}</span></div>`).join('') || '<span style="color:var(--mut)">Sem atendimentos.</span>'}</div>`;
  bootstrap.Offcanvas.getOrCreateInstance($('drw')).show()
}
function expAgri() { csv('agricultores.csv', ['Nome', 'CPF', 'Comunidade', 'Cultura', 'Area_ha', 'Producao_t'], agriF().map(a => [a.nome, a.cpf, a.com, a.cul, a.area, a.prod])); audit('rel.xls', 'Exportação Excel de agricultores', 'alteracao') }
