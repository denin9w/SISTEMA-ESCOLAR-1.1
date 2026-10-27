// ============================================================
// scriptGestor.js — Área do Gestor
// ============================================================

const SUPABASE_URL = "https://glnfbataoyvsnqnfkvvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMAadQ-9tSFXgNPoUApsEQ_eDpd-gf1";

let supabaseClient = null;
const scriptSupabase = document.createElement('script');
scriptSupabase.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
scriptSupabase.onload = () => {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    iniciarGestor();
};
document.head.appendChild(scriptSupabase);

const selectTurma       = document.querySelector('#iturma');
const listaDeAlunos     = document.querySelector('#listaAlunos');
const documentoporAluno = document.querySelector('#idocumentos');
const inputBusca        = document.querySelector('#buscaAluno');
const listaSolicitacoes = document.querySelector('#listaSolicitacoes');
const listaProfsPend    = document.querySelector('#listaProfessoresPendentes');
const gestorNomeEl      = document.querySelector('#gestorNome');

let gestorLogado = null;

const TURMAS = [
    'infantil-I-a','infantil-I-b', 'infantil-II-a','infantil-II-b', 'infantil-III-a','infantil-III-b',
    '1ano-a','1ano-b', '2ano-a','2ano-b', '3ano-a','3ano-b', '4ano-a','4ano-b', '5ano-a','5ano-b',
    '6ano-a', '7ano-a', '8ano-a', '9ano-a'
];

function labelTurma(t) {
    if (!t) return '';
    const m = t.match(/^(\d)ano-([ab])$/i);
    if (m) return `${m[1]}º Ano ${m[2].toUpperCase()}`;
    const inf = t.match(/^infantil-([IVX]+)-([ab])$/i);
    if (inf) return `Infantil ${inf[1].toUpperCase()} ${inf[2].toUpperCase()}`;
    return t.toUpperCase();
}

function iniciarGestor() {
    const gString = localStorage.getItem("@gestorLogado");
    if (!gString) {
        alert("Sessão expirada. Faça login novamente.");
        window.location.href = "login.htm";
        return;
    }
    gestorLogado = JSON.parse(gString);
    if (gestorNomeEl) gestorNomeEl.textContent = `Gestor: ${gestorLogado.nome}`;

    selectTurma.innerHTML = '<option value="" selected disabled>Selecione uma turma</option>';
    TURMAS.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = labelTurma(t);
        selectTurma.appendChild(opt);
    });

    carregarAvisos();
    carregarProfessoresPendentes();
}

selectTurma.addEventListener('change', () => carregarAlunos(selectTurma.value));

if (inputBusca) {
    inputBusca.addEventListener('input', () => {
        const termo = inputBusca.value.trim().toLowerCase();
        const itens = listaDeAlunos.querySelectorAll('.btn-aluno');
        itens.forEach(el => {
            el.style.display = el.dataset.nome.toLowerCase().includes(termo) ? 'block' : 'none';
        });
        listaDeAlunos.style.display = 'block';
    });
}

async function carregarAlunos(turma) {
    if (!turma) return;
    listaDeAlunos.style.display = 'block';
    listaDeAlunos.innerHTML = '<p>Carregando...</p>';

    const { data, error } = await supabaseClient
        .from('alunos')
        .select('id, nome, data_nascimento, status, numero_matricula, turma')
        .eq('turma', turma)
        .order('nome', { ascending: true });

    if (error) { console.error(error); listaDeAlunos.innerHTML = '<p>Erro ao carregar.</p>'; return; }

    if (!data || data.length === 0) {
        listaDeAlunos.innerHTML = '<p>Nenhum aluno nesta turma.</p>';
        return;
    }

    listaDeAlunos.innerHTML = '';
    data.forEach(aluno => {
        const a = document.createElement('a');
        a.className = 'btn-aluno';
        a.dataset.nome = aluno.nome;
        a.dataset.id = aluno.id;
        const statusTag = aluno.status && aluno.status !== 'Ativa' ? ` [${aluno.status}]` : '';
        a.textContent = `${aluno.nome}${statusTag}`;
        a.addEventListener('click', () => abrirDocumentos(aluno));
        listaDeAlunos.appendChild(a);
    });
}

function abrirDocumentos(aluno) {
    if (!documentoporAluno) return;
    documentoporAluno.style.display = 'block';
    documentoporAluno.dataset.alunoId = aluno.id;
    documentoporAluno.dataset.alunoNome = aluno.nome;

    documentoporAluno.querySelectorAll('.cdocumentos a').forEach(link => {
        link.onclick = (ev) => {
            ev.preventDefault();
            const docName = link.dataset.doc || link.textContent.trim();
            if (docName === 'Boletim' || docName === 'boletim') {
                gerarBoletimHTML(aluno.id); // Usa o HTML para o boletim
            } else {
                gerarDocumento(aluno.id, aluno.nome, docName); // Usa o Word para os outros
            }
        };
    });
}

