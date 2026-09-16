/* ══════ LOGIN ══════ */
if ($('tick')) $('tick').innerHTML = (DB.tenants.map(t => t.nome.toUpperCase()).join('  ✦  ') + '  ✦  ').repeat(2);
if ($('gStats')) $('gStats').textContent = `${DB.tenants.filter(t => t.ativo).length} MUNICÍPIOS ATIVOS · ${DB.agri.length} AGRICULTORES · ${DB.agd.length} AGENDAMENTOS · NODE.JS + POSTGRESQL`;
function fill(k) { const m = { super: ['superadmin@siga.pa.gov.br', 'siga2026'], admin: ['admin@concordia.pa.gov.br', 'admin123'], user: ['servidor@concordia.pa.gov.br', 'servidor'] }[k]; $('lgEmail').value = m[0]; $('lgPass').value = m[1] }
function doLogin() {
  const u = DB.users.find(x => x.email == $('lgEmail').value.trim()); const e = $('lgErr'); e.style.display = 'none';
  if (!u || u.senha != $('lgPass').value) { e.textContent = 'Credenciais inválidas.'; e.style.display = 'inline-flex'; return }
  if (!u.ativo) { e.textContent = 'Usuário desativado. Procure o administrador.'; e.style.display = 'inline-flex'; return }
  if (u.tenantId) { const t = DB.tenants.find(x => x.id == u.tenantId); if (!t.ativo) { e.textContent = 'Município suspenso pelo Super Admin.'; e.style.display = 'inline-flex'; return } }
  S.user = u; S.last = Date.now(); audit('login.ok', 'Sessão iniciada', 'login'); enter()
}
function logout(msg) { if (S.user) audit('logout', 'Sessão encerrada', 'login'); S.user = null; $('app').hidden = true; $('gate').style.display = 'grid'; if (msg) toast(msg) }
function fpShow(n) { $('lgBox').hidden = n > 0; $('fpBox').hidden = !n; $('fp1').hidden = n != 1; $('fp2').hidden = n != 2; $('fp3').hidden = n != 3 }
function fpSend() { if (!$('fpEmail').value) return toast('Informe o e-mail.'); S.fpMail = $('fpEmail').value; audit('senha.token', 'Token de redefinição emitido (30 min)', 'seguranca'); fpShow(2) }
function fpSave() { if ($('fpP1').value.length < 6 || $('fpP1').value != $('fpP2').value) return toast('Senhas não conferem (mín. 6).'); const u = DB.users.find(x => x.email == S.fpMail); if (u) { u.senha = $('fpP1').value; save() } audit('senha.redef', 'Senha redefinida via e-mail (Bcrypt)', 'seguranca'); fpShow(0); toast('Senha redefinida com sucesso.') }

/* ══════ SHELL / NAVEGAÇÃO ══════ */
const NAV = [{ g: 'Operação', it: [['dashboard', 'i-grid', 'Painel'], ['calendario', 'i-cal', 'Calendário'], ['agendamentos', 'i-tk', 'Agendamentos'], ['agricultores', 'i-leaf', 'Agricultores'], ['cadastros', 'i-fold', 'Cadastros', 'ten'], ['documentos', 'i-doc', 'Documentos LGPD']] },
{ g: 'Gestão', it: [['relatorios', 'i-ch', 'Relatórios', 'rel'], ['usuarios', 'i-sh', 'Usuários & Permissões', 'adm'], ['auditoria', 'i-sc', 'Auditoria', 'aud'], ['config', 'i-gear', 'Configurações', 'cfg']] },
{ g: 'Super Admin', sup: 1, it: [['municipios', 'i-bld', 'Municípios'], ['planos', 'i-ly', 'Planos de Uso'], ['logs', 'i-gl', 'Logs Globais'], ['infra', 'i-srv', 'Infraestrutura']] }];
const TIT = { dashboard: ['01', 'Painel executivo'], calendario: ['02', 'Calendário'], agendamentos: ['03', 'Agendamentos'], agricultores: ['04', 'Agricultores'], cadastros: ['05', 'Cadastros'], documentos: ['06', 'Documentos LGPD'], relatorios: ['06', 'Relatórios'], usuarios: ['07', 'Usuários'], auditoria: ['08', 'Auditoria'], config: ['09', 'Configurações'], municipios: ['SA·01', 'Municípios'], planos: ['SA·02', 'Planos de Uso'], logs: ['SA·03', 'Logs Globais'], infra: ['SA·04', 'Infraestrutura'] };

