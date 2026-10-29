// ============================================================
// scriptGestor.js — Área do Gestor (Com Carnê e Financeiro)
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
            inputBusca.value = ''; 
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
        selectTurma.value = ""; 
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
        .select('id, nome, status, turma, pagamentos')
        .eq('turma', turma)
        .order('nome', { ascending: true });

    renderizarListaAlunos(data, error);
}

async function pesquisarGlobal(termo) {
    cardAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Pesquisando em todas as turmas...</p>';

    const { data, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, status, turma, pagamentos')
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
            notas: {},
            pagamentos: []
        };

        const anoAtual = new Date().getFullYear();
        const { data: ultimo } = await supabaseClient.from('alunos').select('numero_matricula').like('numero_matricula', `${anoAtual}%`).order('numero_matricula', { ascending: false }).limit(1);
        let numMatricula = `${anoAtual}0001`;
        if (ultimo && ultimo.length > 0) {
            const ultimoNum = parseInt(ultimo[0].numero_matricula.slice(-4), 10);
            numMatricula = `${anoAtual}${(ultimoNum + 1).toString().padStart(4, '0')}`;
        }
        matricula.numero_matricula = numMatricula;

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
    title.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;';
    title.innerHTML = `<span style="font-size: 0.85rem; color: #666; font-style: italic;">Aluno: ${aluno.nome}</span>`;
    
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 10px;';
    
    const btnCarne = document.createElement('button');
    btnCarne.className = 'btn-primario';
    btnCarne.innerHTML = '<i class="fa-solid fa-barcode"></i> Emitir Carnê';
    btnCarne.style.cssText = 'padding: 8px 15px; font-size: 0.8rem;';
    btnCarne.onclick = () => abrirModalCarne(aluno);

    const btnFinanceiro = document.createElement('button');
    btnFinanceiro.className = 'btn-primario';
    btnFinanceiro.innerHTML = '<i class="fa-solid fa-chart-line"></i> Financeiro';
    btnFinanceiro.style.cssText = 'padding: 8px 15px; font-size: 0.8rem; background: #28a745;';
    btnFinanceiro.onclick = () => abrirModalFinanceiro(aluno);
    
    btnGroup.appendChild(btnCarne);
    btnGroup.appendChild(btnFinanceiro);
    title.appendChild(btnGroup);
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

// --- MODAL EMITIR CARNÊ ---
function abrirModalCarne(aluno) {
    let modalCarne = document.getElementById('modalCarne');
    if (!modalCarne) {
        modalCarne = document.createElement('div');
        modalCarne.id = 'modalCarne';
        modalCarne.className = 'modal-overlay';
        modalCarne.style.display = 'none';
        modalCarne.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <h2><i class="fa-solid fa-barcode" style="color: var(--destaque);"></i> Emitir Carnê</h2>
                <form id="formCarne">
                    
                    <div style="background: #e6f2ff; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 0.9rem; border: 1px solid #cce5ff;">
                        <strong>Aluno Principal (1º Irmão):</strong> <span id="nomeAlunoPrincipalCarne"></span>
                    </div>

                    <div class="input-group">
                        <label>Valor da Parcela (R$):</label>
                        <input type="text" id="valorCarne" value="300,00" required>
                    </div>
                    
                    <div class="input-group" style="margin-top: 15px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="temIrmaoCarne" style="width: auto;"> 
                            Adicionar mais irmão(s) neste carnê?
                        </label>
                    </div>

                    <div id="areaIrmaos" style="display: none; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #eee; margin-top: 10px;">
                        <div class="input-group">
                            <label>Nome do 2º Irmão:</label>
                            <input type="text" id="nomeIrmao1" placeholder="Nome do 2º irmão">
                        </div>
                        <div class="input-group">
                            <label>Série do 2º Irmão:</label>
                            <select id="turmaIrmao1" class="select-turma"></select>
                        </div>
                        <hr style="margin: 10px 0; border: none; border-top: 1px dashed #ccc;">
                        <div class="input-group">
                            <label>Nome do 3º Irmão (Opcional):</label>
                            <input type="text" id="nomeIrmao2" placeholder="Nome do 3º irmão">
                        </div>
                        <div class="input-group">
                            <label>Série do 3º Irmão (Opcional):</label>
                            <select id="turmaIrmao2" class="select-turma"></select>
                        </div>
                    </div>
                    
                    <div class="modal-botoes">
                        <button type="button" class="btn-cancelar" id="btnFecharCarne">Cancelar</button>
                        <button type="submit" class="btn-salvar">Gerar Carnê</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalCarne);

        document.getElementById('btnFecharCarne').onclick = () => modalCarne.style.display = 'none';
        document.getElementById('temIrmaoCarne').onchange = (e) => {
            document.getElementById('areaIrmaos').style.display = e.target.checked ? 'block' : 'none';
        };

        const options = TURMAS.map(t => `<option value="${t}">${labelTurma(t)}</option>`).join('');
        document.querySelectorAll('.select-turma').forEach(sel => {
            sel.innerHTML = '<option value="">Selecione...</option>' + options;
        });
    }

    document.getElementById('nomeAlunoPrincipalCarne').textContent = aluno.nome;
    
    document.getElementById('formCarne').reset();
    document.getElementById('areaIrmaos').style.display = 'none';
    modalCarne.style.display = 'flex';
    document.getElementById('valorCarne').focus();

    document.getElementById('formCarne').onsubmit = (e) => {
        e.preventDefault();
        const valor = document.getElementById('valorCarne').value;
        const temIrmao = document.getElementById('temIrmaoCarne').checked;
        
        const opcoes = {
            valor: valor,
            temIrmao: temIrmao,
            irmao1: temIrmao ? { nome: document.getElementById('nomeIrmao1').value, turma: document.getElementById('turmaIrmao1').value } : null,
            irmao2: temIrmao ? { nome: document.getElementById('nomeIrmao2').value, turma: document.getElementById('turmaIrmao2').value } : null
        };

        supabaseClient.from('alunos').select('*').eq('id', aluno.id).single()
            .then(({ data: alunoCompleto, error }) => {
                if (error || !alunoCompleto) return alert("Erro ao buscar dados.");
                
                const html = docCarne(alunoCompleto, opcoes);
                
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-content" style="text-align: center; max-width: 400px;">
                        <h2 style="justify-content: center; margin-bottom: 10px;">Carnê Pronto</h2>
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
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
                    a.download = `Carne-${aluno.nome.replace(/\s+/g,'_')}.doc`;
                    a.click();
                    URL.revokeObjectURL(url);
                };

                overlay.querySelector('#btnFecharDoc').onclick = () => { overlay.remove(); modalCarne.style.display = 'none'; };
            });
    };
}

