/* ══════ USUÁRIOS ══════ */
function renderUsers() { $('uTbody').innerHTML = DB.users.filter(u => u.tenantId == S.user.tenantId).map(u => `<tr><td><b>${esc(u.nome)}</b><div style="font-size:.7rem;color:var(--mut)">${u.email}</div></td><td><span class="chip ${u.role == 'admin' ? 'st2' : 'st0'}"><i></i>${u.role == 'admin' ? 'Admin Municipal' : 'Usuário Comum'}</span></td><td>${u.role == 'admin' ? '<span style="color:var(--mut);font-size:.75rem">Todas do município</span>' : `<button class="btn-g btn-sm" onclick="openPerms('${u.id}')">Matriz de permissões</button>`}</td><td>${u.ativo ? '<span class="chip st1"><i></i>Ativo</span>' : '<span class="chip st4"><i></i>Desativado</span>'}</td><td class="text-end"><button class="ib" onclick="openUser('${u.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#i-pen"/></svg></button> <button class="ib" onclick="togUser('${u.id}')"><svg class="ic" style="width:14px;height:14px"><use href="#${u.ativo ? 'i-x' : 'i-ck'}"/></svg></button></td></tr>`).join('') }
function openUser(id) {
  S.editUser = id || null; const u = id ? DB.users.find(x => x.id == id) : null; $('uT2').textContent = u ? 'Editar usuário' : 'Novo usuário';
  $('uNome').value = u ? u.nome : ''; $('uEmail').value = u ? u.email : ''; $('uPapel').value = u ? u.role : 'user'; $('uAtivo').checked = u ? u.ativo : true; $('uSenha').value = ''; M('mUser').show()
}
function saveUser() {
  if (!$('uNome').value || !$('uEmail').value) return toast('Preencha nome e e-mail.');
  if (S.editUser) { const u = DB.users.find(x => x.id == S.editUser); Object.assign(u, { nome: $('uNome').value, email: $('uEmail').value, role: $('uPapel').value, ativo: $('uAtivo').checked }); if ($('uSenha').value) u.senha = $('uSenha').value; audit('user.edit', 'Usuário alterado: ' + u.nome, 'alteracao') }
  else { DB.users.push({ id: 'u' + Date.now(), tenantId: S.user.tenantId, nome: $('uNome').value, email: $('uEmail').value, role: $('uPapel').value, senha: $('uSenha').value || 'muda123', ativo: $('uAtivo').checked, perms: { cadastros: { ver: 1, ins: 1, edi: 1 }, agendamentos: { ver: 1, ins: 1, edi: 1 }, relatorios: { ver: 1 }, config: {} } }); audit('user.novo', 'Usuário criado: ' + $('uNome').value, 'inclusao') }
  save(); M('mUser').hide(); renderUsers(); toast('✓ Usuário salvo.')
}
function togUser(id) { const u = DB.users.find(x => x.id == id); u.ativo = !u.ativo; audit(u.ativo ? 'user.ativar' : 'user.desativar', 'Usuário ' + u.nome, 'alteracao'); save(); renderUsers() }
const PM = [['cadastros', 'Módulo Cadastros', ['ver', 'Visualizar'], ['ins', 'Inserir'], ['edi', 'Editar'], ['del', 'Excluir']], ['agendamentos', 'Módulo Agendamentos', ['ver', 'Visualizar'], ['ins', 'Inserir'], ['edi', 'Editar'], ['del', 'Excluir']], ['relatorios', 'Módulo Relatórios', ['ver', 'Visualizar'], ['pdf', 'Exportar PDF'], ['xls', 'Exportar Excel']], ['config', 'Módulo Configurações', ['ver', 'Visualizar'], ['edi', 'Editar']]];
function openPerms(id) {
  S.permUser = id; const u = DB.users.find(x => x.id == id); $('pT2').textContent = 'Permissões · ' + u.nome;
  $('pGrid').innerHTML = PM.map(m => `<div class="panel p-3 mb-2"><b class="df" style="font-size:.82rem">${m[1]}</b><div class="d-flex gap-3 flex-wrap mt-2">${m.slice(2).map(p => `<div class="form-check form-switch"><input class="form-check-input" type="checkbox" id="pm_${m[0]}_${p[0]}" ${u.perms && u.perms[m[0]] && u.perms[m[0]][p[0]] ? 'checked' : ''}><label class="form-check-label" style="font-size:.8rem">${p[1]}</label></div>`).join('')}</div></div>`).join(''); M('mPerms').show()
}
function savePerms() {
  const u = DB.users.find(x => x.id == S.permUser); u.perms = {}; PM.forEach(m => { u.perms[m[0]] = {}; m.slice(2).forEach(p => { u.perms[m[0]][p[0]] = $('pm_' + m[0] + '_' + p[0]).checked ? 1 : 0 }) });
  audit('perm.alt', 'Permissões de ' + u.nome + ' atualizadas', 'alteracao'); save(); M('mPerms').hide(); renderUsers(); toast('🛡 Permissões salvas individualmente no banco.')
}

