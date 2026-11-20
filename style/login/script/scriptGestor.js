// ============================================================
// scriptGestor.js — Área do Gestor (Versão Final e Segura)
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

const btnAddAlunoGestor = document.querySelector('#btnAddAlunoGestor');
const modalAddAluno     = document.querySelector('#modalAddAlunoGestor');
const btnFecharModal    = document.querySelector('#btnFecharModalGestor');
const formAddAluno      = document.querySelector('#formAddAlunoGestor');
const selectAddTurma    = document.querySelector('#addTurmaGestor');
const listaMatriculasPend = document.querySelector('#listaMatriculasPendentes');
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
    if (selectTurma) selectTurma.innerHTML = '<option value="" selected disabled>Selecione uma turma</option>' + options;
    if (selectAddTurma) selectAddTurma.innerHTML = '<option value="" selected disabled>Selecione...</option>' + options;
}

async function iniciarGestor() {
    const gString = sessionStorage.getItem("@gestorLogado");
    if (!gString) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login.htm";
        return;
    }
    gestorLogado = JSON.parse(gString);
    if (gestorNomeEl) gestorNomeEl.textContent = `Gestor: ${gestorLogado.nome}`;

    if (cardHistorico) cardHistorico.style.display = 'block';

    preencherSelects();
    carregarAvisos();
    carregarProfessoresPendentes();
    carregarMatriculasPendentes();
}

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
        if (termo === '') return alert("Digite o nome do aluno para pesquisar.");
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

async function carregarAlunosPorTurma(turma) {
    cardAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Carregando...</p>';
    const { data, error } = await supabaseClient.from('alunos').select('id, nome, status, turma, pagamentos').eq('turma', turma).eq('autorizado', true).order('nome', { ascending: true });
    renderizarListaAlunos(data, error);
}

