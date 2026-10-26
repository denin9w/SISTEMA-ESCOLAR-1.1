// ============================================================
// scriptGestor.js — Área do Gestor
// Requer no HTML (item 10/17):
//  #gestorNome, #iturma, #buscaAluno, #listaAlunos, #idocumentos
//  #painelAvisos, #listaSolicitacoes, #listaProfessoresPendentes
// ============================================================

const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    iniciarGestor();
};
document.head.appendChild(scriptSupabase);

// --- REFERÊNCIAS ---
const selectTurma       = document.querySelector('#iturma');
const listaDeAlunos     = document.querySelector('#listaAlunos');
const documentoporAluno = document.querySelector('#idocumentos');
const inputBusca        = document.querySelector('#buscaAluno');
const painelAvisos      = document.querySelector('#painelAvisos');
const listaSolicitacoes = document.querySelector('#listaSolicitacoes');
const listaProfsPend    = document.querySelector('#listaProfessoresPendentes');
const gestorNomeEl      = document.querySelector('#gestorNome');

let gestorLogado = null;

// --- TURMAS PADRONIZADAS (igual matrícula) ---
const TURMAS = [
    'infantil-I-a','infantil-I-b',
    'infantil-II-a','infantil-II-b',
    'infantil-III-a','infantil-III-b',
    '1ano-a','1ano-b',
    '2ano-a','2ano-b',
    '3ano-a','3ano-b',
    '4ano-a','4ano-b',
    '5ano-a','5ano-b',
    '6ano-a',
    '7ano-a',
    '8ano-a',
    '9ano-a'
];

function labelTurma(t) {
    // 1ano-a -> 1º Ano A
    const m = t.match(/^(\d)ano-([ab])$/i);
    if (m) return `${m[1]}º Ano ${m[2].toUpperCase()}`;
    const inf = t.match(/^infantil-([IVX]+)-([ab])$/i);
    if (inf) return `Infantil ${inf[1].toUpperCase()} ${inf[2].toUpperCase()}`;
    return t.toUpperCase();
}

// --- INICIALIZAÇÃO ---
function iniciarGestor() {
    const gString = localStorage.getItem("@gestorLogado");
    if (!gString) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login.htm";
        return;
    }
    gestorLogado = JSON.parse(gString);
    if (gestorNomeEl) gestorNomeEl.textContent = `Gestor: ${gestorLogado.nome}`;

    // Popula select de turmas
    selectTurma.innerHTML = '<option value="" selected disabled>Selecione uma turma</option>';
    TURMAS.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = labelTurma(t);
        selectTurma.appendChild(opt);
    });

    carregarAvisos();
    carregarProfessoresPendentes();
    carregarSolicitacoes();
}

// --- ALUNOS POR TURMA ---
selectTurma.addEventListener('change', () => carregarAlunos(selectTurma.value));

if (inputBusca) {
    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.trim().toLowerCase();
        const itens = listaDeAlunos.querySelectorAll('.btn-aluno');
        itens.forEach(el => {
            el.style.display = el.dataset.nome.toLowerCase().includes(termo) ? 'block' : 'none';
        });
        listaDeAlunos.style.display = 'block';
    });
}

async function carregarAlunos(turma) {
    if (!turma) return;
    listaDeAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Carregando...</p>';

    const { data, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, data_nascimento, status, numero_matricula')
        .eq('turma', turma)
        .order('nome', { ascending: true });

    if (error) { console.error(error); listaDeAlunos.innerHTML = '<p>Erro ao carregar.</p>'; return; }

    if (!data || data.length === 0) {
        listaDeAlunos.innerHTML = '<p>Nenhum aluno nesta turma.</p>';
        return;
    }

    listaDeAlunos.innerHTML = '';
    data.forEach(aluno => {
        const a = document.createElement('a');
        a.className = 'btn-aluno';
        a.dataset.nome = aluno.nome;
        a.dataset.id = aluno.id;
        const statusTag = aluno.status && aluno.status !== 'Ativa' ? ` [${aluno.status}]` : '';
        a.textContent = `${aluno.nome}${statusTag}`;
        a.addEventListener('click', () => abrirDocumentos(aluno));
        listaDeAlunos.appendChild(a);
    });
}

// --- DOCUMENTOS DO ALUNO SELECIONADO ---
function abrirDocumentos(aluno) {
    if (!documentoporAluno) return;
    documentoporAluno.style.display = 'block';
    documentoporAluno.dataset.alunoId = aluno.id;
    documentoporAluno.dataset.alunoNome = aluno.nome;

    // Reaproveita os links .cdocumentos já existentes no HTML
    documentoporAluno.querySelectorAll('.cdocumentos a').forEach(link => {
        link.onclick = (ev) => {
            ev.preventDefault();
            gerarDocumento(aluno.id, aluno.nome, link.dataset.doc || link.textContent.trim());
        };
    });
}

// --- GERAÇÃO DE DOCUMENTO (DOCX genérico) ---
// Requer docxtemplater + pizzip + FileSaver carregados no HTML.
// Coloque seus templates em: documentos/<nome>.docx
async function gerarDocumento(alunoId, alunoNome, nomeDoc) {
    if (typeof PizZip === 'undefined' || typeof docxtemplater === 'undefined') {
        alert("Bibliotecas de DOCX não carregadas nesta página.");
        return;
    }

    // Busca todos os dados do aluno
    const { data: aluno, error } = await supabaseClient
        .from('alunos')
        .select('*')
        .eq('id', alunoId)
        .single();

    if (error || !aluno) { alert("Erro ao buscar dados do aluno."); return; }

    // Busca notas (tabela notas) para preencher boletins
    const { data: notasRows } = await supabaseClient
        .from('notas')
        .select('bimestre, n1, n2, n3, media')
        .eq('aluno_id', alunoId);

    const notasMap = {};
    (notasRows || []).forEach(r => notasMap[r.bimestre] = r);

    // Monta contexto para o template (use {{nome}}, {{turma}}, {{media_b1}}...)
    const contexto = {
        ...aluno,
        data_nascimento_br: aluno.data_nascimento
            ? aluno.data_nascimento.split('-').reverse().join('/') : '',
        turma_label: labelTurma(aluno.turma || ''),
        media_b1: notasMap.b1?.media ?? aluno.media_b1 ?? '',
        media_b2: notasMap.b2?.media ?? aluno.media_b2 ?? '',
        media_b3: notasMap.b3?.media ?? aluno.media_b3 ?? '',
        media_b4: notasMap.b4?.media ?? aluno.media_b4 ?? '',
        media_anual: aluno.media_anual ?? ''
    };

    // Nome do arquivo do template = nome do documento (slug)
    const slug = nomeDoc.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();

    const url = `documentos/${slug}.docx`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("template não encontrado: " + url);
        const blob = await resp.arrayBuffer();

        const zip = new PizZip(blob);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.render(contexto);
        const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        saveAs(out, `${slug}-${alunoNome.replace(/\s+/g,'_')}.docx`);

        alert(`Documento "${nomeDoc}" gerado para ${alunoNome}.`);
    } catch (e) {
        console.error(e);
        alert(`Não foi possível gerar "${nomeDoc}".\nDetalhe: ${e.message}\n\nColoque o template em: documentos/${slug}.docx`);
    }
}

