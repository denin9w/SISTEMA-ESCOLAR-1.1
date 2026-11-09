// --- scriptResponsavel.js ---
const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabaseClient = supabaseClient;
    verificarStatusAluno();
};
document.head.appendChild(scriptSupabase);

const alunoId = sessionStorage.getItem("@alunoLogadoId");
const alunoNome = sessionStorage.getItem("@alunoLogadoNome");

if (!alunoId) {
    alert("Sessão expirada.");
    window.location.href = "login.htm";
}

// --- LÓGICA DE VERIFICAÇÃO ---
async function verificarStatusAluno() {
    const { data: aluno, error } = await supabaseClient
        .from('alunos')
        .select('autorizado, status, solicitou_visita')
        .eq('id', alunoId)
        .single();

    if (error || !aluno) return alert("Erro ao carregar dados.");

    document.querySelector('#nomeAlunoPendente').textContent = alunoNome;
    document.querySelector('#alunoLogadoNome').textContent = `Aluno: ${alunoNome}`;

    const areaPendente = document.getElementById('areaPendente');
    const areaAtiva = document.getElementById('areaAtiva');

    if (aluno.autorizado === true) {
        // Se autorizado, mostra a área de documentos
        areaPendente.style.display = 'none';
        areaAtiva.style.display = 'block';
    } else {
        // Se NÃO autorizado, mostra o aviso
        areaPendente.style.display = 'block';
        areaAtiva.style.display = 'none';
        
        // Verifica se já pediu visita
        const btnVisita = document.getElementById('btnSolicitarVisita');
        if (aluno.solicitou_visita) {
            btnVisita.disabled = true;
            btnVisita.innerHTML = "Visita Solicitada! Aguarde contato.";
            btnVisita.style.background = "#94a3b8";
        } else {
            btnVisita.onclick = async () => {
                btnVisita.disabled = true;
                btnVisita.textContent = "Enviando...";
                
                await supabaseClient.from('alunos').update({ solicitou_visita: true }).eq('id', alunoId);
                
                btnVisita.innerHTML = "Visita Solicitada!";
                btnVisita.style.background = "#28a745";
                alert("Solicitação enviada! A secretaria entrará em contato.");
            };
        }
    }
}

// --- LÓGICA DE SOLICITAR DOCUMENTOS (Só funciona se estiver na área ativa) ---
const btnSolicitar = document.querySelector('#btnSolicitar');
if (btnSolicitar) {
    btnSolicitar.addEventListener('click', async () => {
        const marcados = Array.from(document.querySelectorAll('.opçao-card input[type="checkbox"]:checked'));
        if (marcados.length === 0) return alert("Marque pelo menos um documento.");

        btnSolicitar.disabled = true;
        btnSolicitar.textContent = "Enviando...";

        const solicitacoes = marcados.map(cb => ({
            aluno_id: alunoId,
            documento: cb.name || cb.id.replace(/^i/, ''),
            status: 'Pendente'
        }));

        const { error } = await supabaseClient.from('solicitacoes_documentos').insert(solicitacoes);

        btnSolicitar.disabled = false;
        btnSolicitar.textContent = "Solicitar Documentos";

        if (error) {
            alert("Erro ao solicitar.");
        } else {
            alert("Solicitação enviada com sucesso!");
            marcados.forEach(cb => { cb.checked = false; });
        }
    });
}