/* ══════ AUDITORIA ══════ */
function audTab(i) { $('audPane0').hidden = i != 0; $('audPane1').hidden = i != 1; renderAud() }
function renderAud() {
  const d = tid();
  const L = DB.audit.filter(a => (!d || a.tenantId == d) && (!$('auQ').value || (a.user + a.reg).toLowerCase().includes($('auQ').value.toLowerCase())) && (!$('auT').value || a.tipo == $('auT').value));
  const TC = { login: 'st0', inclusao: 'st1', alteracao: 'st2', exclusao: 'st4', seguranca: 'st3', planos: 'st2' };
  $('auTbody').innerHTML = L.slice(0, 60).map(a => `<tr><td class="mn" style="font-size:.7rem">${new Date(a.ts).toLocaleDateString('pt-BR')} ${new Date(a.ts).toLocaleTimeString('pt-BR')}</td><td>${esc(a.user)}</td><td class="mn" style="font-size:.7rem">${a.ip}</td><td>${esc(a.acao)}</td><td>${esc(a.reg)}</td><td><span class="chip ${TC[a.tipo] || 'st5'}"><i></i>${a.tipo}</span></td></tr>`).join('');
  $('trTbody').innerHTML = DB.trash.filter(t => !d || t.snap.tenantId == d).map((t, i) => `<tr><td class="mn" style="font-size:.7rem">${new Date(t.ts).toLocaleDateString('pt-BR')}</td><td>${esc(t.reg)}</td><td>${t.kind == 'agd' ? 'Agendamento' : 'Agricultor'}</td><td class="text-end"><button class="btn-g btn-sm" onclick="restore(${i})"><svg class="ic" style="width:13px;height:13px"><use href="#i-rst"/></svg> Restaurar</button></td></tr>`).join('') || '<tr><td colspan="4" class="p-3 text-center" style="color:var(--mut)">Lixeira vazia.</td></tr>'
}
function restore(i) { const t = DB.trash[i]; (t.kind == 'agd' ? DB.agd : DB.agri).unshift(t.snap); DB.trash.splice(i, 1); audit('lixeira.rest', 'Restaurado: ' + t.reg, 'alteracao'); save(); renderAud(); toast('↩ Registro restaurado.') }

/* ══════ CONFIG ══════ */
function renderCfg() {
  const t = T(); if (!t) return; $('cfNome').value = 'Secretaria Municipal de Agricultura de ' + t.nome; $('cfSigla').value = t.sigla; $('cfMail').checked = t.notif.mail; $('cfWhats').checked = t.notif.whats; $('cfLemb').value = t.notif.lemb; $('cfSess').value = S.lim / 60;
  $('cfServ').innerHTML = SERV.map(s => `<span class="chip ${t.serv.includes(s) ? 'st1' : 'st5'}" style="cursor:pointer" onclick="togServ('${s}',this)"><i></i>${s}</span>`).join('');
  $('cfBk').innerHTML = `<label class="fl">Backups (automático diário 01:00)</label><div class="mn mt-1" style="font-size:.7rem;color:var(--mut)">▣ bk-${hoje()} 01:00 · automático · ${t.storage} MB · íntegro</div>`
}
function togServ(s, el) { const t = T(); t.serv = t.serv.includes(s) ? t.serv.filter(x => x != s) : [...t.serv, s]; el.className = 'chip ' + (t.serv.includes(s) ? 'st1' : 'st5'); save() }
function saveCfg() { const t = T(); t.notif = { mail: $('cfMail').checked, whats: $('cfWhats').checked, lemb: $('cfLemb').value }; S.lim = +$('cfSess').value * 60; audit('cfg.alt', 'Configurações do município alteradas', 'alteracao'); save(); toast('✓ Configurações salvas.') }
function manualBk() { audit('backup.manual', 'Backup manual gerado', 'seguranca'); toast('▣ Backup manual concluído e criptografado.') }