function enter() {
  $('gate').style.display = 'none'; $('app').hidden = false; buildNav(); fillFilters();
  const t = T(); $('tCard').innerHTML = S.user.role == 'super' ? '<b class="df" style="color:#f5e9c8">SUPER ADMIN</b><div class="mn" style="font-size:.62rem;color:#9fb39b">ACESSO A TODOS OS TENANTS</div>' : `<b class="df" style="color:#f5e9c8">${t.nome}</b><div class="mn" style="font-size:.62rem;color:#9fb39b">SEMAG · TENANT ${t.id.toUpperCase()} · PLANO ${t.plano == 'pro' ? 'PROFISSIONAL' : 'ESSENCIAL'}</div>`;
  $('uAv').textContent = (S.user.nome || 'User').split(' ').map(p => p[0]).slice(0, 2).join(''); $('uNm').textContent = (S.user.nome || 'User').split(' ')[0];
  $('uRole').innerHTML = S.user.role == 'super' ? '<i></i>SUPER ADMIN' : S.user.role == 'admin' ? '<i></i>ADMIN MUNICIPAL' : '<i></i>USUÁRIO COMUM';
  $('bellN').textContent = DB.notifs.filter(n => !n.read && n.tenantId == S.user.tenantId).length;
  showView(S.user.role == 'super' ? 'municipios' : 'dashboard')
}
function buildNav() {
  $('sideNav').innerHTML = NAV.map(g => {
    if (g.sup && S.user.role != 'super') return '';
    const its = g.it.filter(([id, ic, l, k]) => { if (k == 'adm') return S.user.role == 'admin'; if (k == 'cfg') return S.user.role == 'admin' || can('config', 'ver'); if (k == 'rel') return S.user.role != 'user' || can('relatorios', 'ver'); if (k == 'ten') return S.user.role != 'super'; if (k == 'aud') return S.user.role != 'user'; return true });
    if (!its.length) return '';
    return `<div class="ng">${g.g}</div>` + its.map(([id, ic, l]) => `<div class="ni" data-v="${id}" onclick="showView('${id}')"><svg class="ic"><use href="#${ic}"/></svg>${l}</div>`).join('')
  }).join('')
}
function showView(v) {
  S.view = v; document.querySelectorAll('.view').forEach(x => x.classList.remove('on')); $('view-' + v).classList.add('on'); document.querySelectorAll('.ni').forEach(n => n.classList.toggle('on', n.dataset.v == v)); $('modIdx').textContent = TIT[v][0]; $('modTitle').textContent = TIT[v][1]; $('side').classList.remove('open');
  ({ dashboard: renderDash, calendario: renderCal, agendamentos: renderAgd, agricultores: renderAgri, cadastros: renderCad, relatorios: renderRep, usuarios: renderUsers, auditoria: renderAud, config: renderCfg, municipios: renderMun, planos: renderPlans, logs: renderLogs, infra: renderInfra }[v] || (() => { }))()
}
function fillFilters() {
  const d = tid();
  $('cTec').innerHTML = '<option value="">Técnico: todos</option>' + DB.tec.filter(x => !d || x.tenantId == d).map(x => `<option>${esc(x.nome)}</option>`).join('');
  $('cServ').innerHTML = '<option value="">Serviço: todos</option>' + SERV.map(s => `<option>${s}</option>`).join('');
  $('aSt').innerHTML = '<option value="">Status: todos</option>' + STAT.map(s => `<option>${s}</option>`).join('');
  $('aSv').innerHTML = '<option value="">Serviço: todos</option>' + SERV.map(s => `<option>${s}</option>`).join('');
  $('aTc').innerHTML = '<option value="">Técnico: todos</option>' + DB.tec.filter(x => !d || x.tenantId == d).map(x => `<option>${esc(x.nome)}</option>`).join('');
  $('rCm').innerHTML = '<option value="">Comunidade: todas</option>' + DB.com.filter(x => !d || x.tenantId == d).map(x => `<option>${esc(x.nome)}</option>`).join('')
}
