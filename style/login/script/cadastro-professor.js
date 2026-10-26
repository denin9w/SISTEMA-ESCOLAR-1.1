// ============================================================
// cadastro-professor.js
// ============================================================

const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
};
document.head.appendChild(scriptSupabase);

// --- TURMAS PADRONIZADAS ---
const TURMAS = [
    { v: 'infantil-I-a',  l: 'Infantil I A' },
    { v: 'infantil-I-b',  l: 'Infantil I B' },
    { v: 'infantil-II-a', l: 'Infantil II A' },
    { v: 'infantil-II-b', l: 'Infantil II B' },
    { v: 'infantil-III-a',l: 'Infantil III A' },
    { v: 'infantil-III-b',l: 'Infantil III B' },
    { v: '1ano-a', l: '1º Ano A' }, { v: '1ano-b', l: '1º Ano B' },
    { v: '2ano-a', l: '2º Ano A' }, { v: '2ano-b', l: '2º Ano B' },
    { v: '3ano-a', l: '3º Ano A' }, { v: '3ano-b', l: '3º Ano B' },
    { v: '4ano-a', l: '4º Ano A' }, { v: '4ano-b', l: '4º Ano B' },
    { v: '5ano-a', l: '5º Ano A' }, { v: '5ano-b', l: '5º Ano B' },
    { v: '6ano-a', l: '6º Ano A' },
    { v: '7ano-a', l: '7º Ano A' },
    { v: '8ano-a', l: '8º Ano A' },
    { v: '9ano-a', l: '9º Ano A' }
];

// --- RENDER CHECKBOXES ---
const grid = document.querySelector('#turmasGrid');
if (grid) {
    TURMAS.forEach(t => {
        const lbl = document.createElement('label');
        const cb  = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = t.v;
        cb.name = 'turmas';
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(t.l));
        grid.appendChild(lbl);
    });
}

// --- ENVIO ---
const form = document.querySelector('#formCadastroProf');
const btn  = document.querySelector('#btnCadastrar');
const msgErro = document.querySelector('#msgErro');

function mostrarErro(txt) {
    if (!msgErro) { alert(txt); return; }
    msgErro.textContent = txt;
    msgErro.style.display = 'block';
}

function esconderErro() {
    if (msgErro) { msgErro.textContent = ''; msgErro.style.display = 'none'; }
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        esconderErro();

        if (!supabaseClient) {
            mostrarErro("Aguarde, o sistema está conectando...");
            return;
        }

        const nome  = document.querySelector('#nomeProf').value.trim();
        const cpf   = document.querySelector('#cpfProf').value.trim();
        const email = document.querySelector('#emailProf').value.trim();
        const tel   = document.querySelector('#telProf').value.trim();

        const turmasSelecionadas = Array.from(
            document.querySelectorAll('input[name="turmas"]:checked')
        ).map(cb => cb.value);

        if (!nome)              { mostrarErro("Informe o nome."); return; }
        if (!cpf)               { mostrarErro("Informe o CPF."); return; }
        if (turmasSelecionadas.length === 0) {
            mostrarErro("Selecione pelo menos uma turma.");
            return;
        }

        btn.disabled = true;
        btn.textContent = "Verificando CPF...";

        try {
            // 1) Verifica CPF duplicado (professor ou gestor)
            const { data: existentes, error: errBusca } = await supabaseClient
                .from('usuarios')
                .select('id, tipo')
                .eq('cpf_senha', cpf)
                .limit(1);

            if (errBusca) throw errBusca;

            if (existentes && existentes.length > 0) {
                mostrarErro("Este CPF já está cadastrado no sistema.");
                btn.disabled = false;
                btn.textContent = "Cadastrar";
                return;
            }

            btn.textContent = "Cadastrando...";

            // 2) Insere professor com autorizado=false
            const { data: novo, error: errInsert } = await supabaseClient
                .from('usuarios')
                .insert([{
                    nome,
                    cpf_senha: cpf,
                    tipo: 'professor',
                    turmas: turmasSelecionadas,
                    email: email || null,
                    telefone: tel || null,
                    autorizado: false
                }])
                .select()
                .single();

            if (errInsert) throw errInsert;

            // 3) Aviso para o gestor
            await supabaseClient.from('avisos').insert([{
                tipo: 'Professor Pendente',
                mensagem: `Novo cadastro de professor: "${nome}" (CPF ${cpf}). Aguardando autorização.`,
                usuario_id: novo.id,
                lido: false
            }]);

            btn.textContent = "Cadastrado!";
            alert("Cadastro enviado! O gestor irá autorizar seu acesso. Você será redirecionado ao login.");
            setTimeout(() => { window.location.href = "login.htm"; }, 1500);

        } catch (err) {
            console.error(err);
            mostrarErro("Erro ao cadastrar: " + (err.message || "tente novamente."));
            btn.disabled = false;
            btn.textContent = "Cadastrar";
        }
    });
}