async function pesquisarGlobal(termo) {
    cardAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Pesquisando...</p>';
    const { data, error } = await supabaseClient.from('alunos').select('id, nome, status, turma, pagamentos').ilike('nome', `%${termo}%`).order('nome', { ascending: true });
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

    // ORDENAÇÃO ALFABÉTICA INTELIGENTE (Resolve o problema do "10" vir antes do "2")
    data.sort((a, b) => {
        return a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true, sensitivity: 'base' });
    });

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
if (btnAddAlunoGestor) {
    btnAddAlunoGestor.addEventListener('click', () => {
        modalAddAluno.style.display = 'flex';
        document.querySelector('#addNomeGestor').focus();
    });
}
// --- MOSTRAR/ESCONDER CAMPO OUTRO RESPONSÁVEL ---
const addResponsavelGestor = document.querySelector('#addResponsavelGestor');
if (addResponsavelGestor) {
    addResponsavelGestor.addEventListener('change', (e) => {
        const divOutro = document.querySelector('#divOutroRespGestor');
        if (divOutro) {
            divOutro.style.display = e.target.value === 'outro' ? 'block' : 'none';
        }
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
// --- VALIDAÇÃO DA DATA ---
        const dataNasc = document.querySelector('#addDataGestor').value;
        if (!dataNasc) {
            alert("⚠️ Por favor, preencha a Data de Nascimento do aluno.");
            return; // Para o envio
        }
        // --- FIM DA VALIDAÇÃO ---
        
        const btnSalvar = formAddAluno.querySelector('.btn-salvar');

        // --- VALIDAÇÃO DE CPF AQUI ---
        const cpfPaiInput = document.querySelector('#addCpfPaiGestor').value.trim();
        const cpfMaeInput = document.querySelector('#addCpfMaeGestor').value.trim();
        
        const cpfPaiLimpo = cpfPaiInput.replace(/\D/g, '');
        const cpfMaeLimpo = cpfMaeInput.replace(/\D/g, '');

        if (cpfPaiLimpo && cpfPaiLimpo.length !== 11) {
            alert("O CPF do Pai precisa ter exatamente 11 números. Verifique o que foi digitado.");
            return; // Para o código aqui, não salva
        }
        if (cpfMaeLimpo && cpfMaeLimpo.length !== 11) {
            alert("O CPF da Mãe precisa ter exatamente 11 números. Verifique o que foi digitado.");
            return; // Para o código aqui, não salva
        }
        // --- FIM DA VALIDAÇÃO ---

        btnSalvar.disabled = true;
        btnSalvar.textContent = "Salvando...";

        const matricula = {
            nome: document.querySelector('#addNomeGestor').value.trim(),
            data_nascimento: document.querySelector('#addDataGestor').value,
            sexo: document.querySelector('#addSexoGestor').value,
            nacionalidade: document.querySelector('#addNacionalidadeGestor').value.trim(),
            cidade_nascimento: document.querySelector('#addCidadeNascGestor').value.trim(),
            estado_nascimento: document.querySelector('#addEstadoNascGestor').value.trim() || null, 
            turma: document.querySelector('#addTurmaGestor').value,
            turno: document.querySelector('#addTurnoGestor').value,
            
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
            
            responsavel: document.querySelector('#addResponsavelGestor').value,
            responsavel_outro: document.querySelector('#addOutroRespGestor').value.trim() || null,

            status: 'Ativa',
            notas: {},
            pagamentos: []
        };

        // --- CRIA A CONTA DO RESPONSÁVEL NO AUTH (TRATANDO DUPLICIDADE) ---
        const cpfResponsavel = matricula.cpf_pai || matricula.cpf_mae;
        if (cpfResponsavel) {
            const emailAuth = `${cpfResponsavel.replace(/\D/g, '')}@ceje.local`;
            const senhaAuth = cpfResponsavel.replace(/\D/g, '');
            
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: emailAuth,
                password: senhaAuth,
            });
            
            if (authData && authData.user) {
                matricula.auth_id = authData.user.id; 
            } else if (authError && (authError.message.includes("already registered") || authError.message.includes("User already exists"))) {
                const { data: loginData } = await supabaseClient.auth.signInWithPassword({
                    email: emailAuth,
                    password: senhaAuth,
                });
                if (loginData && loginData.user) matricula.auth_id = loginData.user.id;
            }
        }

        // --- SALVA O ALUNO (BANCO GERA MATRÍCULA) ---
        const { data: alunoInserido, error } = await supabaseClient.from('alunos').insert([matricula]).select();

        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Matrícula";

        if (error) {
            console.error(error);
            alert("Erro ao cadastrar aluno: " + error.message);
            return; 
        }

        const matriculaGerada = alunoInserido[0].numero_matricula;
        alert(`Aluno ${matricula.nome} matriculado com sucesso!\nMatrícula: ${matriculaGerada}`);
        
        modalAddAluno.style.display = 'none';
        formAddAluno.reset();
        
        if (selectTurma.value === matricula.turma) carregarAlunosPorTurma(matricula.turma);
        else pesquisarGlobal(matricula.nome);
    });
}
function abrirDocumentos(aluno) {
    if (!documentoporAluno) return;
    cardDocumentos.style.display = 'block';
    const docs = [
        { label: 'Bolsa Família', icon: 'fa-file-lines' }, { label: 'Transferência', icon: 'fa-arrow-right-arrow-left' },
        { label: 'Declaração de Matrícula', icon: 'fa-id-card' }, { label: 'Declaração Provisória', icon: 'fa-file-circle-exclamation' },
        { label: 'Recibo de Pagamento', icon: 'fa-money-check-dollar' }, { label: 'Ficha Individual', icon: 'fa-clipboard-list' },
        { label: 'Recibo', icon: 'fa-receipt' }, { label: 'Declaração de Quitação Simples', icon: 'fa-file-invoice-dollar' },
        { label: 'Declaração de Quitação Tabela', icon: 'fa-table' }, { label: 'Boletim', icon: 'fa-file-pdf' }
    ];
    documentoporAluno.innerHTML = '';
    const title = document.createElement('div');
    title.style.cssText = 'grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;';
    title.innerHTML = `<span style="font-size: 0.85rem; color: #666; font-style: italic;">Aluno: ${aluno.nome}</span>`;
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; width: 100%; margin-bottom: 15px;';
    
    const btnCarne = document.createElement('button'); btnCarne.className = 'btn-primario'; btnCarne.innerHTML = '<i class="fa-solid fa-barcode"></i> Emitir Carnê'; btnCarne.style.cssText = 'padding: 8px 15px; font-size: 0.8rem;'; btnCarne.onclick = () => abrirModalCarne(aluno);
    const btnFinanceiro = document.createElement('button'); btnFinanceiro.className = 'btn-primario'; btnFinanceiro.innerHTML = '<i class="fa-solid fa-chart-line"></i> Financeiro'; btnFinanceiro.style.cssText = 'padding: 8px 15px; font-size: 0.8rem; background: #28a745;'; btnFinanceiro.onclick = () => abrirModalFinanceiro(aluno);

    // NOVO BOTÃO DE EDITAR
    const btnEditarDados = document.createElement('button'); 
    btnEditarDados.className = 'btn-primario'; 
    btnEditarDados.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Dados'; 
    btnEditarDados.style.cssText = 'padding: 8px 15px; font-size: 0.8rem; background: #f59e0b; color: #fff;'; 
    btnEditarDados.onclick = () => abrirModalEditarAluno(aluno);
    
    btnGroup.appendChild(btnCarne); 
    btnGroup.appendChild(btnFinanceiro); 
    btnGroup.appendChild(btnEditarDados); // Adicionando o novo botão
    title.appendChild(btnGroup); 
    documentoporAluno.appendChild(title);
    
    

    docs.forEach(d => {
        const a = document.createElement('a'); a.href = '#'; a.dataset.doc = d.label; a.innerHTML = `<i class="fa-solid ${d.icon}" style="color: var(--titlecor);"></i> ${d.label}`;
        a.addEventListener('click', (ev) => { ev.preventDefault(); mostrarAcoesDocumento(aluno.id, d.label); });
        const div = document.createElement('div'); div.className = 'cdocumentos'; div.appendChild(a); documentoporAluno.appendChild(div);
    });
}

