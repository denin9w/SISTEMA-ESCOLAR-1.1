// ============================================================
// scriptGestor.js — Área do Gestor (Pesquisa Global + Modal Completo)
// ============================================================

const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabaseClient = supabaseClient;
    iniciarGestor();
};
document.head.appendChild(scriptSupabase);

// Elementos
const selectTurma       = document.querySelector('#iturma');
const listaDeAlunos     = document.querySelector('#listaAlunos');
const cardAlunos        = document.querySelector('#cardAlunos');
const documentoporAluno = document.querySelector('#idocumentos');
const cardDocumentos    = document.querySelector('#cardDocumentos');
const inputBusca        = document.querySelector('#buscaAluno');
const btnPesquisar      = document.querySelector('#btnPesquisarAluno');
const listaSolicitacoes = document.querySelector('#listaSolicitacoes');
const listaProfsPend    = document.querySelector('#listaProfessoresPendentes');
const gestorNomeEl      = document.querySelector('#gestorNome');

// Modal Add Aluno
const btnAddAlunoGestor = document.querySelector('#btnAddAlunoGestor');
const modalAddAluno     = document.querySelector('#modalAddAlunoGestor');
const btnFecharModal    = document.querySelector('#btnFecharModalGestor');
const formAddAluno      = document.querySelector('#formAddAlunoGestor');
const selectAddTurma    = document.querySelector('#addTurmaGestor');

let gestorLogado = null;

const TURMAS = [
    'infantil-I-a','infantil-I-b', 'infantil-II-a','infantil-II-b', 'infantil-III-a','infantil-III-b',
    '1ano-a','1ano-b', '2ano-a','2ano-b', '3ano-a','3ano-b', '4ano-a','4ano-b', '5ano-a','5ano-b',
    '6ano-a', '7ano-a', '8ano-a', '9ano-a'
];

function labelTurma(t) {
    if (!t) return '';
    const m = t.match(/^(\d)ano-([ab])$/i);
    if (m) return `${m[1]}º Ano ${m[2].toUpperCase()}`;
    const inf = t.match(/^infantil-([IVX]+)-([ab])$/i);
    if (inf) return `Infantil ${inf[1].toUpperCase()} ${inf[2].toUpperCase()}`;
    return t.toUpperCase();
}

function preencherSelects() {
    const options = TURMAS.map(t => `<option value="${t}">${labelTurma(t)}</option>`).join('');
    
    if (selectTurma) {
        selectTurma.innerHTML = '<option value="" selected disabled>Selecione uma turma</option>' + options;
    }
    if (selectAddTurma) {
        selectAddTurma.innerHTML = '<option value="" selected disabled>Selecione...</option>' + options;
    }
}

async function iniciarGestor() {
    const gString = localStorage.getItem("@gestorLogado");
    if (!gString) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login.htm";
        return;
    }
    gestorLogado = JSON.parse(gString);
    if (gestorNomeEl) gestorNomeEl.textContent = `Gestor: ${gestorLogado.nome}`;

    preencherSelects();
    carregarAvisos();
    carregarProfessoresPendentes();
}

// --- AÇÕES DE NAVEGAÇÃO ---
if (selectTurma) {
    selectTurma.addEventListener('change', () => {
        if (selectTurma.value) {
            inputBusca.value = ''; // Limpa a busca se filtrar por turma
            carregarAlunosPorTurma(selectTurma.value);
        }
    });
}

if (btnPesquisar) {
    btnPesquisar.addEventListener('click', () => {
        const termo = inputBusca.value.trim();
        if (termo === '') {
            alert("Digite o nome do aluno para pesquisar.");
            return;
        }
        selectTurma.value = ""; // Limpa o filtro de turma
        pesquisarGlobal(termo);
    });
}

if (inputBusca) {
    inputBusca.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (btnPesquisar) btnPesquisar.click();
        }
    });
}

