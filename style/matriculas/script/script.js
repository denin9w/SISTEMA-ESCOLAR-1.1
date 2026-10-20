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
    etapa1.style.display = 'none';
    etapa2.style.display = 'block';
    btnproximo.style.display = 'none';
    btnfinalizar.style.display = 'block';
    btnvoltar.style.display = 'block';
}

function voltar(){
    etapa1.style.display = 'block';
    etapa2.style.display = 'none';
    btnproximo.style.display = 'block';
    btnfinalizar.style.display = 'none';
    btnvoltar.style.display = 'none';
}

// --- FUNÇÃO PARA GERAR O NÚMERO DE MATRÍCULA AUTOMÁTICO ---
async function gerarNumeroMatricula() {
    const anoAtual = new Date().getFullYear();
    
    const { data, error } = await supabaseClient
        .from('alunos')
        .select('numero_matricula')
        .order('numero_matricula', { ascending: false })
        .limit(1);

    if (error || !data || data.length === 0) {
        return `${anoAtual}0001`;
    }

    const ultimaMatricula = data[0].numero_matricula;
    
    if (!ultimaMatricula || !ultimaMatricula.startsWith(anoAtual.toString())) {
        return `${anoAtual}0001`;
    }

    const ultimoNumero = parseInt(ultimaMatricula.slice(-4));
    const novoNumero = (ultimoNumero + 1).toString().padStart(4, '0');
    
    return `${anoAtual}${novoNumero}`;
}

// --- FINALIZAR MATRÍCULA E SALVAR NO SUPABASE ---
if (formulario) {
    formulario.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!supabaseClient) {
            alert("Aguarde, o sistema está conectando ao banco de dados...");
            return;
        }

        const dados = new FormData(formulario);
        const matricula = Object.fromEntries(dados);

        btnfinalizar.disabled = true;
        btnfinalizar.textContent = "Gerando matrícula...";

        const numeroMatriculaGerado = await gerarNumeroMatricula();

        // Monta o objeto com TODOS os dados (Mapeamento EXATO com o HTML)
        const novoAluno = {
            numero_matricula: numeroMatriculaGerado,
            nome: matricula.nome,
            data_nascimento: matricula['data-nascimento'] || null,
            sexo: matricula.sexo,
            nacionalidade: matricula.nacionalidade,
            cidade_nascimento: matricula['cidade-nascimento'],
            endereco: matricula.endereco,
            bairro: matricula.bairro,
            numero_endereco: matricula['numero-endereco'], // AQUI FOI CORRIGIDO PARA FICAR IGUAL AO HTML
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
            cpf_pai: matricula['cpf-pai'],
            whatsapp_pai: matricula['whatsapp-pai'],
            telefone_pai: matricula['telefone-pai'],
            
            nome_mae: matricula['nome-mae'],
            profissao_mae: matricula['profissao-mae'],
            identidade_mae: matricula['identidade-mae'],
            cpf_mae: matricula['cpf-mae'],
            whatsapp_mae: matricula['whatsapp-mae'],
            telefone_mae: matricula['telefone-mae'],
            
            responsavel: matricula.responsavel,
            responsavel_outro: matricula['responsavel-outro'],
            
            status: 'Ativa',
            notas: {}
        };

        btnfinalizar.textContent = "Salvando dados...";

        const { data, error } = await supabaseClient
            .from('alunos')
            .insert([novoAluno]);

        btnfinalizar.disabled = false;
        btnfinalizar.textContent = "Finalizar matrícula";

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