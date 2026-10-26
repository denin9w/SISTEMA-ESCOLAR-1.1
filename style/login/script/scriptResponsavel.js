// ============================================================
// scriptResponsavel.js — Área do Responsável
// Requer no HTML (item 9/17):
//   #alunoLogadoNome, #btnSolicitar, .opçao-card input[type="checkbox"]
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

// --- SESSÃO ---
const alunoId   = localStorage.getItem("@alunoLogadoId");
const alunoNome = localStorage.getItem("@alunoLogadoNome");

if (!alunoId) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.htm";
}

// Mostra o nome do aluno, se o elemento existir
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

        // Coleta checkboxes marcados
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
            // Para cada checkbox, usa o "name" como nome do documento
            const solicitacoes = marcados.map(cb => ({
                aluno_id: alunoId,
                documento: cb.name || cb.id.replace(/^i/, ''),
                status: 'Pendente'
            }));

            const { error: errSol } = await supabaseClient
                .from('solicitacoes_documentos')
                .insert(solicitacoes);

            if (errSol) throw errSol;

            // Cria um aviso agregado para o gestor
            const nomesDocs = solicitacoes.map(s => s.documento).join(', ');
            await supabaseClient.from('avisos').insert([{
                tipo: 'Solicitacao Documento',
                mensagem: `Responsável do aluno "${alunoNome}" solicitou: ${nomesDocs}.`,
                aluno_id: alunoId,
                lido: false
            }]);

            alert("Solicitação enviada! O gestor foi notificado.");

            // Desmarca os checkboxes
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