// --- FUNÇÕES DE BUSCA ---
async function carregarAlunosPorTurma(turma) {
    cardAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Carregando...</p>';

    const { data, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, status, turma')
        .eq('turma', turma)
        .order('nome', { ascending: true });

    renderizarListaAlunos(data, error);
}

async function pesquisarGlobal(termo) {
    cardAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Pesquisando em todas as turmas...</p>';

    const { data, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, status, turma')
        .ilike('nome', `%${termo}%`)
        .order('nome', { ascending: true });

    renderizarListaAlunos(data, error);
}

function renderizarListaAlunos(data, error) {
    if (error) { 
        console.error(error); 
        listaDeAlunos.innerHTML = '<p>Erro ao carregar.</p>'; 
        return; 
    }

    listaDeAlunos.innerHTML = '';
    if (!data || data.length === 0) {
        listaDeAlunos.innerHTML = '<p>Nenhum aluno encontrado.</p>';
        return;
    }

    data.forEach(aluno => {
        const a = document.createElement('button');
        a.className = 'btn-aluno';
        a.dataset.nome = aluno.nome;
        a.dataset.id = aluno.id;
        const statusTag = aluno.status !== 'Ativa' ? ` [${aluno.status}]` : '';
        const turmaTag = labelTurma(aluno.turma);
        a.innerHTML = `${aluno.nome}${statusTag} <br><small style="color:#666;font-weight:normal;">${turmaTag}</small>`;
        
        a.addEventListener('click', () => {
            document.querySelectorAll('.btn-aluno').forEach(b => b.style.borderColor = '#eee');
            a.style.borderColor = 'var(--destaque)';
            abrirDocumentos(aluno);
        });
        listaDeAlunos.appendChild(a);
    });
}

// --- MODAL ADICIONAR ALUNO ---
if (btnAddAlunoGestor) {
    btnAddAlunoGestor.addEventListener('click', () => {
        modalAddAluno.style.display = 'flex';
        document.querySelector('#addNomeGestor').focus();
    });
}

if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
        modalAddAluno.style.display = 'none';
        formAddAluno.reset();
    });
}

if (formAddAluno) {
    formAddAluno.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnSalvar = formAddAluno.querySelector('.btn-salvar');
        btnSalvar.disabled = true;
        btnSalvar.textContent = "Salvando...";

        // Capturando todos os campos do modal
        const matricula = {
            nome: document.querySelector('#addNomeGestor').value.trim(),
            data_nascimento: document.querySelector('#addDataGestor').value,
            sexo: document.querySelector('#addSexoGestor').value,
            nacionalidade: document.querySelector('#addNacionalidadeGestor').value.trim(),
            cidade_nascimento: document.querySelector('#addCidadeNascGestor').value.trim(),
            turma: document.querySelector('#addTurmaGestor').value,
            
            endereco: document.querySelector('#addRuaGestor').value.trim(),
            bairro: document.querySelector('#addBairroGestor').value.trim(),
            numero_endereco: document.querySelector('#addNumeroGestor').value.trim(),
            cidade: document.querySelector('#addCidadeGestor').value.trim(),
            estado: document.querySelector('#addEstadoGestor').value.trim(),
            cep: document.querySelector('#addCepGestor').value.trim(),
            cpf: document.querySelector('#addCpfAlunoGestor').value.trim(),
            rg: document.querySelector('#addRgGestor').value.trim(),

            nome_pai: document.querySelector('#addPaiGestor').value.trim() || null,
            cpf_pai: document.querySelector('#addCpfPaiGestor').value.trim() || null,
            nome_mae: document.querySelector('#addMaeGestor').value.trim() || null,
            cpf_mae: document.querySelector('#addCpfMaeGestor').value.trim() || null,
            
            status: 'Ativa',
            notas: {}
        };

        // Gerando matrícula automática
        const anoAtual = new Date().getFullYear();
        const { data: ultimo } = await supabaseClient.from('alunos').select('numero_matricula').like('numero_matricula', `${anoAtual}%`).order('numero_matricula', { ascending: false }).limit(1);
        let numMatricula = `${anoAtual}0001`;
        if (ultimo && ultimo.length > 0) {
            const ultimoNum = parseInt(ultimo[0].numero_matricula.slice(-4), 10);
            numMatricula = `${anoAtual}${(ultimoNum + 1).toString().padStart(4, '0')}`;
        }
        matricula.numero_matricula = numMatricula;

        // Inserindo no banco
        const { error } = await supabaseClient.from('alunos').insert([matricula]);

        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Matrícula";

        if (error) {
            console.error(error);
            alert("Erro ao cadastrar aluno: " + error.message);
            return;
        }

        alert(`Aluno ${matricula.nome} matriculado com sucesso!\nMatrícula: ${numMatricula}`);
        modalAddAluno.style.display = 'none';
        formAddAluno.reset();
        
        // Atualiza a busca para mostrar o aluno novo
        if (selectTurma.value === matricula.turma) {
            carregarAlunosPorTurma(matricula.turma);
        } else {
            pesquisarGlobal(matricula.nome);
        }
    });
}

