// ============================================================
// scriptResponsavel.js — Área do Responsável
// ============================================================

const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabaseClient = supabaseClient;   // <-- exposto para os scripts inline
};
document.head.appendChild(scriptSupabase);

// --- SESSÃO ---
const alunoId   = localStorage.getItem("@alunoLogadoId");
const alunoNome = localStorage.getItem("@alunoLogadoNome");

const estaNaPaginaResponsavel = window.location.pathname.toLowerCase().includes('loginresponsavel');
if (estaNaPaginaResponsavel && !alunoId) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.htm";
}

const nomeEl = document.querySelector('#alunoLogadoNome');
if (nomeEl && alunoNome) {
    nomeEl.textContent = `Aluno: ${alunoNome}`;
}

// --- BOTÃO SOLICITAR ---
const btnSolicitar = document.querySelector('#btnSolicitar');

if (btnSolicitar) {
    btnSolicitar.addEventListener('click', async () => {
        if (!supabaseClient) {
            alert("Aguarde, o sistema está conectando...");
            return;
        }

        const marcados = Array.from(
            document.querySelectorAll('.opçao-card input[type="checkbox"]:checked')
        );

        if (marcados.length === 0) {
            alert("Marque pelo menos um documento antes de solicitar.");
            return;
        }

        btnSolicitar.disabled = true;
        const textoOriginal = btnSolicitar.textContent;
        btnSolicitar.textContent = "Enviando...";

        try {
            const solicitacoes = marcados.map(cb => ({
                aluno_id: alunoId,
                documento: cb.name || cb.id.replace(/^i/, ''),
                status: 'Pendente'
            }));

            const { error: errSol } = await supabaseClient
                .from('solicitacoes_documentos')
                .insert(solicitacoes);

            if (errSol) throw errSol;

            const nomesDocs = solicitacoes.map(s => s.documento).join(', ');
            await supabaseClient.from('avisos').insert([{
                tipo: 'Solicitacao Documento',
                mensagem: `Responsável do aluno "${alunoNome}" solicitou: ${nomesDocs}.`,
                aluno_id: alunoId,
                lido: false
            }]);

            alert("Solicitação enviada! O gestor foi notificado.");
            marcados.forEach(cb => { cb.checked = false; });
        } catch (e) {
            console.error(e);
            alert("Erro ao enviar solicitação. Tente novamente.");
        } finally {
            btnSolicitar.disabled = false;
            btnSolicitar.textContent = textoOriginal;
        }
    });
}