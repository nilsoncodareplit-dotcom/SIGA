const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fBR = s => { if (!s) return ''; const p = s.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
const hoje = () => iso(new Date());
let R = (s => () => (s = (s * 48271) % 2147483647) / 2147483647)(20260829);
const pk = a => a[Math.floor(R() * a.length)];
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const SERV = ['Emissão CAF', 'Renovação CAF', 'Declarações', 'Atendimento Técnico', 'Emissão de Laudos', 'Cadastro Rural', 'Assistência Técnica', 'Projetos de Crédito Rural', 'Regularização Fundiária', 'Outros'];
const STAT = ['Agendado', 'Confirmado', 'Em Atendimento', 'Concluído', 'Cancelado', 'Não Compareceu'];
const SC = ['#3b78c2', '#2f9159', '#e0a52e', '#14532d', '#c04434', '#8a8577'];

/* ══════ BANCO (SEED) ══════ */
let DB = JSON.parse(localStorage.getItem('siga_v5') || 'null');
if (!DB) {
  DB = { tenants: [], users: [], agri: [], agd: [], tec: [], com: [], ent: [], frota: [], audit: [], notifs: [], trash: [], seq: 340 };
  const TN = [['t1', 'Concórdia do Pará', 'CNP', 'pro', 34], ['t2', 'Bujaru', 'BUJ', 'ess', 16], ['t3', 'Tomé-Açu', 'TMA', 'pro', 12], ['t4', 'Moju', 'MOJ', 'ess', 14], ['t5', 'Abaetetuba', 'ABA', 'pro', 18], ['t6', 'Acará', 'ACA', 'ess', 9], ['t7', 'Igarapé-Miri', 'IGM', 'ess', 11], ['t8', 'Barcarena', 'BRC', 'pro', 15], ['t9', 'Castanhal', 'CST', 'pro', 20]];
  const COM = { t1: ['Santa Luzia', 'Ramal do Tauari', 'Vila Nova', 'São Francisco', 'Bela Vista', 'Alto Alegre', 'Baixa Grande'], t2: ['Boa Vista', 'Santa Maria', 'Guajará', 'Jabotiteua', 'Cachoeira'], t3: ['Vila União', 'São Raimundo', 'Acará-Miri'], t4: ['Prainha', 'Guarajá', 'Jusante'], t5: ['Ilha do Capim', 'Miriti', 'Carnaúba'], t6: ['Arauaí', 'Guajará-Miri'], t7: ['Igarapé Preto', 'Genipauba'], t8: ['Murucupi', 'Ponta do Arapuá'], t9: ['Apeú', 'Castanhalzinho', 'Rio Patauá'] };
  const FN = ['Maria', 'José', 'Antônio', 'Francisca', 'João', 'Raimunda', 'Ana', 'Luiz', 'Carlos', 'Rita', 'Sebastião', 'Tereza', 'Marcos', 'Edna', 'Benedito', 'Iracema', 'Domingos', 'Margarida', 'Pedro', 'Rosa', 'Manoel', 'Aparecida', 'Claudete', 'Socorro', 'Ernesto', 'Aldeci'];
  const LN = ['da Silva', 'dos Santos', 'Souza', 'Oliveira', 'Pereira', 'Ferreira', 'Almeida', 'Costa', 'Rodrigues', 'Gomes', 'Martins', 'Barbosa', 'Ribeiro', 'Pantoja', 'Baía', 'Vasconcelos', 'Farias', 'Corrêa'];
  const CUL = ['Mandioca', 'Pimenta-do-reino', 'Açaí', 'Cacau', 'Banana', 'Milho', 'Feijão', 'Maracujá', 'Abacaxi', 'Dendê', 'Hortaliças'];
  TN.forEach(([id, nome, sig, pl, n]) => {
    DB.tenants.push({ id, nome, sigla: sig, plano: pl, ativo: true, storage: ri(180, 860), max: pl == 'pro' ? 1024 : 512, notif: { mail: true, whats: false, lemb: '24h antes' }, serv: [...SERV] });
    (COM[id] || ['Centro']).forEach(c => DB.com.push({ id: 'c' + id + c, tenantId: id, nome: c }));
    const tecs = [['Ana Beatriz Souza', 'Eng. Agrônoma'], ['Carlos Eduardo Lima', 'Téc. Agrícola'], ['Maria do Socorro Pantoja', 'Zootecnista'], ['João Pedro Ferreira', 'Eng. Florestal']].slice(0, Math.max(2, Math.min(4, Math.round(n / 9) + 2)));
    tecs.forEach(t => DB.tec.push({ id: 'tc' + id + t[0], tenantId: id, nome: t[0], funcao: t[1], ativo: true }));
    DB.ent.push({ id: 'e1' + id, tenantId: id, nome: `Cooperativa Agroextrativista de ${nome}`, tipo: 'Cooperativa', presidente: pk(FN) + ' ' + pk(LN), membros: ri(18, 120) });
    DB.ent.push({ id: 'e2' + id, tenantId: id, nome: `Associação dos Agricultores de ${COM[id][0]}`, tipo: 'Associação', presidente: pk(FN) + ' ' + pk(LN), membros: ri(12, 80) });
    DB.frota.push({ id: 'f1' + id, tenantId: id, nome: 'Fiat Strada · visitas técnicas', cat: 'Veículo', placa: `QD${pk(['A', 'B', 'C'])}-${ri(1000, 9999)}`, status: 'Operacional' });
    DB.frota.push({ id: 'f2' + id, tenantId: id, nome: 'Trator John Deere 5078E', cat: 'Máquina', placa: '—', status: R() > .8 ? 'Em manutenção' : 'Operacional' });
    for (let i = 0; i < n; i++) { DB.agri.push({ id: `a${id}_${i}`, tenantId: id, nome: pk(FN) + ' ' + pk(FN) + ' ' + pk(LN), cpf: `${ri(100, 999)}.${ri(100, 999)}.${ri(100, 999)}-${ri(10, 99)}`, nis: String(ri(1e10, 2e10)), dap: R() > .15 ? `PA-${ri(1e8, 9e8)}` : '', com: pk(COM[id]), cul: pk(CUL), area: ri(1, 48), prod: ri(2, 90), fam: R() > .2, coop: R() > .6 ? `Cooperativa Agroextrativista de ${nome}` : '', tel: `(91) 9${ri(8000, 9999)}-${ri(1000, 9999)}` }); }
    const tN = tecs.map(t => t[0]), A = DB.agri.filter(x => x.tenantId == id), now = new Date();
    for (let i = 0; i < Math.round(n * 1.3); i++) {
      const a = A[i % A.length]; const d = new Date(now); d.setDate(ri(1, 28)); if (R() > .6) d.setMonth(d.getMonth() - ri(1, 2));
      const past = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());
      DB.agd.push({ id: `g${id}_${i}`, tenantId: id, num: `AGD-${d.getFullYear()}-${DB.seq++}`, data: iso(d), hora: `${pad(ri(8, 16))}:${pk(['00', '30'])}`, agriId: a.id, serv: pk(SERV), tec: pk(tN), com: a.com, st: past ? pk(['Concluído', 'Concluído', 'Concluído', 'Cancelado', 'Não Compareceu']) : pk(['Agendado', 'Confirmado', 'Agendado']) });
    }
  });
  for (let i = 0; i < 4; i++) { const a = DB.agri[i]; DB.agd.push({ id: 'gh' + i, tenantId: 't1', num: `AGD-2026-${DB.seq++}`, data: hoje(), hora: `${pad(8 + i * 2)}:00`, agriId: a.id, serv: SERV[i % SERV.length], tec: DB.tec[i % 4].nome, com: a.com, st: ['Confirmado', 'Em Atendimento', 'Agendado', 'Confirmado'][i] }); }
  DB.users = [{ id: 'u0', role: 'super', tenantId: null, nome: 'Central SIGA', email: 'superadmin@siga.pa.gov.br', senha: 'siga2026', ativo: true },
  { id: 'u1', role: 'admin', tenantId: 't1', nome: 'Maria das Graças Oliveira', email: 'admin@concordia.pa.gov.br', senha: 'admin123', ativo: true },
  { id: 'u2', role: 'user', tenantId: 't1', nome: 'Pedro Henrique Costa', email: 'servidor@concordia.pa.gov.br', senha: 'servidor', ativo: true, perms: { cadastros: { ver: 1, ins: 1, edi: 1 }, agendamentos: { ver: 1, ins: 1, edi: 1 }, relatorios: { ver: 1, pdf: 1 }, config: {} } },
  { id: 'u3', role: 'admin', tenantId: 't2', nome: 'Raimundo Nonato Baía', email: 'admin@bujaru.pa.gov.br', senha: 'admin123', ativo: true }];
  DB.audit = [{ id: 1, tenantId: 't1', user: 'Maria das Graças Oliveira', ip: '177.22.10.4', ts: new Date(Date.now() - 864e5).toISOString(), acao: 'login.ok', reg: 'Sessão iniciada', tipo: 'login' }];
  save();
}
function save() { localStorage.setItem('siga_v5', JSON.stringify(DB)) }