// ============================================================
// FUNÇÕES PARA EDITAR ALUNO
// ============================================================
const modalEditarAluno = document.querySelector('#modalEditarAluno');
const formEditarAluno = document.querySelector('#formEditarAluno');
const btnFecharModalEditar = document.querySelector('#btnFecharModalEditar');

// Abre o modal e preenche os campos
// Abre o modal e preenche os campos
async function abrirModalEditarAluno(aluno) {
    if (!modalEditarAluno) return;
    
    // Mostra um aviso de carregamento
    modalEditarAluno.style.display = 'flex';
    const btnSalvar = formEditarAluno.querySelector('.btn-salvar');
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Carregando...";

    try {
        // BUSCA OS DADOS COMPLETOS DO ALUNO NO BANCO
        const { data: alunoCompleto, error } = await supabaseClient
            .from('alunos')
            .select('*')
            .eq('id', aluno.id)
            .single();

        if (error || !alunoCompleto) throw new Error("Erro ao buscar dados do aluno.");

        // Preenche os campos com os dados completos
        document.querySelector('#editIdAluno').value = alunoCompleto.id;
        document.querySelector('#editNome').value = alunoCompleto.nome || '';
        document.querySelector('#editDataNasc').value = alunoCompleto.data_nascimento || '';
        document.querySelector('#editCidadeNasc').value = alunoCompleto.cidade_nascimento || '';
        document.querySelector('#editEstadoNasc').value = alunoCompleto.estado_nascimento || '';
        document.querySelector('#editNacionalidade').value = alunoCompleto.nacionalidade || 'Brasileira';
        document.querySelector('#editSexo').value = alunoCompleto.sexo || 'Masculino';
        document.querySelector('#editTurno').value = alunoCompleto.turno || 'Manhã';
        
        document.querySelector('#editCpf').value = alunoCompleto.cpf || '';
        document.querySelector('#editRg').value = alunoCompleto.rg || '';
        document.querySelector('#editRua').value = alunoCompleto.endereco || '';
        document.querySelector('#editBairro').value = alunoCompleto.bairro || '';
        document.querySelector('#editNumero').value = alunoCompleto.numero_endereco || '';
        document.querySelector('#editCidade').value = alunoCompleto.cidade || '';
        document.querySelector('#editEstado').value = alunoCompleto.estado || '';
        document.querySelector('#editCep').value = alunoCompleto.cep || '';
        
        document.querySelector('#editPai').value = alunoCompleto.nome_pai || '';
        document.querySelector('#editCpfPai').value = alunoCompleto.cpf_pai || '';
        document.querySelector('#editMae').value = alunoCompleto.nome_mae || '';
        document.querySelector('#editCpfMae').value = alunoCompleto.cpf_mae || '';

        // Preenche o select de turmas
        const selectEditTurma = document.querySelector('#editTurma');
        selectEditTurma.innerHTML = TURMAS.map(t => `<option value="${t}">${labelTurma(t)}</option>`).join('');
        selectEditTurma.value = alunoCompleto.turma;

    } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do aluno: " + err.message);
        modalEditarAluno.style.display = 'none';
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = "Salvar Alterações";
    }
}
// Fecha o modal
if (btnFecharModalEditar) {
    btnFecharModalEditar.addEventListener('click', () => {
        modalEditarAluno.style.display = 'none';
    });
}

