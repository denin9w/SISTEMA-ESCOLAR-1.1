// --- scriptResponsavel.js ---
const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.supabaseClient = supabaseClient;
    verificarStatusAlunoV2();
};
document.head.appendChild(scriptSupabase);

const alunoId = sessionStorage.getItem("@alunoLogadoId");
const alunoNome = sessionStorage.getItem("@alunoLogadoNome");

if (!alunoId) {
    alert("Sessão expirada.");
    window.location.href = "login.htm";
}

// --- LÓGICA DE VERIFICAÇÃO ---
async function verificarStatusAlunoV2() {
       const { data: aluno, error } = await supabaseClient
        .from('alunos')
        .select('autorizado, status, solicitou_visita, data_visita_solicitada, data_visita_confirmada, opcoes_visita_gestor') // <--- ADICIONE ISSO
        .eq('id', alunoId)
        .single();

    if (error || !aluno) return alert("Erro ao carregar dados.");

    document.querySelector('#nomeAlunoPendente').textContent = alunoNome;
    document.querySelector('#alunoLogadoNome').textContent = `Aluno: ${alunoNome}`;

    const areaPendente = document.getElementById('areaPendente');
    const areaAtiva = document.getElementById('areaAtiva');

       if (aluno.autorizado === true) {
        areaPendente.style.display = 'none';
        areaAtiva.style.display = 'block';
    } else {
        areaPendente.style.display = 'block';
        areaAtiva.style.display = 'none';
        
        const divAgendamento = document.getElementById('agendamentoVisita');

        // 1. Se o GESTOR já sugeriu uma data (opcoes_visita_gestor preenchido)
               // 1. Se o GESTOR já sugeriu uma data (opcoes_visita_gestor preenchido)
        if (aluno.opcoes_visita_gestor) {
            divAgendamento.style.display = 'block';
            
            let dataFormatada = aluno.opcoes_visita_gestor;
            if (dataFormatada.includes('-')) {
                dataFormatada = new Date(dataFormatada + 'T00:00:00').toLocaleDateString('pt-BR');
            }

            divAgendamento.innerHTML = `
                <div style="background: #e6f2ff; border: 1px solid #b6d4fe; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="color: #084298; font-weight: bold; margin-bottom: 15px; font-size: 1.1rem;">
                        <i class="fa-solid fa-calendar-check"></i> A escola sugeriu uma nova data:
                    </p>
                    <p style="color: #084298; font-size: 1.3rem; font-weight: bold; margin-bottom: 20px;">
                        ${dataFormatada}
                    </p>
                    <button id="btnAceitarDataEscola" style="width: 100%; background: #28a745; color: white; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; margin-bottom: 10px;">
                        <i class="fa-solid fa-check"></i> Aceitar esta Data
                    </button>
                    <p style="font-size: 0.85rem; color: #666; margin: 0;">
                        Se esta data não for boa, por favor, entre em contato com a secretaria.
                    </p>
                </div>
            `;
            
            document.getElementById('btnAceitarDataEscola').onclick = async () => {
                const btn = document.getElementById('btnAceitarDataEscola');
                btn.disabled = true; btn.textContent = "Confirmando...";
                
                // CORREÇÃO AQUI: Transforma a data brasileira (DD/MM/AAAA) para o padrão do banco (AAAA-MM-DD)
                let dataParaSalvar = aluno.opcoes_visita_gestor;
                if (dataParaSalvar.includes('/')) {
                    const partes = dataParaSalvar.split('/');
                    dataParaSalvar = `${partes[2]}-${partes[1]}-${partes[0]}`;
                }

                const { error } = await supabaseClient.from('alunos').update({ 
                    data_visita_confirmada: dataParaSalvar, 
                    opcoes_visita_gestor: null 
                }).eq('id', alunoId);
                
                if (error) {
                    alert("Erro ao confirmar: " + error.message);
                    btn.disabled = false; btn.textContent = "Aceitar esta Data";
                } else {
                    alert("Visita confirmada! Aguarde a escola.");
                    window.location.reload();
                }
            };
        }
        // 2. Se o PAI já solicitou uma data e o gestor ainda não respondeu
        else if (aluno.data_visita_solicitada && !aluno.data_visita_confirmada)  {
            divAgendamento.style.display = 'block';
            
            let dataFormatada = aluno.data_visita_solicitada;
            if (dataFormatada.includes('-')) {
                dataFormatada = new Date(dataFormatada + 'T00:00:00').toLocaleDateString('pt-BR');
            }

            divAgendamento.innerHTML = `
                <div style="background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="color: #b45309; font-weight: bold; margin-bottom: 10px; font-size: 1.1rem;">
                        <i class="fa-solid fa-clock"></i> Visita solicitada para:
                    </p>
                    <p style="color: #b45309; font-size: 1.3rem; font-weight: bold; margin-bottom: 15px;">
                        ${dataFormatada}
                    </p>
                    <p style="font-size: 0.9rem; color: #666; margin: 0;">
                        <i class="fa-solid fa-hourglass-half"></i> Aguardando a confirmação da escola. Se precisar alterar, entre em contato com a secretaria.
                    </p>
                </div>
            `;
        }
        // 3. Se ele já teve a visita confirmada pelo gestor
        else if (aluno.data_visita_confirmada) {
            divAgendamento.style.display = 'block';

            let dataFormatada = aluno.data_visita_confirmada;
            if (dataFormatada.includes('-')) {
                dataFormatada = new Date(dataFormatada + 'T00:00:00').toLocaleDateString('pt-BR');
            }
            
          divAgendamento.innerHTML = `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="color: #155724; font-weight: bold; margin-bottom: 10px; font-size: 1.1rem;">
                        <i class="fa-solid fa-circle-check"></i> Visita Confirmada!
                    </p>
                    <p style="color: #155724; font-size: 1.3rem; font-weight: bold; margin-bottom: 15px;">
                        ${dataFormatada}
                    </p>
                    <p style="font-size: 0.9rem; color: #155724; margin-bottom: 20px;">
                        Esperamos você! Caso não possa comparecer nesta data, entre em contato com a secretaria.
                    </p>
                    
                    <!-- BOTÃO IDÊNTICO AO DA MATRÍCULA -->
                    <a href="https://wa.me/5587981149883?text=Ol%C3%A1!%20Sou%20respons%C3%A1vel%20do%20aluno%20${encodeURIComponent(alunoNome)}.%20Confirmo%20nossa%20visita%20para%20o%20dia%20${dataFormatada}." target="_blank" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #25D366; color: white; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 1.1rem; width: 100%; transition: 0.3s; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); margin-bottom: 15px; box-sizing: border-box;">
                        <i class="fa-brands fa-whatsapp" style="font-size: 1.5rem;"></i> Falar com a Secretaria
                    </a>
                </div>
            `;
        }
        // 4. Se ainda não solicitou nada, mostra o calendário
        else {
            divAgendamento.style.display = 'block';
            
            divAgendamento.innerHTML = `
                <p style="font-size: 1rem; color: #334155; margin-bottom: 15px; font-weight: 600; text-align: center; margin-top: 0;">
                    <i class="fa-regular fa-calendar-days" style="color: #f59e0b; margin-right: 5px;"></i> Escolha o melhor dia para nos visitar:
                </p>
                
                <input type="date" id="inputDataVisita" style="width: 100%; padding: 14px; margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 1rem; color: #334155; outline: none; box-sizing: border-box; background: white; display: block;">
                
                <button id="btnEnviarSolicitacaoVisita" style="width: 100%; background: #f59e0b; color: white; padding: 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; justify-content: center; align-items: center; gap: 8px; box-sizing: border-box;">
                    <i class="fa-solid fa-paper-plane"></i> Solicitar Visita
                </button>
            `;

            document.getElementById('inputDataVisita').min = new Date().toISOString().split('T')[0];

            document.getElementById('btnEnviarSolicitacaoVisita').onclick = async () => {
                const dataSelecionada = document.getElementById('inputDataVisita').value;
                if (!dataSelecionada) return alert("Escolha uma data primeiro.");
                
                const btn = document.getElementById('btnEnviarSolicitacaoVisita');
                btn.disabled = true; btn.textContent = "Enviando...";

                const { error } = await supabaseClient.from('alunos').update({ data_visita_solicitada: dataSelecionada }).eq('id', alunoId);
                
                if (error) {
                    alert("Erro ao enviar: " + error.message);
                    btn.disabled = false; btn.textContent = "Solicitar Visita";
                } else {
                    alert("Solicitação enviada! A secretaria entrará em contato.");
                    window.location.reload();
                }
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