/* ══════ SUPER ADMIN ══════ */
function renderMun() {
  $('mkRow').innerHTML = [['Municípios ativos', DB.tenants.filter(t => t.ativo).length], ['Usuários totais', DB.users.filter(u => u.tenantId).length], ['Agricultores na plataforma', DB.agri.length], ['Agendamentos totais', DB.agd.length]].map(k => `<div class="col-6 col-xl-3"><div class="panel kpi"><div class="l">${k[0]}</div><div class="n">${k[1]}</div></div></div>`).join('');
  $('mTbody').innerHTML = DB.tenants.map(t => `<tr><td><b>${t.nome}</b> <span class="mn" style="font-size:.64rem;color:var(--mut)">TENANT ${t.id.toUpperCase()}</span></td>
 <td><select class="inp" style="width:auto;padding:.25rem .5rem;font-size:.78rem" onchange="setPlano('${t.id}',this.value)"><option value="ess" ${t.plano == 'ess' ? 'selected' : ''}>Essencial</option><option value="pro" ${t.plano == 'pro' ? 'selected' : ''}>Profissional</option></select></td>
 <td>${DB.users.filter(u => u.tenantId == t.id).length}</td><td>${DB.agri.filter(a => a.tenantId == t.id).length}</td>
 <td style="min-width:130px"><div class="bar"><i style="width:${100 * t.storage / t.max}%"></i></div><span class="mn" style="font-size:.62rem;color:var(--mut)">${t.storage}/${t.max} MB</span></td>
 <td>${t.ativo ? '<span class="chip st1"><i></i>Ativo</span>' : '<span class="chip st4"><i></i>Suspenso</span>'}</td>
 <td class="text-end"><button class="btn-g btn-sm" onclick="togTen('${t.id}')">${t.ativo ? 'Suspender' : 'Ativar'}</button></td></tr>`).join('')
}
function setPlano(id, pl) { const t = DB.tenants.find(x => x.id == id); t.plano = pl; t.max = pl == 'pro' ? 1024 : 512; audit('plano.ativar', `Plano ${pl == 'pro' ? 'Profissional' : 'Essencial'} ativado para ${t.nome}`, 'planos'); save(); renderMun(); toast(`★ Plano <b>${pl == 'pro' ? 'Profissional' : 'Essencial'}</b> ativado para ${t.nome}.`) }
function togTen(id) { const t = DB.tenants.find(x => x.id == id); t.ativo = !t.ativo; audit(t.ativo ? 'ten.ativar' : 'ten.suspender', 'Município ' + t.nome, 'planos'); save(); renderMun(); toast(t.ativo ? '✓ Município ativado.' : '⛔ Município suspenso — usuários bloqueados.') }
function saveTen() {
  if (!$('tNome').value) return toast('Informe o município.'); const id = 't' + Date.now();
  DB.tenants.push({ id, nome: $('tNome').value, sigla: ($('tSigla').value || 'MUN').toUpperCase(), plano: $('tPlano').value, ativo: true, storage: 12, max: 512, notif: { mail: true, whats: false, lemb: '24h antes' }, serv: [...SERV] });
  DB.com.push({ id: 'c' + id, tenantId: id, nome: 'Centro' });
  if ($('tEmail').value) DB.users.push({ id: 'u' + id, role: 'admin', tenantId: id, nome: 'Admin de ' + $('tNome').value, email: $('tEmail').value, senha: 'admin123', ativo: true });
  audit('ten.novo', 'Tenant criado: ' + $('tNome').value, 'planos'); save(); M('mTen').hide(); renderMun(); toast('✓ Tenant provisionado com isolamento total de dados.')
}
const PLANS = [{ id: 'ess', n: 'Essencial', p: 'R$ 290/mês', f: ['Até 3 usuários', '500 agricultores', '512 MB de armazenamento', 'Relatórios PDF/Excel', 'Suporte em horário comercial'], on: true },
{ id: 'pro', n: 'Profissional', p: 'R$ 590/mês', f: ['Até 12 usuários', 'Agricultores ilimitados', '1 GB de armazenamento', 'Notificações WhatsApp', 'Backup com retenção de 90 dias'], on: true, dest: 1 },
{ id: 'sup', n: 'Super Admin', p: 'Gestão da plataforma', f: ['Controle de todos os tenants', 'Ativação de planos e suspensões', 'Logs globais e lixeira', 'SMTP, backups e infraestrutura', 'Não contratável por municípios'], sup: 1 }];
function renderPlans() {
  $('pCards').innerHTML = PLANS.map(p => `<div class="col-md-4"><div class="panel p-4 h-100" style="${p.dest ? 'border:2px solid var(--am2)' : ''};${p.sup ? 'background:var(--g9);color:#e9e6da' : ''}">
 ${p.sup ? '<span class="chip st2 mb-2"><i></i>EXCLUSIVO DA PLATAFORMA</span>' : p.dest ? '<span class="chip st2 mb-2"><i></i>MAIS CONTRATADO</span>' : ''}
 <h3 class="df" style="font-weight:800">${p.n}</h3><div class="mn" style="color:${p.sup ? 'var(--am2)' : 'var(--am)'};font-size:.8rem">${p.p}</div>
 <ul class="mt-3 ps-3" style="font-size:.83rem">${p.f.map(x => `<li class="mb-1">${x}</li>`).join('')}</ul>
 <div class="mt-3">${p.sup ? '<div class="mn" style="font-size:.68rem;color:#9fb39b">NÍVEL DO SUPER ADMIN · SEMPRE ATIVO</div>' : `<div class="form-check form-switch"><input class="form-check-input" type="checkbox" ${p.on ? 'checked' : ''} onchange="togPlan('${p.id}',this.checked)"><label class="form-check-label" style="font-size:.8rem">Disponível para contratação</label></div>`}</div>
 <div class="mn mt-2" style="font-size:.68rem;color:${p.sup ? '#9fb39b' : 'var(--mut)'}">${p.sup ? '1 conta ativa (Super Admin)' : DB.tenants.filter(t => t.plano == p.id).length + ' município(s) neste plano'}</div></div></div>`).join('')
}
function togPlan(id, on) { const p = PLANS.find(x => x.id == id); p.on = on; audit('plano.disp', `Plano ${p.n} ${on ? 'disponibilizado' : 'oculto'} na plataforma`, 'planos'); toast(`Plano ${p.n} ${on ? 'disponível' : 'oculto'}.`) }
function renderLogs() {
  $('lTen').innerHTML = '<option value="">Todos os municípios</option>' + DB.tenants.map(t => `<option>${t.nome}</option>`).join('');
  const L = DB.audit.filter(a => !$('lTen').value || (DB.tenants.find(t => t.id == a.tenantId) || {}).nome == $('lTen').value);
  $('lTbody').innerHTML = L.slice(0, 80).map(a => `<tr><td class="mn" style="font-size:.7rem">${new Date(a.ts).toLocaleDateString('pt-BR')} ${new Date(a.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td><td>${(DB.tenants.find(t => t.id == a.tenantId) || { nome: '— Plataforma —' }).nome}</td><td>${esc(a.user)}</td><td>${esc(a.acao)}</td><td>${esc(a.reg)}</td></tr>`).join('')
}
function renderInfra() {
  $('iStats').innerHTML = [['Uptime (30d)', '99,97%'], ['Requisições 24h', '48.213'], ['Sessões ativas', DB.users.filter(u => u.ativo).length], ['Tokens JWT emitidos', DB.audit.filter(a => a.tipo == 'login').length + 1240]].map(k => `<div class="col-6"><div class="panel p-3" style="background:var(--sf2)"><div style="color:var(--mut);font-size:.68rem">${k[0]}</div><b class="df" style="font-size:1.2rem">${k[1]}</b></div></div>`).join('');
  $('iStore').innerHTML = DB.tenants.map(t => `<div class="mb-2"><div class="d-flex justify-content-between" style="font-size:.76rem"><span>${t.nome}</span><span class="mn">${t.storage}/${t.max} MB</span></div><div class="bar"><i style="width:${100 * t.storage / t.max}%"></i></div></div>`).join('');
  $('iBkL').innerHTML = [0, 1, 2, 3].map(i => { const d = new Date(); d.setDate(d.getDate() - i); return `<div class="d-flex justify-content-between mb-1"><span>▣ bk-${iso(d)} 01:00</span><span style="color:var(--g6)">✓ íntegro · ${412 + i * 7} MB</span></div>` }).join('')
}
function saveInfra() { audit('infra.cfg', 'Configuração de SMTP/backup alterada pelo Super Admin', 'seguranca'); toast('✓ Infraestrutura salva.') }