// --- EXIBIR DOCUMENTOS ---
function abrirDocumentos(aluno) {
    if (!documentoporAluno) return;
    cardDocumentos.style.display = 'block';
    
    const docs = [
        { label: 'Bolsa Família', icon: 'fa-file-lines' },
        { label: 'Transferência', icon: 'fa-arrow-right-arrow-left' },
        { label: 'Declaração de Matrícula', icon: 'fa-id-card' },
        { label: 'Declaração Provisória', icon: 'fa-file-circle-exclamation' },
        { label: 'Recibo de Pagamento', icon: 'fa-money-check-dollar' },
        { label: 'Ficha Individual', icon: 'fa-clipboard-list' },
        { label: 'Recibo', icon: 'fa-receipt' },
        { label: 'Declaração de Quitação Simples', icon: 'fa-file-invoice-dollar' },
        { label: 'Declaração de Quitação Tabela', icon: 'fa-table' },
        { label: 'Boletim', icon: 'fa-file-pdf' }
    ];

    documentoporAluno.innerHTML = '';
    
    const title = document.createElement('div');
    title.style.cssText = 'grid-column: 1 / -1; font-size: 0.85rem; color: #666; margin-bottom: 10px; font-style: italic;';
    title.textContent = `Aluno: ${aluno.nome}`;
    documentoporAluno.appendChild(title);

    docs.forEach(d => {
        const a = document.createElement('a');
        a.href = '#';
        a.dataset.doc = d.label;
        a.innerHTML = `<i class="fa-solid ${d.icon}" style="color: var(--titlecor);"></i> ${d.label}`;
        a.addEventListener('click', (ev) => {
            ev.preventDefault();
            mostrarAcoesDocumento(aluno.id, d.label);
        });
        const div = document.createElement('div');
        div.className = 'cdocumentos';
        div.appendChild(a);
        documentoporAluno.appendChild(div);
    });
}

function mostrarAcoesDocumento(alunoId, nomeDoc) {
    supabaseClient.from('alunos').select('*').eq('id', alunoId).single()
        .then(({ data: aluno, error }) => {
            if (error || !aluno) { alert("Erro ao carregar aluno."); return; }
            const fn = DOCUMENTOS_HTML[nomeDoc];
            if (!fn) { alert("Modelo não encontrado: " + nomeDoc); return; }

            const html = fn(aluno);
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content" style="text-align: center; max-width: 400px;">
                    <h2 style="justify-content: center; margin-bottom: 10px;">${nomeDoc}</h2>
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Escolha uma ação:</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="btnImprimir" class="btn-primario" style="background: var(--destaque);">Imprimir</button>
                        <button id="btnWord" class="btn-primario" style="background: #28a745;">Baixar Word</button>
                    </div>
                    <button id="btnFecharDoc" class="btn-cancelar" style="width: 100%; margin-top: 15px;">Fechar</button>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.querySelector('#btnImprimir').onclick = () => {
                const win = window.open('', '_blank');
                win.document.write(html);
                win.document.close();
                win.onload = () => { win.print(); };
            };

            overlay.querySelector('#btnWord').onclick = () => {
                const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${nomeDoc.replace(/\s+/g,'_')}-${aluno.nome.replace(/\s+/g,'_')}.doc`;
                a.click();
                URL.revokeObjectURL(url);
            };

            overlay.querySelector('#btnFecharDoc').onclick = () => overlay.remove();
        })
        .catch(e => { console.error(e); alert("Erro ao gerar documento."); });
}

// --- AVISOS ---
async function carregarAvisos() {
    if (!listaSolicitacoes) return;
    const { data, error } = await supabaseClient
        .from('solicitacoes_documentos')
        .select('id, documento, status, criado_em, aluno_id, alunos(nome, turma)')
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
            <button class="btn-mini btn-gerar" data-id="${s.id}" data-aluno-id="${s.aluno_id}" data-aluno="${nomeAluno}" data-doc="${s.documento}">Gerar</button>
            <button class="btn-mini btn-marcar" data-id="${s.id}">Marcar entregue</button>
        `;
        listaSolicitacoes.appendChild(div);
    });

    listaSolicitacoes.querySelectorAll('.btn-gerar').forEach(btn => {
        btn.addEventListener('click', () => {
            mostrarAcoesDocumento(btn.dataset.alunoId, btn.dataset.doc);
        });
    });

    listaSolicitacoes.querySelectorAll('.btn-marcar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const { error } = await supabaseClient.from('solicitacoes_documentos').update({ status: 'Entregue' }).eq('id', id);
            if (error) alert("Erro ao atualizar.");
            else carregarAvisos();
        });
    });
}

// --- PROFESSORES PENDENTES ---
async function carregarProfessoresPendentes() {
    if (!listaProfsPend) return;
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id, nome, cpf_senha, turmas')
        .eq('tipo', 'professor')
        .eq('autorizado', false);

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
            const { error } = await supabaseClient.from('usuarios').update({ autorizado: true }).eq('id', btn.dataset.id);
            if (error) alert("Erro ao autorizar.");
            else carregarProfessoresPendentes();
        });
    });
}