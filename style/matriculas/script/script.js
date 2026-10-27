// --- CONTROLE DE ETAPAS DO FORMULÁRIO ---
const etapa1 = document.querySelector('.etapa1');
const etapa2 = document.querySelector('.etapa2');
const btnproximo = document.querySelector('#btnProximo');
const btnvoltar = document.querySelector('#btnVoltar');
const btnfinalizar = document.querySelector('#btnFinalizar');
const formulario = document.querySelector("#formulario");

// --- CONFIGURAÇÃO DO SUPABASE ---
const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;

const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
};
document.head.appendChild(scriptSupabase);

function proximo(){
    if (!etapa1 || !etapa2) return;
    etapa1.style.display = 'none';
    etapa2.style.display = 'block';
    if (btnproximo) btnproximo.style.display = 'none';
    if (btnfinalizar) btnfinalizar.style.display = 'block';
    if (btnvoltar) btnvoltar.style.display = 'block';
}

function voltar(){
    if (!etapa1 || !etapa2) return;
    etapa1.style.display = 'block';
    etapa2.style.display = 'none';
    if (btnproximo) btnproximo.style.display = 'block';
    if (btnfinalizar) btnfinalizar.style.display = 'none';
    if (btnvoltar) btnvoltar.style.display = 'none';
}

window.proximo = proximo;
window.voltar = voltar;

// --- GERA NÚMERO DE MATRÍCULA AUTOMÁTICO (CORRIGIDO) ---
async function gerarNumeroMatricula() {
    if (!supabaseClient) return `${new Date().getFullYear()}0001`;

    const anoAtual = new Date().getFullYear();

    // Busca o MAIOR número de matrícula que começa com o ano atual
    // O 'order' descendente + 'limit(1)' garante que pegamos o último
    const { data, error } = await supabaseClient
        .from('alunos')
        .select('numero_matricula')
        .like('numero_matricula', `${anoAtual}%`) // Filtra apenas do ano atual
        .order('numero_matricula', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Erro ao buscar última matrícula:", error);
        // Fallback: tenta gerar um número baseado no timestamp para não travar
        return `${anoAtual}${Date.now().toString().slice(-4)}`;
    }

    // Se não houver nenhum aluno no ano atual, começa do 0001
    if (!data || data.length === 0) {
        return `${anoAtual}0001`;
    }

    const ultimaMatricula = data[0].numero_matricula;

    // Verifica se a última matrícula é válida e do ano atual
    if (!ultimaMatricula || typeof ultimaMatricula !== 'string' || !ultimaMatricula.startsWith(anoAtual.toString())) {
        return `${anoAtual}0001`;
    }

    // Extrai a parte numérica e incrementa
    try {
        const ultimoNumero = parseInt(ultimaMatricula.slice(-4), 10);
        if (isNaN(ultimoNumero)) return `${anoAtual}0001`;
        
        const novoNumero = (ultimoNumero + 1).toString().padStart(4, '0');
        return `${anoAtual}${novoNumero}`;
    } catch (e) {
        console.error("Erro ao parsear matrícula:", e);
        return `${anoAtual}0001`;
    }
}

// --- FINALIZAR MATRÍCULA ---
if (formulario) {
    formulario.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!supabaseClient) {
            alert("Aguarde, o sistema está conectando ao banco de dados...");
            return;
        }

        const dados = new FormData(formulario);
        const matricula = Object.fromEntries(dados);

        if (btnfinalizar) {
            btnfinalizar.disabled = true;
            btnfinalizar.textContent = "Gerando matrícula...";
        }

        const numeroMatriculaGerado = await gerarNumeroMatricula();

        const tipoResponsavel = matricula.responsavel || '';
        const responsavelOutro = tipoResponsavel === 'outro'
            ? (matricula['responsavel-outro'] || '').trim()
            : null;

        const cpfPai = (matricula['cpf-pai'] || '').trim();
        const cpfMae = (matricula['cpf-mae'] || '').trim();

        const novoAluno = {
            numero_matricula: numeroMatriculaGerado,
            nome: matricula.nome,
            data_nascimento: matricula['data-nascimento'] || null,
            sexo: matricula.sexo,
            nacionalidade: matricula.nacionalidade,
            cidade_nascimento: matricula['cidade-nascimento'],
            endereco: matricula.endereco,
            bairro: matricula.bairro,
            numero_endereco: matricula['numero-endereco'],
            cidade: matricula.cidade,
            estado: matricula.estado,
            cep: matricula.cep,
            cpf: matricula.cpf,
            rg: matricula.rg,
            niss: matricula.niss,
            turma: matricula.turma,
            observacao: matricula.observacao,

            nome_pai: matricula['nome-pai'],
            profissao_pai: matricula['profissao-pai'],
            identidade_pai: matricula['identidade-pai'],
            cpf_pai: cpfPai || null,
            whatsapp_pai: matricula['whatsapp-pai'],
            telefone_pai: matricula['telefone-pai'],

            nome_mae: matricula['nome-mae'],
            profissao_mae: matricula['profissao-mae'],
            identidade_mae: matricula['identidade-mae'],
            cpf_mae: cpfMae || null,
            whatsapp_mae: matricula['whatsapp-mae'],
            telefone_mae: matricula['telefone-mae'],

            responsavel: tipoResponsavel,
            responsavel_outro: responsavelOutro,

            status: 'Ativa',
            notas: {}
        };

        if (btnfinalizar) btnfinalizar.textContent = "Salvando dados...";

        const { data, error } = await supabaseClient
            .from('alunos')
            .insert([novoAluno]);

        if (btnfinalizar) {
            btnfinalizar.disabled = false;
            btnfinalizar.textContent = "Finalizar matrícula";
        }

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            alert("Erro ao finalizar a matrícula: \n" + error.message);
            return;
        }

        formulario.reset();
        voltar();
        alert(`Matrícula finalizada com sucesso!\nO número de matrícula do aluno é: ${numeroMatriculaGerado}`);
    });
}