/* ══════ TEMA / SESSÃO ══════ */
function toggleTheme() {
  const d = document.documentElement.dataset.theme == 'dark'; document.documentElement.dataset.theme = d ? 'light' : 'dark'; $('btnTheme').innerHTML = `<svg class="ic"><use href="#${d ? 'i-moon' : 'i-sun'}"/></svg>`; if (S.view == 'dashboard') renderDash()
}
setInterval(() => {
  if (!S.user) return; const r = S.lim - Math.floor((Date.now() - S.last) / 1000); $('sessT').textContent = pad(Math.max(0, Math.floor(r / 60))) + ':' + pad(Math.max(0, r % 60)); if (r <= 0) logout('⏱ Sessão expirada por inatividade.')
}, 1000);
['click', 'keydown', 'touchstart'].forEach(e => {
  if(typeof addEventListener !== 'undefined') {
    addEventListener(e, () => S.last = Date.now(), { passive: true })
  }
});
if (typeof localStorage !== 'undefined') {
  if (localStorage.getItem('siga_theme') == 'dark') toggleTheme();
  if (typeof addEventListener !== 'undefined') {
    addEventListener('beforeunload', () => localStorage.setItem('siga_theme', document.documentElement.dataset.theme));
  }
}
if(typeof document !== 'undefined') {
  const lgPass = document.getElementById('lgPass');
  if(lgPass) {
    lgPass.addEventListener('keydown', e => { if (e.key == 'Enter') doLogin() });
  }
}

