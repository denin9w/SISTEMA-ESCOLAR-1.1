// --- script matriculas ---

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

// ============================================================
// CONTROLE DE ETAPAS (NOVO)
// ============================================================
const etapas = document.querySelectorAll('.etapa');
const btnProximo = document.getElementById('btnProximo');
const btnVoltar = document.getElementById('btnVoltar');
const btnFinalizar = document.getElementById('btnFinalizar');
const indicadorEtapa = document.getElementById('indicadorEtapa');
const barraProgressoFill = document.getElementById('barraProgressoFill');
const formulario = document.querySelector("#formulario");

let etapaAtual = 0;

function atualizarInterface() {
    if (etapas.length === 0) return;

    // Mostra apenas a etapa atual
    etapas.forEach((etapa, index) => {
        etapa.classList.toggle('ativa', index === etapaAtual);
    });

    // Atualiza o texto e a barra de progresso
    if (indicadorEtapa) indicadorEtapa.textContent = `Etapa ${etapaAtual + 1} de ${etapas.length}`;
    if (barraProgressoFill) barraProgressoFill.style.width = `${((etapaAtual + 1) / etapas.length) * 100}%`;

    // Mostra/Esconde os botões corretos
    if (btnVoltar) btnVoltar.style.display = etapaAtual === 0 ? 'none' : 'block';
    
    if (etapaAtual === etapas.length - 1) {
        if (btnProximo) btnProximo.style.display = 'none';
        if (btnFinalizar) btnFinalizar.style.display = 'block';
    } else {
        if (btnProximo) btnProximo.style.display = 'block';
        if (btnFinalizar) btnFinalizar.style.display = 'none';
    }
}

if (btnProximo) {
    btnProximo.addEventListener('click', () => {
        // Validação dos campos obrigatórios da etapa atual
        const camposObrigatorios = etapas[etapaAtual].querySelectorAll('[required]');
        let formValido = true;
        
        camposObrigatorios.forEach(campo => {
            if (!campo.value || (campo.type === 'radio' && !document.querySelector(`input[name="${campo.name}"]:checked`))) {
                formValido = false;
                campo.style.borderColor = 'red';
            } else {
                campo.style.borderColor = '#ccc';
            }
        });

        if (!formValido) {
            alert("⚠️ Por favor, preencha todos os campos obrigatórios desta etapa.");
            return;
        }

        if (etapaAtual < etapas.length - 1) {
            etapaAtual++;
            atualizarInterface();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo ao mudar de etapa
        }
    });
}

if (btnVoltar) {
    btnVoltar.addEventListener('click', () => {
        if (etapaAtual > 0) {
            etapaAtual--;
            atualizarInterface();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Inicializa a primeira etapa ao carregar
if (etapas.length > 0) {
    atualizarInterface();
}

// ============================================================
// ENVIO DO FORMULÁRIO (MANTIDO DO ORIGINAL E BLINDADO)
// ============================================================
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
            return;
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

        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.textContent = "Salvando dados...";
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

        if (btnFinalizar) {
            btnFinalizar.disabled = false;
            btnFinalizar.textContent = "Finalizar matrícula";
        }

        if (error) {
            console.error("Erro ao salvar no Supabase:", error);
            alert("Erro ao finalizar a matrícula: \n" + error.message);
            return;
        }

        formulario.reset();
        
        // Volta para a primeira etapa após salvar
        etapaAtual = 0;
        atualizarInterface();
        
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