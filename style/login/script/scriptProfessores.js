// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    iniciarSistema();
};
document.head.appendChild(scriptSupabase);

const selectTurma = document.querySelector('#iturma');
const listaAlunosDiv = document.querySelector('#lista-Alunos');
const telaNotas = document.querySelector('#lancar-Notas');
const formNotas = document.querySelector('#formularioNotas');
const nomeAlunoNota = document.querySelector('#nomeAlunoNota');
const btnCancelarNotas = document.querySelector('#btnCancelarNotas');

const modalAddAluno = document.querySelector('#modalAddAluno');
const formAddAluno = document.querySelector('#formAddAluno');
const btnFecharModal = document.querySelector('#btnFecharModal');

let professorLogado = null;
let alunoSelecionadoId = null;

const MATERIAS = ['portugues', 'matematica', 'historia', 'geografia', 'ciencias', 'ed_fisica', 'ingles', 'arte', 'etica'];

function formatarNota(valor) {
    if (valor === null || valor === undefined || isNaN(valor) || valor === 0) return "--";
    return Number(valor).toFixed(1);
}

function formatarDataBR(iso) {
    if (!iso) return 'Sem data';
    const apenasData = String(iso).slice(0, 10);
    const partes = apenasData.split('-');
    if (partes.length !== 3) return apenasData;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function iniciarSistema() {
    const profString = localStorage.getItem("@professorLogado");
    if (!profString) {
        alert("Sessão expirada.");
        window.location.href = "login.htm";
        return;
    }

    professorLogado = JSON.parse(profString);
    let turmas = professorLogado.turmas;
    if (typeof turmas === 'string') {
        try { turmas = JSON.parse(turmas); } catch (e) { turmas = turmas.split(',').map(t => t.trim()); }
    }
    if (!Array.isArray(turmas)) turmas = [];
    professorLogado.turmas = turmas;

    const nomeEl = document.querySelector('#nomeProfessorLogado');
    if (nomeEl) nomeEl.textContent = `Prof. ${professorLogado.nome}`;

    selectTurma.innerHTML = '<option value="" selected disabled>Selecione uma turma</option>';
    if (turmas.length > 0) {
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma;
            option.textContent = turma.toUpperCase();
            selectTurma.appendChild(option);
        });
    }
}