/* ══════ DOCUMENTOS LGPD ══════ */
function lgpdTab(n) {
  $('lgpdBtn0').className = n == 0 ? 'btn-p' : 'btn-g';
  $('lgpdBtn1').className = n == 1 ? 'btn-p' : 'btn-g';
  $('lgpdPane0').hidden = n != 0;
  $('lgpdPane1').hidden = n != 1;
}

const origShowViewLgpd = showView;
showView = function(v) {
  origShowViewLgpd(v);
  if (v == 'documentos') renderLgpdSel();
};

function renderLgpdSel() {
  const d = S.user.tenantId;
  const agris = DB.agri.filter(x => x.tenantId == d).sort((a,b)=>a.nome.localeCompare(b.nome));
  $('lgpdAgriSel').innerHTML = '<option value="">-- Selecione o agricultor (opcional, para preencher os dados) --</option>' + agris.map(x => `<option value="${x.id}">${x.nome} (CPF: ${x.cpf})</option>`).join('');
  
  const users = DB.users.filter(x => x.tenantId == d || x.tenantId == '').sort((a,b)=>a.nome.localeCompare(b.nome));
  $('lgpdServSel').innerHTML = '<option value="">-- Selecione o servidor/técnico (opcional) --</option>' + users.map(x => `<option value="${x.id}">${x.nome} (${x.role.toUpperCase()})</option>`).join('');
}

function getLgpdHeader() {
  return `<div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #ccc;padding-bottom:10px">
    <h2 style="margin:0;font-family:Archivo">SECRETARIA MUNICIPAL DE AGRICULTURA</h2>
    <p style="margin:5px 0 0;font-size:12px;color:#555">SISTEMA INTEGRADO DE GESTÃO DA AGRICULTURA - SIGA</p>
  </div>`;
}

