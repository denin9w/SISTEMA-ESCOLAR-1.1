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
        alert("Digite o CPF / Senha de acesso.");
        return;
    }

    if (!supabaseClient) {
        alert("Aguarde, o sistema está conectando ao banco de dados...");
        return;
    }

    input_b.disabled = true;
    input_b.textContent = "Verificando...";

    try {
        if (tipoSelecionado === "responsavel") {
            // Busca na tabela alunos se o CPF bate com o pai, mãe ou responsável
            const { data, error } = await supabaseClient
                .from('alunos')
                .select('id, nome')
                .or(`cpf_pai.eq.${cpfDigitado},cpf_mae.eq.${cpfDigitado},responsavel_outro.eq.${cpfDigitado}`)
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                localStorage.setItem("@alunoLogadoId", data[0].id);
                localStorage.setItem("@alunoLogadoNome", data[0].nome);
                window.location.href = PAGINAS[tipoSelecionado];
            } else {
                alert("CPF de responsável não encontrado. Verifique o número digitado.");
            }

        } else {
            // Busca na tabela usuarios (professor ou gestor)
            const { data, error } = await supabaseClient
                .from('usuarios')
                .select('*')
                .eq('cpf_senha', cpfDigitado)
                .eq('tipo', tipoSelecionado)
                .limit(1);

            if (error) throw error;

            if (data && data.length > 0) {
                // SALVA OS DADOS COM O NOME EXATO QUE O OUTRO SCRIPT PROCURA
                if (tipoSelecionado === 'professor') {
                    localStorage.setItem("@professorLogado", JSON.stringify(data[0]));
                } else if (tipoSelecionado === 'gestor') {
                    localStorage.setItem("@gestorLogado", JSON.stringify(data[0]));
                }
                window.location.href = PAGINAS[tipoSelecionado];
            } else {
                alert(`Acesso de ${tipoSelecionado} negado. CPF/Senha incorretos.`);
            }
        }
    } catch (erro) {
        console.error("Erro no login:", erro);
        alert("Ocorreu um erro ao tentar logar. Tente novamente.");
    } finally {
        input_b.disabled = false;
        input_b.textContent = "Entrar";
    }
}

if(input_b) input_b.addEventListener("click", entrar);

if(input) input.addEventListener("keydown", function (evento){
    if (evento.key === "Enter"){
        entrar();
    }
});