// --- AVISOS ---
async function carregarAvisos() {
    if (!listaSolicitacoes) return;

    const { data, error } = await supabaseClient
        .from('solicitacoes_documentos')
        .select('id, documento, status, criado_em, alunos(nome, turma)')
        .eq('status', 'Pendente')
        .order('criado_em', { ascending: true });

    if (error) { console.error(error); return; }

    listaSolicitacoes.innerHTML = '';
    if (!data || data.length === 0) {
        listaSolicitacoes.innerHTML = '<p>Sem solicitações pendentes.</p>';
        return;
    }

    data.forEach(s => {
        const div = document.createElement('div');
        div.className = 'aviso-item';
        const nomeAluno = s.alunos?.nome || '(aluno removido)';
        const turma = s.alunos?.turma ? labelTurma(s.alunos.turma) : '';
        div.innerHTML = `
            <strong>${nomeAluno}</strong> ${turma ? '('+turma+')' : ''}<br>
            Documento: <b>${s.documento}</b><br>
            <button class="btn-mini btn-gerar" data-id="${s.id}" data-aluno="${s.alunos?.nome || ''}" data-doc="${s.documento}">Gerar</button>
            <button class="btn-mini btn-marcar" data-id="${s.id}">Marcar entregue</button>
        `;
        listaSolicitacoes.appendChild(div);
    });

    listaSolicitacoes.querySelectorAll('.btn-gerar').forEach(btn => {
        btn.addEventListener('click', () => {
            const alunoId = document.querySelector(`#listaAlunos .btn-aluno[data-id]`)?.dataset.id;
            // Se não houver aluno selecionado, orienta o gestor
            if (!documentoporAluno?.dataset.alunoId) {
                alert("Selecione o aluno na lista à esquerda antes de gerar.");
                return;
            }
            gerarDocumento(documentoporAluno.dataset.alunoId, documentoporAluno.dataset.alunoNome, btn.dataset.doc);
        });
    });

    listaSolicitacoes.querySelectorAll('.btn-marcar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const { error } = await supabaseClient
                .from('solicitacoes_documentos')
                .update({ status: 'Entregue' })
                .eq('id', id);
            if (error) alert("Erro ao atualizar.");
            else carregarAvisos();
        });
    });
}

// --- PROFESSORES PENDENTES DE AUTORIZAÇÃO ---
async function carregarProfessoresPendentes() {
    if (!listaProfsPend) return;

    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id, nome, cpf_senha, turmas, criado_em')
        .eq('tipo', 'professor')
        .eq('autorizado', false)
        .order('criado_em', { ascending: true });

    if (error) { console.error(error); return; }

    listaProfsPend.innerHTML = '';
    if (!data || data.length === 0) {
        listaProfsPend.innerHTML = '<p>Nenhum professor pendente.</p>';
        return;
    }

    data.forEach(p => {
        const div = document.createElement('div');
        div.className = 'aviso-item';
        const turmasTxt = (p.turmas || []).map(labelTurma).join(', ') || '(sem turma)';
        div.innerHTML = `
            <strong>${p.nome}</strong> — CPF: ${p.cpf_senha}<br>
            Turmas: ${turmasTxt}<br>
            <button class="btn-mini btn-autorizar" data-id="${p.id}">Autorizar</button>
        `;
        listaProfsPend.appendChild(div);
    });

    listaProfsPend.querySelectorAll('.btn-autorizar').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm("Autorizar este professor?")) return;
            const { error } = await supabaseClient
                .from('usuarios')
                .update({ autorizado: true })
                .eq('id', btn.dataset.id);
            if (error) alert("Erro ao autorizar.");
            else carregarProfessoresPendentes();
        });
    });
}