function genLgpdDocs(docs, a) {
  const dt = new Date().toLocaleDateString('pt-BR');
  const h = getLgpdHeader();
  let html = '';
  
  // Doc 1
  if (docs.includes(1)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">TERMO DE CIÊNCIA E CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS</h3>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Eu, <b>${a.nome || '________________________________________________'}</b>, CPF nº <b>${a.cpf || '____________________'}</b>, declaro estar ciente de que meus dados pessoais serão coletados e tratados pela Secretaria Municipal de Agricultura para fins de:</p>
    <ul style="line-height:1.6;margin-bottom:20px;font-size:16px">
      <li>Emissão e renovação do CAF;</li>
      <li>Assistência técnica rural;</li>
      <li>Projetos de crédito rural;</li>
      <li>Regularização fundiária;</li>
      <li>Emissão de declarações e laudos;</li>
      <li>Programas governamentais vinculados à agricultura familiar.</li>
    </ul>
    <p style="line-height:1.6;font-size:16px">Os dados poderão incluir: Nome completo, CPF, RG, Endereço, Telefone, E-mail, Informações socioeconômicas, Dados da propriedade rural, Coordenadas geográficas e documentos comprobatórios.</p>
    <p style="text-align:justify;line-height:1.6;margin-top:20px;font-size:16px">Declaro ter sido informado sobre meus direitos previstos na LGPD, especialmente os direitos de acesso, correção e atualização dos dados.</p>
    <div style="margin-top:80px;font-size:16px">
      <p>Local e data: ________________________________, ${dt}</p>
      <div style="margin-top:70px;width:350px;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Agricultor(a)</div>
    </div>
  </div>`;

  // Doc 2
  if (docs.includes(2)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">AUTORIZAÇÃO DE COMPARTILHAMENTO DE DADOS</h3>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Eu, <b>${a.nome || '________________________________________________'}</b>, CPF nº <b>${a.cpf || '____________________'}</b>, autorizo o compartilhamento dos dados fornecidos com órgãos públicos e instituições financeiras quando necessário para:</p>
    <ul style="line-height:1.6;margin-bottom:20px;font-size:16px">
      <li>CAF; PRONAF; Banco da Amazônia; Banco do Brasil; SICREDI; EMATER; INCRA; ITERPA; MDA e outros programas governamentais.</li>
    </ul>
    <p style="text-align:justify;line-height:1.6;font-size:16px">O compartilhamento ocorrerá apenas para finalidades legais e institucionais previstas na legislação vigente.</p>
    <div style="margin-top:80px;font-size:16px">
      <p>Local e data: ________________________________, ${dt}</p>
      <div style="margin-top:70px;width:350px;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Agricultor(a)</div>
    </div>
  </div>`;

  // Doc 3
  if (docs.includes(3)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">FICHA DE ATENDIMENTO TÉCNICO</h3>
    <p style="line-height:1.8;font-size:16px"><b>Número do protocolo:</b> ___________ &nbsp;&nbsp;&nbsp;&nbsp; <b>Data:</b> ${dt}</p>
    <p style="line-height:1.8;font-size:16px"><b>Nome do Produtor:</b> ${a.nome || '________________________________________________________'}</p>
    <p style="line-height:1.8;font-size:16px"><b>CPF:</b> ${a.cpf || '____________________'} &nbsp;&nbsp;&nbsp;&nbsp; <b>Telefone:</b> ${a.tel || '____________________'}</p>
    <p style="line-height:1.8;font-size:16px"><b>Comunidade / Localidade:</b> ${a.com || '_________________________________________________'}</p>
    <p style="line-height:1.6;margin-top:30px;font-size:16px"><b>Descrição da demanda:</b><br><br><br><br></p>
    <p style="line-height:1.6;margin-top:30px;font-size:16px"><b>Parecer técnico:</b><br><br><br><br><br><br><br></p>
    <div style="margin-top:80px;display:flex;justify-content:space-between;font-size:16px">
      <div style="width:45%;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Produtor</div>
      <div style="width:45%;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Técnico / Carimbo</div>
    </div>
  </div>`;

  // Doc 4
  if (docs.includes(4)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">PROTOCOLO DE ENTREGA DE DOCUMENTOS</h3>
    <p style="line-height:1.6;font-size:16px">Recebi do Sr.(a) <b>${a.nome || '________________________________________________'}</b>, CPF <b>${a.cpf || '____________________'}</b>, os seguintes documentos (cópias/originais):</p>
    <div style="line-height:2.0;margin:30px 0;font-size:16px">
      <div>[ &nbsp; ] CPF e RG</div>
      <div>[ &nbsp; ] CAF anterior / Extrato</div>
      <div>[ &nbsp; ] Comprovante de residência</div>
      <div>[ &nbsp; ] Documento da terra (Recibo, Título, Contrato)</div>
      <div>[ &nbsp; ] CAR (Cadastro Ambiental Rural)</div>
      <div>[ &nbsp; ] ITR / CCIR</div>
      <div>[ &nbsp; ] Outros: __________________________________________________</div>
    </div>
    <div style="margin-top:80px;display:flex;justify-content:space-between;font-size:16px">
      <div style="width:45%">Data: ${dt}<br><br><br>Servidor Responsável: ___________________________</div>
      <div style="width:45%;border-top:1px solid #000;text-align:center;padding-top:5px;margin-top:60px">Assinatura do Requerente</div>
    </div>
  </div>`;

  // Doc 6
  if (docs.includes(6)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">AUTORIZAÇÃO PARA COMUNICAÇÃO ELETRÔNICA</h3>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Eu, <b>${a.nome || '________________________________________________'}</b>, CPF nº <b>${a.cpf || '____________________'}</b>, autorizo a Secretaria Municipal de Agricultura a realizar contatos oficiais por meio de canais digitais:</p>
    <div style="line-height:2.0;margin:20px 0;font-size:16px">
      <div>[ &nbsp; ] WhatsApp (${a.tel || '____________________'})</div>
      <div>[ &nbsp; ] SMS</div>
      <div>[ &nbsp; ] Chamada Telefônica</div>
      <div>[ &nbsp; ] E-mail</div>
    </div>
    <p style="line-height:1.6;font-size:16px">Para o envio de:</p>
    <ul style="line-height:1.6;margin-bottom:20px;font-size:16px">
      <li>Informações e atualizações sobre CAF;</li>
      <li>Convites para cursos e capacitações;</li>
      <li>Agendamentos de assistência técnica;</li>
      <li>Informativos sobre programas governamentais;</li>
      <li>Convocações e comunicados gerais da secretaria.</li>
    </ul>
    <div style="margin-top:80px;font-size:16px">
      <p>Local e data: ________________________________, ${dt}</p>
      <div style="margin-top:70px;width:350px;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Agricultor(a)</div>
    </div>
  </div>`;

  // Doc 7
  if (docs.includes(7)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">POLÍTICA DE PRIVACIDADE SIMPLIFICADA</h3>
    <p style="line-height:1.6;font-size:16px">A Secretaria Municipal de Agricultura, em conformidade com a Lei Geral de Proteção de Dados (LGPD), informa que:</p>
    <ul style="line-height:1.8;margin-bottom:20px;font-size:16px">
      <li><b>Coleta Minimizada:</b> Coleta apenas os dados estritamente necessários para a prestação dos serviços públicos e execução de políticas agrícolas.</li>
      <li><b>Uso Institucional:</b> Utiliza os dados exclusivamente para finalidades públicas, institucionais e de fomento agropecuário.</li>
      <li><b>Segurança:</b> Adota medidas técnicas e administrativas de segurança para proteção das informações contra acessos não autorizados.</li>
      <li><b>Não Comercialização:</b> É terminantemente proibida a venda, aluguel ou comercialização de dados pessoais dos cidadãos.</li>
      <li><b>Direitos do Cidadão:</b> Permite ao titular solicitar o acesso, correção, atualização e eliminação (quando aplicável) de seus dados.</li>
      <li><b>Retenção:</b> Mantém os dados pelo prazo exigido na legislação aplicável e para cumprimento de obrigações legais ou regulatórias.</li>
    </ul>
    <p style="margin-top:60px;text-align:center;font-size:16px">Emitido para ciência do(a) agricultor(a):<br><br> <b>${a.nome || '________________________________________________'}</b></p>
    <p style="text-align:center;margin-top:20px;font-size:16px">Data de emissão: ${dt}</p>
  </div>`;

  // Doc 8
  if (docs.includes(8)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">LIVRO DE REGISTRO DE TRATAMENTO DE DADOS (LGPD)</h3>
    <p style="line-height:1.6;font-size:16px">Extrato de Registros para o Titular: <b>${a.nome || '________________________________________________'}</b><br>CPF: <b>${a.cpf || '____________________'}</b></p>
    <table style="width:100%;border-collapse:collapse;margin-top:30px;font-size:14px">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="border:1px solid #000;padding:12px;text-align:left">Nº Protocolo</th>
          <th style="border:1px solid #000;padding:12px;text-align:left">Data</th>
          <th style="border:1px solid #000;padding:12px;text-align:left">Serviço Acessado</th>
          <th style="border:1px solid #000;padding:12px;text-align:left">Finalidade do Tratamento</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="border:1px solid #000;padding:12px">001</td><td style="border:1px solid #000;padding:12px">${dt}</td><td style="border:1px solid #000;padding:12px">Cadastro / Atualização</td><td style="border:1px solid #000;padding:12px">Inserção na base municipal do SIGA</td></tr>
        <tr><td style="border:1px solid #000;padding:12px"> &nbsp; </td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td></tr>
        <tr><td style="border:1px solid #000;padding:12px"> &nbsp; </td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td></tr>
        <tr><td style="border:1px solid #000;padding:12px"> &nbsp; </td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td></tr>
        <tr><td style="border:1px solid #000;padding:12px"> &nbsp; </td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td><td style="border:1px solid #000;padding:12px"></td></tr>
      </tbody>
    </table>
  </div>`;

  // Doc 9
  if (docs.includes(9)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">FORMULÁRIO DE SOLICITAÇÃO DE DIREITOS (LGPD)</h3>
    <p style="line-height:1.6;font-size:16px"><b>Nome do Titular:</b> ${a.nome || '________________________________________________'}</p>
    <p style="line-height:1.6;font-size:16px"><b>CPF:</b> ${a.cpf || '____________________'} &nbsp;&nbsp;&nbsp;&nbsp; <b>Telefone:</b> ${a.tel || '____________________'}</p>
    <p style="line-height:1.6;font-size:16px"><b>Número de Protocolo de Atendimento:</b> ______________________</p>
    <p style="line-height:1.6;margin-top:30px;font-size:16px">O cidadão acima qualificado, com base na Lei Geral de Proteção de Dados Pessoais, solicita formalmente à Secretaria Municipal de Agricultura:</p>
    <div style="line-height:2.0;margin:20px 0;font-size:16px">
      <div>[ &nbsp; ] Acesso aos dados pessoais armazenados</div>
      <div>[ &nbsp; ] Correção de dados incompletos, inexatos ou desatualizados</div>
      <div>[ &nbsp; ] Atualização cadastral</div>
      <div>[ &nbsp; ] Informação sobre o compartilhamento de dados com entes públicos/privados</div>
      <div>[ &nbsp; ] Revogação de consentimento (quando aplicável, sabendo que pode inviabilizar a prestação de serviços dependentes dos dados)</div>
    </div>
    <div style="margin-top:80px;font-size:16px">
      <p>Local e data: ________________________________, ${dt}</p>
      <div style="margin-top:70px;width:350px;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Requerente</div>
    </div>
  </div>`;

  return html;
}

function genLgpdServDocs(docs, s) {
  const dt = new Date().toLocaleDateString('pt-BR');
  const h = getLgpdHeader();
  let html = '';

  // Doc 5
  if (docs.includes(5)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">TERMO DE CONFIDENCIALIDADE E SIGILO</h3>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Pelo presente termo, na condição de agente público / colaborador da Secretaria Municipal de Agricultura, comprometo-me a:</p>
    <ul style="line-height:1.8;margin-bottom:20px;font-size:16px">
      <li>Utilizar os dados pessoais de agricultores e terceiros exclusivamente para fins institucionais e no limite de minhas atribuições;</li>
      <li>Não compartilhar ou repassar informações, arquivos ou documentos a terceiros não autorizados;</li>
      <li>Manter absoluto sigilo sobre documentos, propriedades e informações socioeconômicas constantes nos cadastros municipais e sistemas (como SIGA, CAF, entre outros);</li>
      <li>Comunicar imediatamente à gestão superior e ao encarregado de dados qualquer suspeita ou confirmação de incidente de segurança (vazamento, perda ou acesso indevido).</li>
    </ul>
    <p style="line-height:1.6;margin-top:40px;font-size:16px"><b>Nome do Servidor:</b> ${s.nome || '________________________________________________'}</p>
    <p style="line-height:1.6;font-size:16px"><b>Cargo / Papel:</b> ${(s.role || '______________________').toUpperCase()}</p>
    <p style="line-height:1.6;font-size:16px"><b>E-mail (Login institucional):</b> ${s.email || '____________________________________'}</p>
    <div style="margin-top:80px;font-size:16px">
      <p>Local e data: ________________________________, ${dt}</p>
      <div style="margin-top:70px;width:350px;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Servidor</div>
    </div>
  </div>`;

  // Doc 10
  if (docs.includes(10)) html += `<div style="page-break-after:always;padding:20px;font-family:'IBM Plex Sans'">${h}
    <h3 style="text-align:center;margin:30px 0;font-family:Archivo">TERMO DE RESPONSABILIDADE DO SERVIDOR EMISSOR DE CAF</h3>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Eu, <b>${s.nome || '________________________________________________'}</b>, servidor / agente vinculado a esta Secretaria Municipal de Agricultura, declaro estar ciente de minhas responsabilidades legais ao operar o sistema do Cadastro Nacional da Agricultura Familiar (CAF) e o Sistema Integrado de Gestão da Agricultura (SIGA).</p>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Declaro que utilizarei os dados acessados, emitidos ou modificados exclusivamente para fins institucionais de interesse público, observando estritamente os princípios e diretrizes da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).</p>
    <p style="text-align:justify;line-height:1.6;font-size:16px">Comprometo-me a manter o sigilo absoluto e a garantir a segurança das informações processadas no exercício de minhas funções, estando ciente de que poderei ser responsabilizado nas esferas administrativa, civil e criminal por eventuais desvios de finalidade, fornecimento de informações falsas ou vazamento de dados de agricultores.</p>
    <p style="line-height:1.6;margin-top:40px;font-size:16px"><b>Nome do Servidor:</b> ${s.nome || '________________________________________________'}</p>
    <div style="margin-top:80px;font-size:16px">
      <p>Local e data: ________________________________, ${dt}</p>
      <div style="margin-top:70px;width:350px;border-top:1px solid #000;text-align:center;padding-top:5px">Assinatura do Servidor Emissor</div>
    </div>
  </div>`;

  return html;
}

function printLgpd(dId) {
  let aId = $('lgpdAgriSel').value;
  let a = (aId ? DB.agri.find(x => x.id == aId) : {}) || {};
  if (!aId) {
    toast("Gerando modelo em branco para preenchimento manual.");
  }
  
  let docsToPrint = dId === 0 ? [1,2,3,4,6,7,8,9] : [dId];
  $('printArea').innerHTML = genLgpdDocs(docsToPrint, a);
  window.print();
}

function printLgpdServ(dId) {
  let sId = $('lgpdServSel').value;
  let s = (sId ? DB.users.find(x => x.id == sId) : {}) || {};
  if (!sId) {
    toast("Gerando modelo em branco para preenchimento manual.");
  }
  
  let docsToPrint = dId === 0 ? [5,10] : [dId];
  $('printArea').innerHTML = genLgpdServDocs(docsToPrint, s);
  window.print();
}
