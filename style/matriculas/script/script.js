// --- script matriculas ---
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

        // --- VALIDAÇÃO DA DATA DE NASCIMENTO ---
        if (!matricula['data-nascimento'] || matricula['data-nascimento'].trim() === '') {
            alert("⚠️ Por favor, preencha a Data de Nascimento do aluno antes de finalizar.");
            return; // Para o envio aqui
        }

        // --- VALIDAÇÃO DE CPF AQUI ---
        const cpfPaiInput = matricula['cpf-pai'] || '';
        const cpfMaeInput = matricula['cpf-mae'] || '';

        const cpfPaiLimpo = cpfPaiInput.replace(/\D/g, '');
        const cpfMaeLimpo = cpfMaeInput.replace(/\D/g, '');

        if (cpfPaiLimpo && cpfPaiLimpo.length !== 11) {
            alert("O CPF do Pai precisa ter exatamente 11 números.");
            return;
        }
        if (cpfMaeLimpo && cpfMaeLimpo.length !== 11) {
            alert("O CPF da Mãe precisa ter exatamente 11 números.");
            return;
        }
        // --- FIM DA VALIDAÇÃO ---

        if (btnfinalizar) {
            btnfinalizar.disabled = true;
            btnfinalizar.textContent = "Salvando dados...";
        }

        const tipoResponsavel = matricula.responsavel || '';
        const responsavelOutro = tipoResponsavel === 'outro'
            ? (matricula['responsavel-outro'] || '').trim()
            : null;

        const cpfPai = (matricula['cpf-pai'] || '').trim();
        const cpfMae = (matricula['cpf-mae'] || '').trim();

        // Monta o objeto do aluno
        const novoAluno = {
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

            status: 'Pendente',
            autorizado: false,
            notas: {}
        };

        // --- CRIA AS CONTAS DO PAI E DA MÃE NO AUTH ---

        // 1. Cria a conta para o Pai (se preenchido)
        if (cpfPaiLimpo) {
            const emailPai = `${cpfPaiLimpo}@ceje.local`;
            const senhaPai = cpfPaiLimpo;
            
            const { data: authPai, error: errPai } = await supabaseClient.auth.signUp({
                email: emailPai,
                password: senhaPai,
            });
            
            if (authPai && authPai.user) {
                novoAluno.auth_id = authPai.user.id; 
            } else if (errPai && (errPai.message.includes("already registered") || errPai.message.includes("User already exists"))) {
                const { data: loginPai } = await supabaseClient.auth.signInWithPassword({
                    email: emailPai,
                    password: senhaPai,
                });
                if (loginPai && loginPai.user) novoAluno.auth_id = loginPai.user.id;
            }
        }

        // 2. Cria a conta para a Mãe (se preenchido)
        if (cpfMaeLimpo) {
            const emailMae = `${cpfMaeLimpo}@ceje.local`;
            const senhaMae = cpfMaeLimpo;
            
            const { data: authMae, error: errMae } = await supabaseClient.auth.signUp({
                email: emailMae,
                password: senhaMae,
            });
            
            if (authMae && authMae.user) {
                novoAluno.auth_id_mae = authMae.user.id; 
            } else if (errMae && (errMae.message.includes("already registered") || errMae.message.includes("User already exists"))) {
                const { data: loginMae } = await supabaseClient.auth.signInWithPassword({
                    email: emailMae,
                    password: senhaMae,
                });
                if (loginMae && loginMae.user) novoAluno.auth_id_mae = loginMae.user.id;
            }
        }

        // --- SALVA O ALUNO (BANCO GERA MATRÍCULA) ---
        const { data: alunoInserido, error } = await supabaseClient
            .from('alunos')
            .insert([novoAluno])
            .select();

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
        
        // --- MOSTRA O MODAL DE SUCESSO ---
        const modal = document.getElementById('modalSucessoMatricula');
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('btnFecharModalSucesso').onclick = () => {
                modal.style.display = 'none';
            };
        } else {
            alert("Matrícula enviada com sucesso! Aguarde a aprovação do gestor.");
        }
    });
}