// --- MODAL FINANCEIRO (CONTABILIDADE INDIVIDUAL) ---
function abrirModalFinanceiro(aluno) {
    let modalFin = document.getElementById('modalFinanceiro');
    if (!modalFin) {
        modalFin = document.createElement('div');
        modalFin.id = 'modalFinanceiro';
        modalFin.className = 'modal-overlay';
        modalFin.style.display = 'none';
        modalFin.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <h2><i class="fa-solid fa-chart-line" style="color: #28a745;"></i> Contabilidade Financeira</h2>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Selecione os meses pagos pelo aluno. O relatório será gerado automaticamente.</p>
                <form id="formFinanceiro">
                    <div id="listaMesesFin" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                        <!-- Preenchido via JS -->
                    </div>
                    <div class="modal-botoes">
                        <button type="button" class="btn-cancelar" id="btnFecharFin">Cancelar</button>
                        <button type="submit" class="btn-salvar" style="background: #28a745;">Salvar e Gerar Relatório</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modalFin);
        document.getElementById('btnFecharFin').onclick = () => modalFin.style.display = 'none';
    }

    const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const pagamentos = aluno.pagamentos || [];
    const containerMeses = document.getElementById('listaMesesFin');
    
    containerMeses.innerHTML = mesesNomes.map((m, i) => {
        const numMes = i + 1;
        const isPago = pagamentos.includes(numMes);
        return `
            <label style="display: flex; align-items: center; gap: 8px; background: #f8f9fa; padding: 10px; border-radius: 6px; border: 1px solid #eee; cursor: pointer;">
                <input type="checkbox" class="check-mes" value="${numMes}" ${isPago ? 'checked' : ''}>
                ${m}
            </label>
        `;
    }).join('');

    modalFin.style.display = 'flex';

    document.getElementById('formFinanceiro').onsubmit = async (e) => {
        e.preventDefault();
        const novosPagamentos = [];
        document.querySelectorAll('.check-mes:checked').forEach(cb => {
            novosPagamentos.push(parseInt(cb.value));
        });

        // SALVA AUTOMATICAMENTE NO SUPABASE
        const { error } = await supabaseClient.from('alunos').update({ pagamentos: novosPagamentos }).eq('id', aluno.id);
        if (error) return alert("Erro ao salvar financeiro.");

        // Gera o relatório
        supabaseClient.from('alunos').select('*').eq('id', aluno.id).single()
            .then(({ data: alunoCompleto }) => {
                const html = docContabilidade(alunoCompleto, novosPagamentos);
                
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-content" style="text-align: center; max-width: 400px;">
                        <h2 style="justify-content: center; margin-bottom: 10px;">Dados Salvos!</h2>
                        <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">O relatório já está pronto para ser impresso ou baixado.</p>
                        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                            <button id="btnImprimirFin" class="btn-primario" style="background: var(--destaque);">Imprimir</button>
                            <button id="btnWordFin" class="btn-primario" style="background: #28a745;">Baixar Word</button>
                        </div>
                        <button id="btnFecharFinDoc" class="btn-cancelar" style="width: 100%; margin-top: 15px;">Fechar</button>
                    </div>
                `;
                document.body.appendChild(overlay);

                overlay.querySelector('#btnImprimirFin').onclick = () => {
                    const win = window.open('', '_blank');
                    win.document.write(html);
                    win.document.close();
                    win.onload = () => { win.print(); };
                };

                overlay.querySelector('#btnWordFin').onclick = () => {
                    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Relatorio-${aluno.nome.replace(/\s+/g,'_')}.doc`;
                    a.click();
                    URL.revokeObjectURL(url);
                };

                overlay.querySelector('#btnFecharFinDoc').onclick = () => { overlay.remove(); modalFin.style.display = 'none'; };
            });
    };
}

