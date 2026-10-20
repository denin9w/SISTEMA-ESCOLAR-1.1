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

// Elementos do Modal de Adicionar
const modalAddAluno = document.querySelector('#modalAddAluno');
const formAddAluno = document.querySelector('#formAddAluno');
const btnFecharModal = document.querySelector('#btnFecharModal');

let professorLogado = null;
let alunoSelecionadoId = null;

function iniciarSistema() {
    const profString = localStorage.getItem("@professorLogado");
    if (!profString) {
        alert("Sessão expirada.");
        window.location.href = "login.htm";
        return;
    }

    professorLogado = JSON.parse(profString);
    document.querySelector('#nomeProfessorLogado').textContent = `Prof. ${professorLogado.nome}`;

    selectTurma.innerHTML = '<option value="" selected disabled>Selecione uma turma</option>';
    if (professorLogado.turmas && professorLogado.turmas.length > 0) {
        professorLogado.turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma;
            option.textContent = turma.toUpperCase();
            selectTurma.appendChild(option);
        });
    }
}

// --- CARREGAR ALUNOS DA TURMA ---
selectTurma.addEventListener('change', async function() {
    const turmaSelecionada = selectTurma.value;
    listaAlunosDiv.style.display = "block";
    listaAlunosDiv.innerHTML = "<p>Carregando alunos...</p>";

    const { data: alunos, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, numero_matricula, notas, status')
        .eq('turma', turmaSelecionada)
        .eq('status', 'Ativa') 
        .order('nome', { ascending: true });

    if (error) return console.error(error);

    listaAlunosDiv.innerHTML = "";
    
    if (alunos.length === 0) {
        listaAlunosDiv.innerHTML = "<p>Nenhum aluno ativo nesta turma.</p>";
    } else {
        alunos.forEach(aluno => {
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('aluno-item');

            const btnNome = document.createElement('button');
            btnNome.classList.add('btn-nome-aluno');
            btnNome.textContent = `${aluno.nome} (Mat: ${aluno.numero_matricula || 'Sem Matrícula'})`;
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

    // ADICIONA O BOTÃO DE ADICIONAR ALUNO NO FINAL DA LISTA
    const btnAdd = document.createElement('button');
    btnAdd.classList.add('btn-add-aluno');
    btnAdd.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Novo Aluno';
    btnAdd.addEventListener('click', () => {
        modalAddAluno.style.display = "flex";
        document.querySelector('#addNome').focus();
    });
    listaAlunosDiv.appendChild(btnAdd);
});

// --- LÓGICA DO MODAL DE ADICIONAR ALUNO ---
btnFecharModal.addEventListener('click', () => {
    modalAddAluno.style.display = "none";
    formAddAluno.reset();
});

formAddAluno.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.querySelector('#addNome').value.trim();
    const dataNasc = document.querySelector('#addData').value;
    const cpfResp = document.querySelector('#addCpfResp').value.trim();
    const turmaSelecionada = selectTurma.value;

    if (!turmaSelecionada) {
        alert("Selecione uma turma primeiro.");
        return;
    }

    // Gera um número de matrícula provisório
    const anoAtual = new Date().getFullYear();
    const numProvisorio = `PROV-${anoAtual}-${Math.floor(Math.random() * 10000)}`;

    // Salva o aluno no banco
    const { data, error } = await supabaseClient.from('alunos').insert([{
        nome: nome,
        data_nascimento: dataNasc,
        cpf_pai: cpfResp, // Colocamos o CPF no campo do pai provisoriamente para permitir o login do responsável
        turma: turmaSelecionada,
        status: 'Ativa',
        numero_matricula: numProvisorio,
        notas: {}
    }]).select();

    if (error) {
        console.error("Erro ao adicionar aluno:", error);
        alert("Erro ao adicionar aluno.");
        return;
    }

    const novoAlunoId = data[0].id;

    // Cria o aviso para o Gestor
    await supabaseClient.from('avisos').insert([{
        tipo: 'Aluno Incompleto',
        mensagem: `O professor adicionou o aluno "${nome}" na turma ${turmaSelecionada.toUpperCase()}. Faltam dados cadastrais.`,
        aluno_id: novoAlunoId,
        lido: false
    }]);

    alert("Aluno adicionado com sucesso! O Gestor foi notificado.");
    modalAddAluno.style.display = "none";
    formAddAluno.reset();
    selectTurma.dispatchEvent(new Event('change')); // Recarrega a lista
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
    else {
        alert(`Aluno marcado como ${novoStatus}!`);
        selectTurma.dispatchEvent(new Event('change'));
    }
};

window.excluirAluno = async function(id) {
    if (!confirm("⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR este aluno permanentemente?")) return;

    // Exclui os avisos relacionados e depois o aluno
    await supabaseClient.from('avisos').delete().eq('aluno_id', id);
    const { error } = await supabaseClient.from('alunos').delete().eq('id', id);
    
    if (error) alert("Erro ao excluir aluno.");
    else {
        alert("Aluno excluído.");
        selectTurma.dispatchEvent(new Event('change'));
    }
};

// --- CÁLCULO DE MÉDIAS E SALVAMENTO DE NOTAS (Mantidos) ---
function calcularMediaBimestre(bimestre) {
    let notas = [];
    for (let i = 1; i <= 3; i++) {
        let valor = parseFloat(document.querySelector(`#n${i}_${bimestre}`).value);
        if (!isNaN(valor)) notas.push(valor);
    }
    if (notas.length === 0) return 0;
    let soma = notas.reduce((acc, nota) => acc + nota, 0);
    return Math.ceil((soma / notas.length) * 2) / 2;
}

['b1', 'b2', 'b3', 'b4'].forEach(bimestre => {
    for (let i = 1; i <= 3; i++) {
        document.querySelector(`#n${i}_${bimestre}`).addEventListener('input', function() {
            const media = calcularMediaBimestre(bimestre);
            const textoMedia = media % 1 === 0 ? media.toFixed(0) : media.toFixed(1);
            document.querySelector(`#media_${bimestre}`).textContent = `Média ${bimestre.toUpperCase()}: ${textoMedia}`;
            atualizarMediaAnualTela();
        });
    }
});

function atualizarMediaAnualTela() {
    let mediasBim = [];
    ['b1', 'b2', 'b3', 'b4'].forEach(bimestre => {
        const media = calcularMediaBimestre(bimestre);
        if (media > 0) mediasBim.push(media);
    });
    let mediaAnual = 0;
    if (mediasBim.length > 0) {
        let soma = mediasBim.reduce((acc, m) => acc + m, 0);
        mediaAnual = Math.ceil((soma / mediasBim.length) * 2) / 2;
    }
    const textoAnual = mediaAnual > 0 ? (mediaAnual % 1 === 0 ? mediaAnual.toFixed(0) : mediaAnual.toFixed(1)) : "--";
    document.querySelector('#media_anual_texto').textContent = textoAnual;
}

function abrirTelaNotas(aluno) {
    alunoSelecionadoId = aluno.id;
    nomeAlunoNota.textContent = `Notas de: ${aluno.nome}`;
    telaNotas.style.display = "block";
    formNotas.reset();
    ['b1', 'b2', 'b3', 'b4'].forEach(b => document.querySelector(`#media_${b}`).textContent = `Média ${b.toUpperCase()}: --`);
    document.querySelector('#media_anual_texto').textContent = "--";

    if (aluno.notas && Object.keys(aluno.notas).length > 0) {
        for (const bimestre in aluno.notas) {
            if (aluno.notas[bimestre]) {
                const notas = aluno.notas[bimestre];
                if (notas.n1) document.querySelector(`#n1_${bimestre}`).value = notas.n1;
                if (notas.n2) document.querySelector(`#n2_${bimestre}`).value = notas.n2;
                if (notas.n3) document.querySelector(`#n3_${bimestre}`).value = notas.n3;
            }
        }
        ['b1', 'b2', 'b3', 'b4'].forEach(b => {
            const media = calcularMediaBimestre(b);
            if(media > 0) {
                const textoMedia = media % 1 === 0 ? media.toFixed(0) : media.toFixed(1);
                document.querySelector(`#media_${b}`).textContent = `Média ${b.toUpperCase()}: ${textoMedia}`;
            }
        });
        atualizarMediaAnualTela();
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

    const m_b1 = calcularMediaBimestre('b1');
    const m_b2 = calcularMediaBimestre('b2');
    const m_b3 = calcularMediaBimestre('b3');
    const m_b4 = calcularMediaBimestre('b4');
    let medias = [m_b1, m_b2, m_b3, m_b4].filter(m => m > 0);
    let media_anual = 0;
    if (medias.length > 0) {
        let soma = medias.reduce((a, b) => a + b, 0);
        media_anual = Math.ceil((soma / medias.length) * 2) / 2;
    }

    const dados = new FormData(formNotas);
    const notasObj = {
        b1: { n1: Number(dados.get('n1_b1')), n2: Number(dados.get('n2_b1')), n3: Number(dados.get('n3_b1')) },
        b2: { n1: Number(dados.get('n1_b2')), n2: Number(dados.get('n2_b2')), n3: Number(dados.get('n3_b2')) },
        b3: { n1: Number(dados.get('n1_b3')), n2: Number(dados.get('n2_b3')), n3: Number(dados.get('n3_b3')) },
        b4: { n1: Number(dados.get('n1_b4')), n2: Number(dados.get('n2_b4')), n3: Number(dados.get('n3_b4')) }
    };

    const { error } = await supabaseClient.from('alunos').update({ notas: notasObj, media_b1: m_b1, media_b2: m_b2, media_b3: m_b3, media_b4: m_b4, media_anual: media_anual }).eq('id', alunoSelecionadoId);

    if (error) alert("Erro ao salvar as notas.");
    else {
        alert("Notas salvas!");
        telaNotas.style.display = "none";
        selectTurma.dispatchEvent(new Event('change'));
    }
});