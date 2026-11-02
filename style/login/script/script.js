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

// --- ELEMENTOS DA TELA ---
let responsavelElement = document.querySelector("#responsavel");
let professorElement = document.querySelector("#professor");
let gestorElement = document.querySelector("#gestor");

let input = document.querySelector("#usuario");
let input_b = document.querySelector(".input-b");

const PAGINAS = {
    responsavel: "loginresponsavel.htm",
    professor: "login-professores.htm",
    gestor: "login-gestor.htm",
};

let tipoSelecionado = "responsavel";

// --- LÓGICA DAS ABAS ---
function selecionar(tipo, elemento){
    tipoSelecionado = tipo;
    [responsavelElement, professorElement, gestorElement].forEach(function (aba){
        if(aba) aba.classList.remove("ativa");
    });
    if(elemento) elemento.classList.add("ativa");
}

if (responsavelElement) responsavelElement.addEventListener("click", function (){ selecionar("responsavel", responsavelElement); });
if (professorElement) professorElement.addEventListener("click", function (){ selecionar("professor", professorElement); });
if (gestorElement) gestorElement.addEventListener("click", function (){ selecionar("gestor", gestorElement); });


// --- LÓGICA DE ENTRAR ---
async function entrar(){
    const cpfDigitado = input.value.trim();

    if (cpfDigitado === ""){
        alert("Digite o CPF.");
        return;
    }

    if (!supabaseClient) {
        alert("Aguarde, o sistema está conectando...");
        return;
    }

    input_b.disabled = true;
    input_b.textContent = "Verificando...";

    try {
        const emailAuth = `${cpfDigitado.replace(/\D/g, '')}@ceje.local`;
        const senhaAuth = cpfDigitado.replace(/\D/g, '');

        // 1) Faz login no Supabase Auth
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
            email: emailAuth,
            password: senhaAuth,
        });

        if (authError) {
            alert("CPF ou senha incorretos.");
            return;
        }

        // 2) Lógica para Responsável
        if (tipoSelecionado === "responsavel") {
            const { data: alunos, error: alunoError } = await supabaseClient
                .from('alunos')
                .select('id, nome, status')
                .eq('auth_id', authData.user.id)
                .limit(1);

            if (alunoError) throw alunoError;

            if (alunos && alunos.length > 0) {
                const aluno = alunos[0];
                if (aluno.status && aluno.status !== 'Ativa') {
                    alert(`Acesso indisponível: aluno "${aluno.status}".`);
                    await supabaseClient.auth.signOut();
                    return;
                }
                sessionStorage.setItem("@alunoLogadoId", aluno.id);
                sessionStorage.setItem("@alunoLogadoNome", aluno.nome);
                window.location.href = PAGINAS[tipoSelecionado];
            } else {
                alert("Nenhum aluno encontrado para este responsável.");
                await supabaseClient.auth.signOut();
            }
        
        // 3) Lógica para Professor/Gestor
        } else {
            const { data: usuarios, error: userError } = await supabaseClient
                .from('usuarios')
                .select('*')
                .eq('auth_id', authData.user.id)
                .eq('tipo', tipoSelecionado)
                .limit(1);

            if (userError) throw userError;

            if (usuarios && usuarios.length > 0) {
                const usuario = usuarios[0];

                if (tipoSelecionado === 'professor' && !usuario.autorizado) {
                    alert("Cadastro de professor aguardando autorização.");
                    await supabaseClient.auth.signOut();
                    return;
                }

                if (tipoSelecionado === 'professor') {
                    sessionStorage.setItem("@professorLogado", JSON.stringify(usuario));
                } else if (tipoSelecionado === 'gestor') {
                    sessionStorage.setItem("@gestorLogado", JSON.stringify(usuario));
                }
                window.location.href = PAGINAS[tipoSelecionado];
            } else {
                alert(`Usuário não encontrado na base de ${tipoSelecionado}.`);
                await supabaseClient.auth.signOut();
            }
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Ocorreu um erro ao logar. Verifique o console.");
    } finally {
        input_b.disabled = false;
        input_b.textContent = "Entrar";
    }
}

if(input_b) input_b.addEventListener("click", entrar);
if(input) input.addEventListener("keydown", function (evento){
    if (evento.key === "Enter"){ entrar(); }
});