// --- GERAR DOCUMENTOS PADRÃO ---
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

// ============================================================
// LÓGICA DA ÁREA FINANCEIRA GLOBAL
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnPagos = document.getElementById('btnRelatorioPagos');
    const btnPendentes = document.getElementById('btnRelatorioPendentes');
    const cardFinGlobal = document.getElementById('cardFinanceiroGlobal');

    if(cardFinGlobal) cardFinGlobal.style.display = 'block';

    async function gerarRelatorioGlobal(tipo) {
        const originalText = tipo === 'pagos' ? btnPagos.innerHTML : btnPendentes.innerHTML;
        if (tipo === 'pagos') { btnPagos.innerHTML = "Gerando..."; btnPagos.disabled = true; }
        else { btnPendentes.innerHTML = "Gerando..."; btnPendentes.disabled = true; }

        const { data: alunos, error } = await supabaseClient
            .from('alunos')
            .select('nome, turma, pagamentos')
            .eq('status', 'Ativa')
            .order('turma', { ascending: true })
            .order('nome', { ascending: true });

        if (tipo === 'pagos') { btnPagos.innerHTML = originalText; btnPagos.disabled = false; }
        else { btnPendentes.innerHTML = originalText; btnPendentes.disabled = false; }

        if (error) {
            console.error(error);
            return alert("Erro ao buscar dados financeiros.");
        }

        const html = docRelatorioGlobal(alunos, tipo);

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" style="text-align: center; max-width: 400px;">
                <h2 style="justify-content: center; margin-bottom: 10px;">Relatório Gerado</h2>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">${tipo === 'pagos' ? 'Extrato de Pagos' : 'Relatório de Pendências'}</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="btnImprimirGlobal" class="btn-primario" style="background: var(--destaque);">Imprimir</button>
                    <button id="btnWordGlobal" class="btn-primario" style="background: #28a745;">Baixar Word</button>
                </div>
                <button id="btnFecharGlobal" class="btn-cancelar" style="width: 100%; margin-top: 15px;">Fechar</button>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#btnImprimirGlobal').onclick = () => {
            const win = window.open('', '_blank');
            win.document.write(html);
            win.document.close();
            win.onload = () => { win.print(); };
        };

        overlay.querySelector('#btnWordGlobal').onclick = () => {
            const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Relatorio-${tipo}-${new Date().getTime()}.doc`;
            a.click();
            URL.revokeObjectURL(url);
        };

        overlay.querySelector('#btnFecharGlobal').onclick = () => overlay.remove();
    }

    if (btnPagos) btnPagos.onclick = () => gerarRelatorioGlobal('pagos');
    if (btnPendentes) btnPendentes.onclick = () => gerarRelatorioGlobal('pendentes');
});