// Salva as alterações
if (formEditarAluno) {
    formEditarAluno.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.querySelector('#editIdAluno').value;
        const btnSalvar = formEditarAluno.querySelector('.btn-salvar');
        
        btnSalvar.disabled = true;
        btnSalvar.textContent = "Salvando...";

        const dadosAtualizados = {
            nome: document.querySelector('#editNome').value.trim(),
            data_nascimento: document.querySelector('#editDataNasc').value,
            cidade_nascimento: document.querySelector('#editCidadeNasc').value.trim(),
            estado_nascimento: document.querySelector('#editEstadoNasc').value.trim().toUpperCase() || null,
            nacionalidade: document.querySelector('#editNacionalidade').value.trim(),
            sexo: document.querySelector('#editSexo').value,
            turno: document.querySelector('#editTurno').value,
            turma: document.querySelector('#editTurma').value,
            
            cpf: document.querySelector('#editCpf').value.trim(),
            rg: document.querySelector('#editRg').value.trim(),
            endereco: document.querySelector('#editRua').value.trim(),
            bairro: document.querySelector('#editBairro').value.trim(),
            numero_endereco: document.querySelector('#editNumero').value.trim(),
            cidade: document.querySelector('#editCidade').value.trim(),
            estado: document.querySelector('#editEstado').value.trim().toUpperCase(),
            cep: document.querySelector('#editCep').value.trim(),
            
            nome_pai: document.querySelector('#editPai').value.trim() || null,
            cpf_pai: document.querySelector('#editCpfPai').value.trim() || null,
            nome_mae: document.querySelector('#editMae').value.trim() || null,
            cpf_mae: document.querySelector('#editCpfMae').value.trim() || null,
        };

        try {
            const { error } = await supabaseClient
                .from('alunos')
                .update(dadosAtualizados)
                .eq('id', id);

            if (error) throw error;

            alert("Dados atualizados com sucesso!");
            modalEditarAluno.style.display = 'none';
            
            // Recarrega a lista de alunos para atualizar a tela
            if (selectTurma.value) {
                carregarAlunosPorTurma(selectTurma.value);
            } else {
                pesquisarGlobal(dadosAtualizados.nome);
            }

        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar dados: " + err.message);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.textContent = "Salvar Alterações";
        }
    });
}