// --- NOVA FUNÇÃO: BOLETIM EM HTML PARA NÃO QUEBRAR NO WORD ---
async function gerarBoletimHTML(alunoId) {
    try {
        const { data: aluno, error } = await supabaseClient.from('alunos').select('*').eq('id', alunoId).single();
        if (error || !aluno) throw new Error("Aluno não encontrado.");

        const hoje = new Date();
        const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
        
        const materias = [
            { nome: 'Português', id: 'portugues' },
            { nome: 'Matemática', id: 'matematica' },
            { nome: 'História', id: 'historia' },
            { nome: 'Geografia', id: 'geografia' },
            { nome: 'Ciências', id: 'ciencias' },
            { nome: 'Ed. Física', id: 'ed_fisica' },
            { nome: 'Inglês', id: 'ingles' },
            { nome: 'Arte', id: 'arte' },
            { nome: 'Ética e Cidadania', id: 'etica' }
        ];

        let linhasTabela = '';
        materias.forEach(mat => {
            const b1 = aluno[`b1_${mat.id}`] || '-';
            const b2 = aluno[`b2_${mat.id}`] || '-';
            const b3 = aluno[`b3_${mat.id}`] || '-';
            const b4 = aluno[`b4_${mat.id}`] || '-';
            const mdf = aluno[`mdf_${mat.id}`] || '-';
            const status = aluno[`status_${mat.id}`] || '-';

            linhasTabela += `
                <tr>
                    <td style="text-align: left; padding-left: 10px;">${mat.nome}</td>
                    <td>${b1}</td>
                    <td>${b2}</td>
                    <td>${b3}</td>
                    <td>${b4}</td>
                    <td><strong>${mdf}</strong></td>
                    <td><strong>${status}</strong></td>
                </tr>
            `;
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Boletim - ${aluno.nome}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #003869; padding-bottom: 10px; }
                    .header h1 { margin: 0; color: #003869; font-size: 24px; }
                    .header h2 { margin: 5px 0; font-size: 16px; font-weight: normal; }
                    .info { margin-bottom: 20px; font-size: 16px; }
                    .info strong { color: #003869; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: center; font-size: 14px; }
                    th { background-color: #f0f0f0; color: #003869; }
                    .footer { text-align: center; margin-top: 50px; font-size: 14px; }
                    @media print {
                        body { padding: 0; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>CENTRO EDUCACIONAL JARDIM DO ÉDEN</h1>
                    <h2>BOLETIM DE NOTAS - ${hoje.getFullYear()}</h2>
                </div>
                <div class="info">
                    <p><strong>Aluno(a):</strong> ${aluno.nome.toUpperCase()}</p>
                    <p><strong>Turma:</strong> ${labelTurma(aluno.turma)} &nbsp;&nbsp;&nbsp; <strong>Matrícula:</strong> ${aluno.numero_matricula || '---'}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Disciplina</th>
                            <th>1º Bim</th>
                            <th>2º Bim</th>
                            <th>3º Bim</th>
                            <th>4º Bim</th>
                            <th>Média Final</th>
                            <th>Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${linhasTabela}
                    </tbody>
                </table>
                <div class="footer">
                    <p>Garanhuns, ${dataFormatada}</p>
                    <br><br>
                    <p>_______________________________________________________<br>Assinatura da Direção</p>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        const novaAba = window.open('', '_blank');
        novaAba.document.write(html);
        novaAba.document.close();

    } catch (e) {
        console.error(e);
        alert(`Erro ao gerar boletim: ${e.message}`);
    }
}

// --- FUNÇÃO PARA GERAR OS OUTROS DOCUMENTOS EM WORD ---
async function gerarDocumento(alunoId, alunoNome, nomeDoc) {
    if (typeof PizZip === 'undefined' || typeof docxtemplater === 'undefined') {
        alert("Bibliotecas de DOCX não carregadas nesta página.");
        return;
    }

    const slug = nomeDoc.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
    const urlTemplate = `documentos/${slug}.docx`;

    try {
        const { data: aluno, error } = await supabaseClient.from('alunos').select('*').eq('id', alunoId).single();
        if (error || !aluno) throw new Error("Aluno não encontrado.");

        const resp = await fetch(urlTemplate);
        if (!resp.ok) throw new Error(`Template não encontrado na pasta: ${urlTemplate}`);
        
        const arrayBuffer = await resp.arrayBuffer();
        
        // MÁGICA DA LIMPEZA DO WORD (Mantida)
        const zipIn = new PizZip(arrayBuffer);
        let xml = zipIn.file("word/document.xml").asText();
        xml = xml.replace(/(\{\{[\s\S]*?\}\})/g, function(match) {
            return match.replace(/<[^>]+>/g, ''); 
        });
        zipIn.file("word/document.xml", xml);
        const bufferLimpo = zipIn.generate({ type: "arraybuffer" });
        
        const zip = new PizZip(bufferLimpo);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const dataFormatada = `${dia} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;

        const contexto = {
            ...aluno,
            data_hoje: dataFormatada,
            data_nascimento_br: aluno.data_nascimento ? aluno.data_nascimento.split('-').reverse().join('/') : '',
            turma_label: labelTurma(aluno.turma || ''),
        };

        const camposTexto = [
            'nome', 'nacionalidade', 'cidade_nascimento', 'endereco', 'bairro', 'cidade', 'estado', 
            'nome_pai', 'profissao_pai', 'nome_mae', 'profissao_mae', 'responsavel', 'responsavel_outro',
            'turma_label', 'status'
        ];
        const camposNotas = ['portugues', 'matematica', 'historia', 'geografia', 'ciencias', 'ed_fisica', 'ingles', 'arte', 'etica'];

        camposTexto.forEach(campo => {
            if (contexto[campo]) {
                contexto[`${campo}_maiusculo`] = String(contexto[campo]).toUpperCase();
            }
        });

        camposNotas.forEach(mat => {
            if (contexto[`status_${mat}`]) {
                contexto[`status_${mat}`] = String(contexto[`status_${mat}`]).toUpperCase();
            }
        });

        doc.render(contexto);
        const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        
        saveAs(out, `${slug}-${alunoNome.replace(/\s+/g,'_')}.docx`);

    } catch (e) {
        console.error(e);
        alert(`Não foi possível gerar "${nomeDoc}".\nDetalhe: ${e.message}`);
    }
}

// --- AVISOS ---
async function carregarAvisos() {
    if (!listaSolicitacoes) return;
    const { data, error } = await supabaseClient
        .from('solicitacoes_documentos')
        .select('id, documento, status, criado_em, aluno_id, alunos(nome, turma)')
        .eq('status', 'Pendente')
        .order('criado_em', { ascending: true });

    if (error) { console.error(error); return; }

    listaSolicitacoes.innerHTML = '';
    if (!data || data.length === 0) {
        listaSolicitacoes.innerHTML = '<p>Sem solicitações pendentes.</p>';
        return;
    }

    data.forEach(s => {
        const div = document.createElement('div');
        div.className = 'aviso-item';
        const nomeAluno = s.alunos?.nome || '(aluno removido)';
        const turma = s.alunos?.turma ? labelTurma(s.alunos.turma) : '';
        
        div.innerHTML = `
            <strong>${nomeAluno}</strong> ${turma ? '('+turma+')' : ''}<br>
            Documento: <b>${s.documento}</b><br>
            <button class="btn-mini btn-gerar" data-id="${s.id}" data-aluno-id="${s.aluno_id}" data-aluno="${nomeAluno}" data-doc="${s.documento}">Gerar</button>
            <button class="btn-mini btn-marcar" data-id="${s.id}">Marcar entregue</button>
        `;
        listaSolicitacoes.appendChild(div);
    });

    listaSolicitacoes.querySelectorAll('.btn-gerar').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.textContent = "Gerando...";
            const docName = btn.dataset.doc;
            if (docName === 'Boletim' || docName === 'boletim') {
                await gerarBoletimHTML(btn.dataset.alunoId);
            } else {
                await gerarDocumento(btn.dataset.alunoId, btn.dataset.aluno, docName);
            }
            btn.textContent = "Gerar";
        });
    });

    listaSolicitacoes.querySelectorAll('.btn-marcar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const { error } = await supabaseClient.from('solicitacoes_documentos').update({ status: 'Entregue' }).eq('id', id);
            if (error) alert("Erro ao atualizar.");
            else carregarAvisos();
        });
    });
}

// --- PROFESSORES PENDENTES ---
async function carregarProfessoresPendentes() {
    if (!listaProfsPend) return;
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('id, nome, cpf_senha, turmas, criado_em')
        .eq('tipo', 'professor')
        .eq('autorizado', false)
        .order('criado_em', { ascending: true });

    if (error) { console.error(error); return; }

    listaProfsPend.innerHTML = '';
    if (!data || data.length === 0) {
        listaProfsPend.innerHTML = '<p>Nenhum professor pendente.</p>';
        return;
    }

    data.forEach(p => {
        const div = document.createElement('div');
        div.className = 'aviso-item';
        const turmasTxt = (p.turmas || []).map(labelTurma).join(', ') || '(sem turma)';
        div.innerHTML = `
            <strong>${p.nome}</strong> — CPF: ${p.cpf_senha}<br>
            Turmas: ${turmasTxt}<br>
            <button class="btn-mini btn-autorizar" data-id="${p.id}">Autorizar</button>
        `;
        listaProfsPend.appendChild(div);
    });

    listaProfsPend.querySelectorAll('.btn-autorizar').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm("Autorizar este professor?")) return;
            const { error } = await supabaseClient.from('usuarios').update({ autorizado: true }).eq('id', btn.dataset.id);
            if (error) alert("Erro ao autorizar.");
            else carregarProfessoresPendentes();
        });
    });
}