// --- CARREGAR ALUNOS ---
selectTurma.addEventListener('change', async function() {
    const turmaSelecionada = selectTurma.value;
    listaAlunosDiv.style.display = "block";
    listaAlunosDiv.innerHTML = "<p>Carregando alunos...</p>";

    const { data: alunos, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, numero_matricula, data_nascimento, notas, status')
        .eq('turma', turmaSelecionada)
        .eq('status', 'Ativa')
        .order('nome', { ascending: true });

    if (error) { console.error(error); listaAlunosDiv.innerHTML = "<p>Erro ao carregar.</p>"; return; }

    listaAlunosDiv.innerHTML = "";

    if (alunos.length === 0) {
        listaAlunosDiv.innerHTML = "<p>Nenhum aluno ativo nesta turma.</p>";
    } else {
        alunos.forEach(aluno => {
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('aluno-item');

            const btnNome = document.createElement('button');
            btnNome.classList.add('btn-nome-aluno');
            btnNome.textContent = `${aluno.nome} (Nasc: ${formatarDataBR(aluno.data_nascimento)})`;
            btnNome.addEventListener('click', () => abrirTelaNotas(aluno));

            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn-editar');
            btnEditar.innerHTML = '<i class="fa-solid fa-pencil" style="color: black;"></i>';

            const painelEdicao = document.createElement('div');
            painelEdicao.classList.add('painel-edicao');
            painelEdicao.style.width = "100%";
            painelEdicao.innerHTML = `
                <button class="btn-acao btn-transferir" onclick="mudarStatus('${aluno.id}', 'Transferido')"><i class="fa-solid fa-arrow-right-arrow-left"></i> Transferir</button>
                <button class="btn-acao btn-desistente" onclick="mudarStatus('${aluno.id}', 'Desistente')"><i class="fa-solid fa-user-slash"></i> Desistente</button>
                <button class="btn-acao btn-excluir" onclick="excluirAluno('${aluno.id}')"><i class="fa-solid fa-trash"></i> Excluir</button>
            `;

            btnEditar.addEventListener('click', () => {
                painelEdicao.style.display = painelEdicao.style.display === "flex" ? "none" : "flex";
            });

            itemContainer.appendChild(btnNome);
            itemContainer.appendChild(btnEditar);
            itemContainer.appendChild(painelEdicao);
            listaAlunosDiv.appendChild(itemContainer);
        });
    }

    const btnAdd = document.createElement('button');
    btnAdd.classList.add('btn-add-aluno');
    btnAdd.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Novo Aluno';
    btnAdd.addEventListener('click', () => {
        modalAddAluno.style.display = "flex";
        document.querySelector('#addNome').focus();
    });
    listaAlunosDiv.appendChild(btnAdd);
});

// --- MODAL ADICIONAR ALUNO ---
btnFecharModal.addEventListener('click', () => {
    modalAddAluno.style.display = "none";
    formAddAluno.reset();
});

formAddAluno.addEventListener('submit', async function(e) {
    e.preventDefault();
    const nome = document.querySelector('#addNome').value.trim();
    const dataNasc = document.querySelector('#addData').value;
    const turmaSelecionada = selectTurma.value;

    if (!turmaSelecionada) return alert("Selecione uma turma primeiro.");

    const anoAtual = new Date().getFullYear();
    const numProvisorio = `PROV-${anoAtual}-${Math.floor(Math.random() * 10000)}`;

    const { data, error } = await supabaseClient.from('alunos').insert([{
        nome: nome,
        data_nascimento: dataNasc || null,
        turma: turmaSelecionada,
        status: 'Ativa',
        numero_matricula: numProvisorio,
        notas: {}
    }]).select();

    if (error) { console.error(error); return alert("Erro ao adicionar aluno."); }

    await supabaseClient.from('avisos').insert([{
        tipo: 'Aluno Incompleto',
        mensagem: `O professor adicionou o aluno "${nome}" na turma ${turmaSelecionada.toUpperCase()}. Faltam dados cadastrais.`,
        aluno_id: data[0].id,
        lido: false
    }]);

    alert("Aluno adicionado com sucesso! O Gestor foi notificado.");
    modalAddAluno.style.display = "none";
    formAddAluno.reset();
    selectTurma.dispatchEvent(new Event('change'));
});

// --- FUNÇÕES GLOBAIS DE EDIÇÃO ---
window.mudarStatus = async function(id, novoStatus) {
    if (!confirm(`Tem certeza que deseja marcar este aluno como ${novoStatus}?`)) return;
    const dataAtual = new Date().toISOString().split('T')[0];
    let updateData = { status: novoStatus };
    if (novoStatus === 'Transferido') updateData.data_transferencia = dataAtual;
    if (novoStatus === 'Desistente') updateData.data_desistencia = dataAtual;
    const { error } = await supabaseClient.from('alunos').update(updateData).eq('id', id);
    if (error) alert("Erro ao atualizar status.");
    else { alert(`Aluno marcado como ${novoStatus}!`); selectTurma.dispatchEvent(new Event('change')); }
};

window.excluirAluno = async function(id) {
    if (!confirm("⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR este aluno permanentemente?")) return;
    await supabaseClient.from('avisos').delete().eq('aluno_id', id);
    await supabaseClient.from('solicitacoes_documentos').delete().eq('aluno_id', id);
    const { error } = await supabaseClient.from('alunos').delete().eq('id', id);
    if (error) alert("Erro ao excluir aluno.");
    else { alert("Aluno excluído."); selectTurma.dispatchEvent(new Event('change')); }
};

// --- CÁLCULO DE MÉDIAS ---
function calcularMedias() {
    const mediasBimestrais = { b1: {}, b2: {}, b3: {}, b4: {} };
    const mediasFinais = {}; 
    
    MATERIAS.forEach(materia => {
        let somaMateria = 0;
        let countBimestres = 0;

        ['b1', 'b2', 'b3', 'b4'].forEach(bimestre => {
            let somaBim = 0;
            let countNotas = 0;

            for (let i = 1; i <= 3; i++) {
                const input = document.querySelector(`input[name="${bimestre}_${materia}_${i}"]`);
                if (input && input.value.trim() !== "") {
                    somaBim += parseFloat(input.value);
                    countNotas++;
                }
            }

            let mediaBim = countNotas > 0 ? (somaBim / countNotas) : 0;
            mediaBim = Math.ceil(mediaBim * 2) / 2; 
            mediasBimestrais[bimestre][materia] = mediaBim;

            const elBim = document.querySelector(`#mb${bimestre.slice(1)}_${materia}`);
            if (elBim) elBim.textContent = mediaBim > 0 ? formatarNota(mediaBim) : "--";

            if (mediaBim > 0) {
                somaMateria += mediaBim;
                countBimestres++;
            }
        });

        let mdf = countBimestres > 0 ? (somaMateria / countBimestres) : 0;
        mdf = Math.ceil(mdf * 2) / 2;
        mediasFinais[materia] = mdf;

        const elMdf = document.querySelector(`#ma_${materia}`);
        if (elMdf) elMdf.textContent = mdf > 0 ? formatarNota(mdf) : "--";
    });

    let somaTodasMaterias = 0;
    let countMaterias = 0;
    MATERIAS.forEach(m => {
        if (mediasFinais[m] > 0) {
            somaTodasMaterias += mediasFinais[m];
            countMaterias++;
        }
    });
    let mediaGeral = countMaterias > 0 ? (somaTodasMaterias / countMaterias) : 0;
    mediaGeral = Math.ceil(mediaGeral * 2) / 2;
    document.querySelector('#media_anual_texto').textContent = mediaGeral > 0 ? formatarNota(mediaGeral) : "--";

    return { mediasBimestrais, mediasFinais, mediaGeral };
}

document.querySelectorAll('.materias-grid-3notas input').forEach(input => {
    input.addEventListener('input', calcularMedias);
});

function abrirTelaNotas(aluno) {
    alunoSelecionadoId = aluno.id;
    nomeAlunoNota.textContent = `Notas de: ${aluno.nome}`;
    telaNotas.style.display = "block";
    formNotas.reset();
    
    MATERIAS.forEach(m => {
        document.querySelector(`#ma_${m}`).textContent = "--";
        ['1','2','3','4'].forEach(b => {
            const el = document.querySelector(`#mb${b}_${m}`);
            if(el) el.textContent = "--";
        });
    });
    document.querySelector('#media_anual_texto').textContent = "--";

    if (aluno.notas && Object.keys(aluno.notas).length > 0) {
        for (const bimestre in aluno.notas) {
            if (aluno.notas[bimestre]) {
                const notasMateria = aluno.notas[bimestre];
                MATERIAS.forEach(materia => {
                    const notas = notasMateria[materia];
                    if (notas) {
                        for (let i = 1; i <= 3; i++) {
                            const input = document.querySelector(`input[name="${bimestre}_${materia}_${i}"]`);
                            if (input && notas[`n${i}`]) {
                                input.value = notas[`n${i}`];
                            }
                        }
                    }
                });
            }
        }
        calcularMedias();
    }
    telaNotas.scrollIntoView({ behavior: 'smooth' });
}

btnCancelarNotas.addEventListener('click', () => {
    telaNotas.style.display = "none";
    alunoSelecionadoId = null;
});

formNotas.addEventListener('submit', async function(event) {
    event.preventDefault();
    if (!alunoSelecionadoId) return;

    const { mediasBimestrais, mediasFinais, mediaGeral } = calcularMedias();

    const dados = new FormData(formNotas);
    const notasObj = { b1: {}, b2: {}, b3: {}, b4: {} };

    MATERIAS.forEach(materia => {
        ['b1', 'b2', 'b3', 'b4'].forEach(b => {
            notasObj[b][materia] = {
                n1: Number(dados.get(`${b}_${materia}_1`)) || null,
                n2: Number(dados.get(`${b}_${materia}_2`)) || null,
                n3: Number(dados.get(`${b}_${materia}_3`)) || null
            };
        });
    });

    const colunasParaSalvar = { notas: notasObj };
    
    MATERIAS.forEach(materia => {
        ['b1', 'b2', 'b3', 'b4'].forEach(b => {
            const valor = mediasBimestrais[b][materia];
            // AQUI: Salva com o nome exato que está na imagem (b1_portugues)
            colunasParaSalvar[`${b}_${materia}`] = valor > 0 ? valor : null;
        });
        
        const mdf = mediasFinais[materia];
        colunasParaSalvar[`mdf_${materia}`] = mdf > 0 ? mdf : null;
    });

    const { error } = await supabaseClient
        .from('alunos')
        .update(colunasParaSalvar)
        .eq('id', alunoSelecionadoId);

    if (error) { 
        console.error(error); 
        alert("Erro ao salvar as notas."); 
        return; 
    }

    alert("Notas e médias salvas com sucesso!");
    telaNotas.style.display = "none";
    selectTurma.dispatchEvent(new Event('change'));
});