// ... (Funções de Modal Carnê, Financeiro, Documentos, Avisos e Professores Pendentes permanecem iguais) ...
// Se precisar do restante do código a partir daqui, me avise!
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
        .then(async ({ data: aluno, error }) => {
            if (error || !aluno) { alert("Erro ao carregar aluno."); return; }

            // Se for Boletim, mantém o menu de Turma Completa
            if (nomeDoc === 'Boletim') {
                const overlay = document.createElement('div');
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-content" style="text-align: center; max-width: 400px;">
                        <h2 style="justify-content: center; margin-bottom: 10px;">Boletim</h2>
                        <p style="font-size: 0.9rem; color: #666; margin-bottom: 20px;">Escolha o tipo de download:</p>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button id="btnSoAluno" class="btn-primario" style="background: #28a745; width: 100%;">
                                <i class="fa-solid fa-user"></i> Apenas este Aluno
                            </button>
                            <button id="btnTurmaInteira" class="btn-primario" style="background: var(--destaque); width: 100%;">
                                <i class="fa-solid fa-users"></i> Turma Completa
                            </button>
                        </div>
                        <button id="btnFecharOpcoes" class="btn-cancelar" style="width: 100%; margin-top: 15px;">Fechar</button>
                    </div>
                `;
                document.body.appendChild(overlay);

                overlay.querySelector('#btnSoAluno').onclick = async () => {
                    overlay.remove();
                    const docBlob = await docBoletim(aluno);
                    if (!docBlob) return;
                    const url = URL.createObjectURL(docBlob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `Boletim-${aluno.nome.replace(/\s+/g,'_')}.docx`;
                    a.click(); URL.revokeObjectURL(url);
                };

                overlay.querySelector('#btnTurmaInteira').onclick = async () => {
                    overlay.remove();
                    const { data: alunosTurma, error: errTurma } = await supabaseClient
                        .from('alunos').select('*').eq('turma', aluno.turma).eq('autorizado', true);
                    if (errTurma || !alunosTurma || alunosTurma.length === 0) return alert("Não há alunos autorizados nesta turma.");
                    const docBlob = await docBoletimTurma(alunosTurma);
                    if (!docBlob) return;
                    const url = URL.createObjectURL(docBlob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `Boletins-${labelTurma(aluno.turma).replace(/\s+/g,'_')}.docx`;
                    a.click(); URL.revokeObjectURL(url);
                };

                overlay.querySelector('#btnFecharOpcoes').onclick = () => overlay.remove();
                return;
            }

            // Para TODOS os outros documentos (que agora geram Word)
            const fn = DOCUMENTOS_HTML[nomeDoc];
            if (!fn) { alert("Modelo não encontrado: " + nomeDoc); return; }

            // Mostra um aviso rápido
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `<div class="modal-content" style="text-align: center; padding: 40px;"><h2>Gerando documento...</h2><p>Aguarde um instante.</p></div>`;
            document.body.appendChild(overlay);

            try {
                const docBlob = await fn(aluno);
                if (docBlob) {
                    const url = URL.createObjectURL(docBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${nomeDoc.replace(/\s+/g,'_')}-${aluno.nome.replace(/\s+/g,'_')}.docx`;
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    alert("O documento não pôde ser gerado.");
                }
            } catch (err) {
                console.error(err);
                alert("Erro ao gerar o documento: " + err.message);
            } finally {
                overlay.remove();
            }
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

// --- MATRÍCULAS PENDENTES ---
async function carregarMatriculasPendentes() {
    if (!listaMatriculasPend) return;
    
    const { data, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, turma, nome_pai, solicitou_visita') // Puxa o campo de visita
        .eq('autorizado', false)
        .eq('status', 'Pendente');

    if (error) { console.error(error); return; }

    listaMatriculasPend.innerHTML = '';
    if (!data || data.length === 0) {
        listaMatriculasPend.innerHTML = '<p>Nenhuma matrícula pendente.</p>';
        return;
    }

    data.forEach(a => {
        const div = document.createElement('div');
        div.className = 'aviso-item';
        
        // Se o pai pediu visita, mostra um aviso em vermelho
        const avisoVisita = a.solicitou_visita 
            ? `<div style="color: #dc3545; font-weight: bold; margin: 5px 0; font-size: 0.85rem;"><i class="fa-solid fa-bell"></i> Solicitou Visita à Escola!</div>` 
            : '';

        div.innerHTML = `
            <strong>${a.nome}</strong> (${labelTurma(a.turma)})<br>
            Pai/Mãe: ${a.nome_pai || 'Não informado'}<br>
            ${avisoVisita}
            <button class="btn-mini btn-autorizar-matricula" data-id="${a.id}" style="margin-top: 8px;">Aprovar Matrícula</button>
        `;
        listaMatriculasPend.appendChild(div);
    });

    listaMatriculasPend.querySelectorAll('.btn-autorizar-matricula').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm("Aprovar esta matrícula? O número será gerado automaticamente.")) return;
            
            const { error } = await supabaseClient
                .from('alunos')
                .update({ autorizado: true, status: 'Ativa' })
                .eq('id', btn.dataset.id);
                
            if (error) {
                alert("Erro ao aprovar: " + error.message);
            } else {
                alert("Matrícula aprovada! O responsável já pode acessar os documentos.");
                carregarMatriculasPendentes();
            }
        });
    });
}

// ============================================================
// HISTÓRICO DE ANOS ANTERIORES
// ============================================================
const selectAnoHistorico = document.querySelector('#selectAnoHistorico');
const listaHistoricoAlunos = document.querySelector('#listaHistoricoAlunos');
const cardHistorico = document.querySelector('#cardHistorico');