/* ══════ SESSÃO / PERMISSÕES ══════ */
let S = { user: null, view: '', cal: new Date(), f: { a: { q: '', s: '', v: '', t: '' }, r: { q: '', c: '' } }, pg: { a: 1, r: 1 }, lim: 30 * 60, last: Date.now(), ip: `177.${ri(10, 99)}.${ri(10, 99)}.${ri(2, 250)}`, charts: {}, cadTab: 0, editAgd: null, editAgri: null, editUser: null, permUser: null, fpMail: '' };
const tid = () => S.user && S.user.role == 'super' ? null : S.user.tenantId;
const T = () => DB.tenants.find(t => t.id == S.user.tenantId);
const can = (m, a) => { const u = S.user; if (!u) return false; if (u.role != 'user') return true; return !!(u.perms && u.perms[m] && u.perms[m][a]) };
function audit(acao, reg, tipo) { DB.audit.unshift({ id: Date.now() + Math.random(), tenantId: S.user ? S.user.tenantId : null, user: S.user ? S.user.nome : 'Sistema', ip: S.ip, ts: new Date().toISOString(), acao, reg, tipo }); save() }
function toast(m) { const d = document.createElement('div'); d.className = 'tx'; d.innerHTML = m; $('toasts').appendChild(d); setTimeout(() => d.remove(), 4200) }
function M(id) { return bootstrap.Modal.getOrCreateInstance($(id)) }
function ask(t, m, ok = 'Confirmar') { return new Promise(r => { $('cT2').textContent = t; $('cM2').textContent = m; $('cOk2').textContent = ok; const mo = M('mConf'); $('cOk2').onclick = () => { mo.hide(); r(true) }; $('mConf').addEventListener('hidden.bs.modal', () => r(false), { once: true }); mo.show() }) }
const denied = () => M('mDenied').show();