async function carregarAnosHistorico() {
    if (!selectAnoHistorico) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('alunos_historico')
            .select('ano_letivo');
        
        if (error) {
            console.error('Erro ao buscar histórico:', error);
            selectAnoHistorico.innerHTML = '<option value="">Erro ao carregar (veja o console F12)</option>';
            return;
        }

        if (!data || data.length === 0) {
            selectAnoHistorico.innerHTML = '<option value="">Nenhum histórico encontrado</option>';
            return;
        }

        const anosUnicos = [...new Set(data.map(d => d.ano_letivo))].sort((a, b) => b - a);
        
        selectAnoHistorico.innerHTML = '<option value="">Selecione um ano...</option>';
        anosUnicos.forEach(ano => {
            const opt = document.createElement('option');
            opt.value = ano;
            opt.textContent = `Ano Letivo ${ano}`;
            selectAnoHistorico.appendChild(opt);
        });
    } catch (err) {
        console.error('Erro inesperado:', err);
        selectAnoHistorico.innerHTML = '<option value="">Erro inesperado</option>';
    }
}

if (selectAnoHistorico) {
    selectAnoHistorico.addEventListener('change', async () => {
        const ano = selectAnoHistorico.value;
        if (!ano) { listaHistoricoAlunos.innerHTML = ''; return; }

        listaHistoricoAlunos.innerHTML = '<p>Carregando alunos de ' + ano + '...</p>';
        
        try {
            const { data, error } = await supabaseClient
                .from('alunos_historico')
                .select('dados_aluno')
                .eq('ano_letivo', ano);
                
            if (error) { listaHistoricoAlunos.innerHTML = '<p>Erro ao carregar.</p>'; return; }

            listaHistoricoAlunos.innerHTML = '';
            if (!data || data.length === 0) { listaHistoricoAlunos.innerHTML = '<p>Nenhum aluno encontrado.</p>'; return; }

            data.forEach(item => {
                const a = item.dados_aluno;
                const div = document.createElement('div');
                div.className = 'aluno-item';
                div.innerHTML = `<strong>${a.nome}</strong> - ${labelTurma(a.turma)}`;
                listaHistoricoAlunos.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            listaHistoricoAlunos.innerHTML = '<p>Erro ao carregar histórico.</p>';
        }
    });
}
// ============================================================
// VIRADA DE ANO LETIVO (BACKUP, PROMOÇÃO E LIMPEZA)
// ============================================================
const btnViradaAno = document.querySelector('#btnViradaAno');

// Função para calcular a próxima turma
function getProximaTurma(turmaAtual) {
    if (!turmaAtual) return turmaAtual;
    const t = turmaAtual.toLowerCase();

    // Progressão do Infantil
    if (t === 'infantil-i-a') return 'infantil-II-a';
    if (t === 'infantil-i-b') return 'infantil-II-b';
    if (t === 'infantil-II-a') return 'infantil-III-a';
    if (t === 'infantil-II-b') return 'infantil-III-b';
    if (t === 'infantil-III-a') return '1ano-a';
    if (t === 'infantil-III-b') return '1ano-b';

    // Progressão do Fundamental I
    if (t === '1ano-a') return '2ano-a';
    if (t === '1ano-b') return '2ano-b';
    if (t === '2ano-a') return '3ano-a';
    if (t === '2ano-b') return '3ano-b';
    if (t === '3ano-a') return '4ano-a';
    if (t === '3ano-b') return '4ano-b';
    if (t === '4ano-a') return '5ano-a';
    if (t === '4ano-b') return '5ano-b';
    if (t === '5ano-a') return '6ano-a';
    if (t === '5ano-b') return '6ano-a'; // Junta as turmas no 6º ano

    // Progressão do Fundamental II
    if (t === '6ano-a') return '7ano-a';
    if (t === '7ano-a') return '8ano-a';
    if (t === '8ano-a') return '9ano-a';
    if (t === '9ano-a') return 'CONCLUIDO'; // Alunos do 9º ano saem da escola

    return turmaAtual; // Se não bater, mantém
}

if (btnViradaAno) {
    btnViradaAno.addEventListener('click', async () => {
        const anoAtual = new Date().getFullYear();
        
        if (!confirm(`⚠️ ATENÇÃO: Virada de Ano Letivo!\n\nIsso irá:\n1. Salvar todos os alunos de ${anoAtual} no histórico (com notas).\n2. PROMOVER os alunos para a próxima série.\n3. LIMPAR as notas bimestrais para o novo ano.\n4. ATUALIZAR as turmas dos professores.\n\nDeseja continuar?`)) return;
        
        btnViradaAno.disabled = true;
        btnViradaAno.innerHTML = "Processando...";

        try {
            // 1. Busca todos os alunos
            const { data: alunos, error: errBusca } = await supabaseClient.from('alunos').select('*');
            if (errBusca) throw errBusca;
            if (!alunos || alunos.length === 0) {
                alert("Não há alunos para arquivar.");
                return;
            }

            // 2. Salva no Histórico (Backup completo)
            const historico = alunos.map(a => ({
                aluno_id_original: a.id,
                ano_letivo: anoAtual,
                dados_aluno: a 
            }));
            const { error: errInsert } = await supabaseClient.from('alunos_historico').insert(historico);
            if (errInsert) throw errInsert;

            // 3. Prepara a lista de alunos promovidos para o próximo ano
            const alunosPromovidos = alunos
                .filter(a => a.status === 'Ativa') // Só promove quem está ativo
                .map(a => {
                    const novaTurma = getProximaTurma(a.turma);
                    if (novaTurma === 'CONCLUIDO') return null; // Remove quem concluiu o 9º

                    // Copia todos os dados do aluno
                    const novoAluno = { ...a };
                    
                    // A MÁGICA: Remove o ID e a matrícula antiga para o banco gerar novos
                    delete novoAluno.id;
                    delete novoAluno.numero_matricula;

                    // Atualiza a turma e limpa o JSON de notas
                    novoAluno.turma = novaTurma;
                    novoAluno.notas = {};

                    // Limpa as colunas de notas individuais (b1_, b2_, mdf_, etc)
                    Object.keys(novoAluno).forEach(key => {
                        if (key.startsWith('b1_') || key.startsWith('b2_') || 
                            key.startsWith('b3_') || key.startsWith('b4_') || 
                            key.startsWith('mdf_') || key.startsWith('status_')) {
                            novoAluno[key] = null;
                        }
                    });

                    return novoAluno;
                })
                .filter(a => a !== null);

            // 4. Deleta todos os alunos antigos
            const { error: errDelete } = await supabaseClient.from('alunos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (errDelete) throw errDelete;

            // 5. Insere os alunos promovidos
            if (alunosPromovidos.length > 0) {
                const { error: errPromove } = await supabaseClient.from('alunos').insert(alunosPromovidos);
                if (errPromove) throw errPromove;
            }

            // 6. Atualiza as turmas dos professores
            const { data: professores } = await supabaseClient.from('usuarios').select('id, turmas').eq('tipo', 'professor');
            const turmasValidas = ['infantil-I-a','infantil-I-b', 'infantil-II-a','infantil-II-b', 'infantil-III-a','infantil-III-b', '1ano-a','1ano-b', '2ano-a','2ano-b', '3ano-a','3ano-b', '4ano-a','4ano-b', '5ano-a','5ano-b', '6ano-a', '7ano-a', '8ano-a', '9ano-a'];

            if (professores) {
                for (const prof of professores) {
                    let turmasProf = prof.turmas || [];
                    if (typeof turmasProf === 'string') {
                        try { turmasProf = JSON.parse(turmasProf); } catch(e) { turmasProf = []; }
                    }
                    
                    const novasTurmas = turmasProf.filter(t => turmasValidas.includes(t));
                    
                    if (novasTurmas.length !== turmasProf.length) {
                        await supabaseClient.from('usuarios').update({ turmas: novasTurmas }).eq('id', prof.id);
                    }
                }
            }

            alert(`✅ Ano ${anoAtual} fechado!\n\nAlunos promovidos com sucesso. As notas foram zeradas para o novo ano letivo.`);
            
            // Limpa o filtro de turma e limpa a lista na tela
            selectTurma.value = "";
            listaDeAlunos.innerHTML = '<p>Lista limpa para o novo ano. Selecione uma turma para ver os alunos promovidos.</p>';
            cardAlunos.style.display = 'block';
            
            // Atualiza o histórico
            carregarAnosHistorico(); 

        } catch (err) {
            console.error(err);
            alert("Erro ao fechar o ano: " + err.message);
        } finally {
            btnViradaAno.disabled = false;
            btnViradaAno.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Fechar Ano e Promover Alunos';
        }
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
