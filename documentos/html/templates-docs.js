// ============================================================
// templates-docs.js — Modelos de documentos em HTML e Word
// ============================================================

function labelTurma(t) {
    if (!t) return '';
    const m = t.match(/^(\d)ano-([ab])$/i);
    if (m) return `${m[1]}º ANO ${m[2].toUpperCase()}`;
    const inf = t.match(/^infantil-([IVX]+)-([ab])$/i);
    if (inf) return `INFANTIL ${inf[1].toUpperCase()} ${inf[2].toUpperCase()}`;
    return t.toUpperCase();
}
// --- NOVA FUNÇÃO: IDENTIFICA O NÍVEL DE ENSINO PELA TURMA ---
function getNivelEnsino(t) {
    if (!t) return '—';
    const turma = t.toLowerCase();
    
    if (turma.includes('infantil')) {
        return 'EDUCAÇÃO INFANTIL';
    }
    
    // Pega o primeiro número da string da turma
    const primeiroDigito = parseInt(turma.charAt(0));
    
    if (primeiroDigito >= 1 && primeiroDigito <= 5) {
        return 'ENSINO FUNDAMENTAL I';
    } else if (primeiroDigito >= 6 && primeiroDigito <= 9) {
        return 'ENSINO FUNDAMENTAL II';
    }
    
    return '—';
}

function dataBR(iso) {
    if (!iso) return '___/___/______';
    const s = String(iso).slice(0, 10);
    const p = s.split('-');
    if (p.length !== 3) return s;
    return `${p[2]}/${p[1]}/${p[0]}`;
}

function dataHojeExtenso() {
    const hoje = new Date();
    const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    return `${hoje.getDate()} de ${meses[hoje.getMonth()]} de ${hoje.getFullYear()}`;
}

function up(s) { return (s || '').toString().toUpperCase(); }

function formatarNotaDoc(valor) {
    if (valor === null || valor === undefined || valor === '') return '-';
    return Number(valor).toFixed(1).replace('.', ',');
}

function dadosPais(a) {
    const pai = a.nome_pai ? up(a.nome_pai) : '_________________________________';
    const mae = a.nome_mae ? up(a.nome_mae) : '_________________________________';
    return { pai, mae };
}

// --- NOVA FUNÇÃO: BUSCA O RESPONSÁVEL CORRETO ---
function getDadosResponsavel(a) {
    let nomeResp = '—';
    let cpfResp = '—';

    if (a.responsavel === 'pai') {
        nomeResp = a.nome_pai || '—';
        cpfResp = a.cpf_pai || '—';
    } else if (a.responsavel === 'mae') {
        nomeResp = a.nome_mae || '—';
        cpfResp = a.cpf_mae || '—';
    } else if (a.responsavel === 'outro') {
        nomeResp = a.responsavel_outro || '—';
        cpfResp = a.cpf_outro || '—';
    } else {
        nomeResp = a.nome_pai || a.nome_mae || '—';
    }

    return {
        nome: up(nomeResp),
        cpf: cpfResp
    };
}

// --- CSS GLOBAL (Ainda usado pelo Carnê) ---
const CSS_GLOBAL = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @page { size: A4 portrait; margin: 2cm; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; margin: 0; padding: 20px; background: #f0f0f0; display: flex; justify-content: center; }
        .doc-container { width: 100%; max-width: 800px; background: #fff; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); box-sizing: border-box; }
        .doc-title { text-align: center; font-size: 14pt; font-weight: bold; margin: 30px 0; text-transform: uppercase; }
        p { margin: 0 0 10px 0; line-height: 1.8; text-align: justify; }
        @media (max-width: 768px) {
            body { padding: 10px; background: #fff; }
            .doc-container { padding: 15px; box-shadow: none; }
            .doc-title { font-size: 12pt; margin: 15px 0; }
            p, td, th { font-size: 11pt; line-height: 1.5; }
            .table-responsive { display: block; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        }
    </style>
`;

// ============================================================
// 1. BOLETIM (WORD)
// ============================================================
async function docBoletim(a) {
    try {
        const response = await fetch('documentos/modelos/boletim.docx');
        if (!response.ok) throw new Error("Arquivo modelo não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME_ALUNO: up(a.nome),
            TURMA: up(labelTurma(a.turma)),
            TURNO: up(a.turno || 'NÃO INFORMADO'),
            ANO_ATUAL: new Date().getFullYear()
        };

        const materias = [
            { id: 'portugues', sigla: 'P' }, { id: 'historia', sigla: 'H' },
            { id: 'geografia', sigla: 'G' }, { id: 'ciencias', sigla: 'C' },
            { id: 'matematica', sigla: 'M' }, { id: 'ed_fisica', sigla: 'EF' },
            { id: 'ingles', sigla: 'I' }, { id: 'arte', sigla: 'A' },
            { id: 'etica', sigla: 'E' }
        ];
        
        materias.forEach(mat => {
            dados[`B1_${mat.sigla}`] = formatarNotaDoc(a[`b1_${mat.id}`]);
            dados[`B2_${mat.sigla}`] = formatarNotaDoc(a[`b2_${mat.id}`]);
            dados[`B3_${mat.sigla}`] = formatarNotaDoc(a[`b3_${mat.id}`]);
            dados[`B4_${mat.sigla}`] = formatarNotaDoc(a[`b4_${mat.id}`]);
            dados[`MDF_${mat.sigla}`] = formatarNotaDoc(a[`mdf_${mat.id}`]);
            dados[`S_${mat.sigla}`] = a[`status_${mat.id}`] || '-';
        });

        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar boletim Word:", error);
        alert("Erro ao gerar o boletim: " + error.message);
        return null;
    }
}

// ============================================================
// 2. BOLETIM DA TURMA (WORD)
// ============================================================
async function docBoletimTurma(alunos) {
    try {
        const response = await fetch('documentos/modelos/boletim_turma.docx');
        if (!response.ok) throw new Error("Arquivo boletim_turma.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const listaAlunos = alunos.map(aluno => {
            const item = {
                NOME_ALUNO: up(aluno.nome),
                TURMA: up(labelTurma(aluno.turma)),
                TURNO: up(aluno.turno || 'NÃO INFORMADO'),
                ANO_ATUAL: new Date().getFullYear()
            };
            const materias = [
                { id: 'portugues', sigla: 'P' }, { id: 'historia', sigla: 'H' },
                { id: 'geografia', sigla: 'G' }, { id: 'ciencias', sigla: 'C' },
                { id: 'matematica', sigla: 'M' }, { id: 'ed_fisica', sigla: 'EF' },
                { id: 'ingles', sigla: 'I' }, { id: 'arte', sigla: 'A' },
                { id: 'etica', sigla: 'E' }
            ];
            materias.forEach(mat => {
                item[`B1_${mat.sigla}`] = formatarNotaDoc(aluno[`b1_${mat.id}`]);
                item[`B2_${mat.sigla}`] = formatarNotaDoc(aluno[`b2_${mat.id}`]);
                item[`B3_${mat.sigla}`] = formatarNotaDoc(aluno[`b3_${mat.id}`]);
                item[`B4_${mat.sigla}`] = formatarNotaDoc(aluno[`b4_${mat.id}`]);
                item[`MDF_${mat.sigla}`] = formatarNotaDoc(aluno[`mdf_${mat.id}`]);
                item[`S_${mat.sigla}`] = aluno[`status_${mat.id}`] || '-';
            });
            return item;
        });
        doc.render({ alunos: listaAlunos });
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar boletim da turma:", error);
        alert("Erro ao gerar o boletim da turma: " + error.message);
        return null;
    }
}

// ============================================================
// 3. BOLSA FAMÍLIA (WORD)
// ============================================================
async function docBolsaFamilia(a) {
    try {
        const response = await fetch('documentos/modelos/bolsa_familia.docx');
        if (!response.ok) throw new Error("Arquivo bolsa_familia.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME: up(a.nome),
            PAI: a.nome_pai ? up(a.nome_pai) : '_________________________________',
            MAE: a.nome_mae ? up(a.nome_mae) : '_________________________________',
            DATA_NASC: dataBR(a.data_nascimento),
            CIDADE_NASC: up(a.cidade_nascimento || '—'),
            ESTADO_NASC: up(a.estado_nascimento || '—'),
            CIDADE: up(a.cidade || '—'),
            ESTADO: up(a.estado || '—'),
            TURMA: up(labelTurma(a.turma)),
            TURNO: up(a.turno || 'NÃO INFORMADO'),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Bolsa Família:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 4. DECLARAÇÃO DE MATRÍCULA (WORD)
// ============================================================
async function docDeclaracaoMatricula(a) {
    try {
        const response = await fetch('documentos/modelos/declaracao_matricula.docx');
        if (!response.ok) throw new Error("Arquivo declaracao_matricula.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME: up(a.nome),
            PAI: a.nome_pai ? up(a.nome_pai) : '_________________________________',
            MAE: a.nome_mae ? up(a.nome_mae) : '_________________________________',
            DATA_NASC: dataBR(a.data_nascimento),
            TURMA: up(labelTurma(a.turma)),
            TURNO: up(a.turno || 'NÃO INFORMADO'),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Declaração de Matrícula:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 5. DECLARAÇÃO PROVISÓRIA (WORD)
// ============================================================
async function docProvissoria(a) {
    try {
        const response = await fetch('documentos/modelos/declaracao_provisoria.docx');
        if (!response.ok) throw new Error("Arquivo declaracao_provisoria.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME: up(a.nome),
            PAI: a.nome_pai ? up(a.nome_pai) : '_________________________________',
            MAE: a.nome_mae ? up(a.nome_mae) : '_________________________________',
            DATA_NASC: dataBR(a.data_nascimento),
            CIDADE_NASC: up(a.cidade_nascimento || '—'),
            ESTADO_NASC: up(a.estado_nascimento || '—'),
            TURMA: up(labelTurma(a.turma)),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Declaração Provisória:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}
// ============================================================
// TRANSFERÊNCIA (WORD)
// ============================================================
async function docTransferencia(a) {
    try {
        const response = await fetch('documentos/modelos/transferencia.docx');
        if (!response.ok) throw new Error("Arquivo transferencia.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME: up(a.nome),
            PAI: a.nome_pai ? up(a.nome_pai) : '_________________________________',
            MAE: a.nome_mae ? up(a.nome_mae) : '_________________________________',
            DATA_NASC: dataBR(a.data_nascimento),
            CIDADE_NASC: up(a.cidade_nascimento || '—'),
            ESTADO_NASC: up(a.estado_nascimento || '—'),
            RG: a.rg || 'XXXXX',
            CPF: a.cpf || 'XXXXX',
            TURMA: up(labelTurma(a.turma)),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };

        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Transferência:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 6. RECIBO DE PAGAMENTO (WORD)
// ============================================================
async function docReciboPagamento(a) {
    try {
        const response = await fetch('documentos/modelos/recibo_pagamento.docx');
        if (!response.ok) throw new Error("Arquivo recibo_pagamento.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const resp = getDadosResponsavel(a);
        const dados = {
            NOME: up(a.nome),
            RESPONSAVEL: resp.nome,
            CPF_RESPONSAVEL: resp.cpf,
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Recibo de Pagamento:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 7. FICHA INDIVIDUAL (WORD) - CORRIGIDA
// ============================================================
async function docFichaIndividual(a) {
    try {
        const response = await fetch('documentos/modelos/ficha_individual.docx');
        if (!response.ok) throw new Error("Arquivo ficha_individual.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        // Prepara os dados básicos
        const dados = {
            NOME: up(a.nome),
            ANO_ATUAL: new Date().getFullYear(),
            TURMA: up(labelTurma(a.turma)),
            TURNO: up(a.turno || 'NÃO INFORMADO'),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };

        // Adiciona as notas de cada matéria já formatadas
        const materias = [
            { id: 'portugues', sigla: 'P' }, { id: 'historia', sigla: 'H' },
            { id: 'geografia', sigla: 'G' }, { id: 'ciencias', sigla: 'C' },
            { id: 'matematica', sigla: 'M' }, { id: 'ed_fisica', sigla: 'EF' },
            { id: 'ingles', sigla: 'I' }, { id: 'arte', sigla: 'A' },
            { id: 'etica', sigla: 'E' }
        ];
        
        materias.forEach(mat => {
            dados[`B1_${mat.sigla}`] = formatarNotaDoc(a[`b1_${mat.id}`]);
            dados[`B2_${mat.sigla}`] = formatarNotaDoc(a[`b2_${mat.id}`]);
            dados[`B3_${mat.sigla}`] = formatarNotaDoc(a[`b3_${mat.id}`]);
            dados[`B4_${mat.sigla}`] = formatarNotaDoc(a[`b4_${mat.id}`]);
            dados[`MDF_${mat.sigla}`] = formatarNotaDoc(a[`mdf_${mat.id}`]);
        });

        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Ficha Individual:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 8. RECIBO (WORD)
// ============================================================
async function docRecibo(a) {
    try {
        const response = await fetch('documentos/modelos/recibo.docx');
        if (!response.ok) throw new Error("Arquivo recibo.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const resp = getDadosResponsavel(a);
        const dados = {
            NOME: up(a.nome),
            RESPONSAVEL: resp.nome,
            CPF_RESPONSAVEL: resp.cpf,
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Recibo:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 9. QUITAÇÃO SIMPLES (WORD)
// ============================================================
async function docQuitacaoSimples(a) {
    try {
        const response = await fetch('documentos/modelos/quitacao_simples.docx');
        if (!response.ok) throw new Error("Arquivo quitacao_simples.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const resp = getDadosResponsavel(a);
        const dados = {
            NOME: up(a.nome),
            RESPONSAVEL: resp.nome,
            CPF_RESPONSAVEL: resp.cpf,
            ANO_ATUAL: new Date().getFullYear(),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Quitação Simples:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 10. QUITAÇÃO TABELA (WORD)
// ============================================================
async function docQuitacaoTabela(a) {
    try {
        const response = await fetch('documentos/modelos/quitacao_tabela.docx');
        if (!response.ok) throw new Error("Arquivo quitacao_tabela.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const resp = getDadosResponsavel(a);
        const dados = {
            NOME: up(a.nome),
            RESPONSAVEL: resp.nome,
            CPF_RESPONSAVEL: resp.cpf,
            ANO_ATUAL: new Date().getFullYear(),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Quitação Tabela:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 11. DECLARAÇÃO NORMAL (WORD)
// ============================================================
async function docDeclaracaoNormal(a) {
    try {
        const response = await fetch('documentos/modelos/declaracao_normal.docx');
        if (!response.ok) throw new Error("Arquivo declaracao_normal.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME: up(a.nome),
            DATA_NASC: dataBR(a.data_nascimento),
            TURMA: up(labelTurma(a.turma)),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Declaração Normal:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 12. DECLARAÇÃO NORMAL PAI/MÃE (WORD)
// ============================================================
async function docDeclaracaoNormalPaiMae(a) {
    try {
        const response = await fetch('documentos/modelos/declaracao_normal_pai_mae.docx');
        if (!response.ok) throw new Error("Arquivo declaracao_normal_pai_mae.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const dados = {
            NOME: up(a.nome),
            PAI: a.nome_pai ? up(a.nome_pai) : '_________________________________',
            MAE: a.nome_mae ? up(a.nome_mae) : '_________________________________',
            DATA_NASC: dataBR(a.data_nascimento),
            TURMA: up(labelTurma(a.turma)),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Declaração Pai/Mãe:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 13. DECLARAÇÃO DE PROFESSOR QUE SAIU (WORD)
// ============================================================
/*async function docProfessorSaiu(a) {
    try {
        // 1. Busca o nome do professor (pegando o primeiro da lista)
        const { data: prof } = await supabaseClient.from('usuarios').select('nome').eq('tipo', 'professor').limit(1);
        const nomeProf = prof && prof.length > 0 ? prof[0].nome : 'PROFESSOR NÃO ENCONTRADO';

        // 2. O resto do código que baixa o Word (NÃO MUDE ISSO)
        const response = await fetch('documentos/modelos/declaracao_professor.docx');
        if (!response.ok) throw new Error("Arquivo não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        // 3. Envia a tag para o Word
        doc.render({
            NOME_PROF: up(nomeProf),
            DATA_HOJE: dataHojeExtenso()
        });

        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao gerar documento: " + error.message);
        return null;
    }
}
*/
// ============================================================
// 14. PAGAMENTO ESCOLAR (WORD) - CORRIGIDO AQUI
// ============================================================
async function docPagamentoEscolar(a) {
    try {
        const response = await fetch('documentos/modelos/pagamento_escolar.docx');
        if (!response.ok) throw new Error("Arquivo pagamento_escolar.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const resp = getDadosResponsavel(a);
        const dados = {
            NOME: up(a.nome),
            RESPONSAVEL: resp.nome,
            CPF_RESPONSAVEL: resp.cpf,
            ANO_ATUAL: new Date().getFullYear(),
            NIVEL_ENSINO: getNivelEnsino(a.turma),
            DATA_HOJE: dataHojeExtenso()
        };
        doc.render(dados);
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    } catch (error) {
        console.error("Erro ao gerar Pagamento Escolar:", error);
        alert("Erro ao gerar o documento: " + error.message);
        return null;
    }
}

// ============================================================
// 15. CARNÊ (MANTIDO COMO HTML)
// ============================================================
function docCarne(a, opcoes) {
    const { valor, temIrmao, irmao1, irmao2 } = opcoes || { valor: '300,00', temIrmao: false };
    
    const resp = getDadosResponsavel(a);
    const nomeResponsavel = resp.nome;
    const cpfResp = resp.cpf;

    const endereco = a.endereco ? `${a.endereco}, Nº ${a.numero_endereco || 'S/N'}` : 'Endereço não informado';
    const cidadeEstado = a.cidade ? `${a.cidade}/${a.estado || ''}` : '';
    const anoAtual = new Date().getFullYear();
    
    const primeiroNome = (nome) => nome ? nome.trim().split(' ').slice(0, 2).join(' ') : '';
    
    let nomesExibir = [up(primeiroNome(a.nome))];
    let seriesExibir = [labelTurma(a.turma)];
    
    if (temIrmao) {
        if (irmao1?.nome && irmao1.nome.trim() !== '') {
            nomesExibir.push(up(primeiroNome(irmao1.nome)));
            seriesExibir.push(labelTurma(irmao1.turma));
        }
        if (irmao2?.nome && irmao2.nome.trim() !== '') {
            nomesExibir.push(up(primeiroNome(irmao2.nome)));
            seriesExibir.push(labelTurma(irmao2.turma));
        }
    }
    
    const nomeFinal = nomesExibir.join(' e ');
    const serieFinal = seriesExibir.join(' e ');
    
    let parcelasHTML = '';
    for (let mes = 1; mes <= 12; mes++) {
        const diaVencimento = (mes === 2) ? '28' : '30';
        const dataVencimento = `${String(diaVencimento).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${anoAtual}`;
        
        parcelasHTML += `
        <div style="width: 100%; margin-bottom: 15px; page-break-inside: avoid;">
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 8pt; border: 1px solid #000;">
                <tr><td style="border-bottom: 1px solid #000; padding: 2px; font-size: 6pt; color: #555;">NOME</td></tr>
                <tr><td style="border-bottom: 1px solid #000; padding: 4px; font-weight: bold;">${nomeFinal}</td></tr>
                <tr>
                    <td style="border-bottom: 1px solid #000; padding: 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="border-right: 1px solid #000; width: 50%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">TURMA</div>
                                    <div style="padding: 2px 4px; font-weight: bold; text-transform: uppercase;">${(a.turma || '').slice(-1).toUpperCase()}</div>
                                </td>
                                <td style="width: 50%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">SÉRIE</div>
                                    <div style="padding: 2px 4px; font-weight: bold;">${serieFinal}</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="border-bottom: 1px solid #000; padding: 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="border-right: 1px solid #000; width: 33%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">TURNO</div>
                                    <div style="padding: 2px 4px; font-weight: bold;">${up(a.turno || 'DIURNO')}</div>
                                </td>
                                <td style="border-right: 1px solid #000; width: 33%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">PARCELA</div>
                                    <div style="padding: 2px 4px; font-weight: bold;">${mes}/12</div>
                                </td>
                                <td style="width: 34%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">VENCIMENTO</div>
                                    <div style="padding: 2px 4px; font-weight: bold;">${dataVencimento}</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr><td style="border-bottom: 1px solid #000; padding: 2px; font-size: 6pt; color: #555;">RESPONSÁVEL</td></tr>
                <tr>
                    <td style="border-bottom: 1px solid #000; padding: 4px; font-weight: bold; line-height: 1.3;">
                        ${up(nomeResponsavel)}<br>${up(endereco)}<br>${up(cidadeEstado)}<br>C.P.F: ${cpfResp}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="border-right: 1px solid #000; width: 50%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">VR. NORMAL</div>
                                    <div style="padding: 2px 4px; font-weight: bold;">R$ ${valor}</div>
                                </td>
                                <td style="width: 50%;">
                                    <div style="font-size: 6pt; color: #555; padding: 2px;">VR. PAGO</div>
                                    <div style="padding: 2px 4px; height: 15px;"></div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>`;
    }

    return `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>Carnê — ${a.nome}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @page { size: A4 portrait; margin: 1cm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f0f0f0; display: flex; justify-content: center; }
            .doc-container { width: 100%; max-width: 800px; background: #fff; padding: 20px; box-sizing: border-box; }
            .grid-carnes { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; }
            @media print {
                body { background: #fff; }
                .doc-container { box-shadow: none; padding: 0; max-width: 100%; }
                .grid-carnes { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            }
        </style>
    </head>
    <body>
        <div class="doc-container">
            <div class="grid-carnes">
                ${parcelasHTML}
            </div>
        </div>
    </body>
    </html>`;
}

// ============================================================
// 15. CARNÊ EM WORD
// ============================================================
async function docCarneWord(a, opcoes) {
    try {
        const response = await fetch('documentos/modelos/carne_novo.docx');
        if (!response.ok) throw new Error("Arquivo carne_novo.docx não encontrado.");
        const arrayBuffer = await response.arrayBuffer();
        const zip = new PizZip(arrayBuffer);
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const resp = getDadosResponsavel(a); 
        const valor = opcoes?.valor || '300,00';
        const anoAtual = new Date().getFullYear();
        
        // 1. Prepara a lista de nomes e séries
        let nomesExibir = [up(a.nome)];
        let seriesExibir = [up(labelTurma(a.turma).split('-')[0].trim())]; // Ex: "1º ANO"
        
        // Adiciona o 2º irmão se existir
        if (opcoes.temIrmao && opcoes.irmao1?.nome && opcoes.irmao1.nome.trim() !== '') {
            nomesExibir.push(up(opcoes.irmao1.nome));
            seriesExibir.push(up(labelTurma(opcoes.irmao1.turma).split('-')[0].trim()));
        }
        
        // Adiciona o 3º irmão se existir
        if (opcoes.temIrmao && opcoes.irmao2?.nome && opcoes.irmao2.nome.trim() !== '') {
            nomesExibir.push(up(opcoes.irmao2.nome));
            seriesExibir.push(up(labelTurma(opcoes.irmao2.turma).split('-')[0].trim()));
        }

        // Junta tudo com " e "
        const nomeFinal = nomesExibir.join(' / ');
        const serieFinal = seriesExibir.join(' / ');
        
        // 2. Pega a letra da turma do aluno principal (ou avisa que é misto)
        const letraTurma = (a.turma || '').slice(-1).toUpperCase();
        
        // 3. Endereço (do aluno principal, pois é o mesmo para todos)
        const ruaCompleta = up(a.endereco || '') + (a.numero_endereco ? `, Nº ${a.numero_endereco}` : '');
        const cidadeEstado = up(a.cidade || '') + '/' + up(a.estado || '');

        const parcelas = [];
        for (let i = 1; i <= 12; i++) {
            const ultimoDia = new Date(anoAtual, i, 0).getDate();
            const mesFormatado = String(i).padStart(2, '0');
            const dataFormatada = `${String(ultimoDia).padStart(2, '0')}/${mesFormatado}/${anoAtual}`;

            parcelas.push({
                // --- ESQUERDA ---
                NOME_ESQ: nomeFinal,
                TURMA_ESQ: letraTurma,
                SERIE_ESQ: serieFinal,
                TURNO_ESQ: up(a.turno || 'DIURNO'),
                PARCELA_ESQ: `${i}/12`,
                DATA_ESQ: dataFormatada,
                NOME_RESP_ESQ: up(resp.nome),
                RUA_ESQ: ruaCompleta,
                BAIRRO_ESQ: up(a.bairro || ''),
                CIDADE_ESQ: cidadeEstado,
                CPF_ESQ: resp.cpf,
                VALOR_ESQ: `R$ ${valor}`,

                // --- DIREITA ---
                NOME_DIR: nomeFinal,
                TURMA_DIR: letraTurma,
                SERIE_DIR: serieFinal,
                TURNO_DIR: up(a.turno || 'DIURNO'),
                PARCELA_DIR: `${i}/12`,
                DATA_DIR: dataFormatada,
                NOME_RESP_DIR: up(resp.nome),
                RUA_DIR: ruaCompleta,
                BAIRRO_DIR: up(a.bairro || ''),
                CIDADE_DIR: cidadeEstado,
                CPF_DIR: resp.cpf,
                VALOR_DIR: `R$ ${valor}`
            });
        }

        doc.render({ parcelas: parcelas });
        return doc.getZip().generate({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

    } catch (error) {
        console.error("Erro ao gerar Carnê Word:", error);
        alert("Erro ao gerar o carnê: " + error.message);
        return null;
    }
}




// ============================================================
// ALIAS
// ============================================================
function docDeclaracaoQuitacaoDebito(a) { return docQuitacaoSimples(a); }
function docDeclaracaoQuitacaoDebitoTabela(a) { return docQuitacaoTabela(a); }

// ============================================================
// MAPA DE DOCUMENTOS
// ============================================================
const DOCUMENTOS_HTML = {
    'Bolsa Família':                       docBolsaFamilia,
    'Bolsa Familia':                       docBolsaFamilia,
    'Declaração de Matrícula':             docDeclaracaoMatricula,
    'Declaracao Matricula':                docDeclaracaoMatricula,
    'Declaração Provisória':               docProvissoria,
    'Provissoria':                         docProvissoria,
    'Transferência':                       docTransferencia,
    'Transferencia':                       docTransferencia,
    'Recibo de Pagamento':                 docReciboPagamento,
    'Recibo Pagamento':                    docReciboPagamento,
    'Ficha Individual':                    docFichaIndividual,
    'Recibo':                              docRecibo,
    'Declaracao Recibo':                   docRecibo,
    'Declaração de Quitação Simples':      docQuitacaoSimples,
    'Declaracao Quitacao Debito':          docQuitacaoSimples,
    'Declaração de Quitação Tabela':       docQuitacaoTabela,
    'Declaracao Quitacao Debito Tabela':   docQuitacaoTabela,
    'Declaração Normal':                   docDeclaracaoNormal,
    'Declaracao Normal':                   docDeclaracaoNormal,
    'Declaração Normal Pai Mae':           docDeclaracaoNormalPaiMae,
    'Declaracao Normal Pai Mae':           docDeclaracaoNormalPaiMae,
    'Pagamento Escolar':                   docPagamentoEscolar,
    'Boletim':                             docBoletim,
    'boletim':                             docBoletim,
    'Carnê':                               docCarne,
    'Carne':                               docCarne
};


// ============================================================
// 16. CONTABILIDADE INDIVIDUAL (HTML PARA IMPRESSÃO)
// ============================================================


function docContabilidade(a, pagamentos) {
    const resp = getDadosResponsavel(a);
    const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    
    let linhasTabela = '';
    mesesNomes.forEach((mes, index) => {
        const numMes = index + 1;
        const isPago = pagamentos.includes(numMes);
        linhasTabela += `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${mes}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center; color: ${isPago ? 'green' : 'red'}; font-weight: bold;">
                    ${isPago ? 'PAGO' : 'PENDENTE'}
                </td>
            </tr>
        `;
    });

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório Financeiro - ${a.nome}</title>
        ${CSS_GLOBAL}
    </head>
    <body>
        <div class="doc-container">
            <h1 class="doc-title">Relatório Financeiro Individual</h1>
            <p><strong>Aluno:</strong> ${up(a.nome)}</p>
            <p><strong>Turma:</strong> ${up(labelTurma(a.turma))}</p>
            <p><strong>Responsável:</strong> ${resp.nome} (CPF: ${resp.cpf})</p>
            <p><strong>Data de Emissão:</strong> ${dataHojeExtenso()}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Mês</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhasTabela}
                </tbody>
            </table>
        </div>
    </body>
    </html>`;
}

// ============================================================
// 17. RELATÓRIO FINANCEIRO GLOBAL (HTML PARA IMPRESSÃO)
// ============================================================
function docRelatorioGlobal(alunos, tipo) {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1; // 1 a 12
    
    let linhas = '';
    alunos.forEach(a => {
        const pagamentos = a.pagamentos || [];
        const isPago = pagamentos.includes(mesAtual);
        
        if (tipo === 'pagos' && isPago) {
            linhas += `<tr><td style="border: 1px solid #ccc; padding: 8px;">${a.nome}</td><td style="border: 1px solid #ccc; padding: 8px;">${labelTurma(a.turma)}</td><td style="border: 1px solid #ccc; padding: 8px; color: green;">PAGO</td></tr>`;
        } else if (tipo === 'pendentes' && !isPago) {
            linhas += `<tr><td style="border: 1px solid #ccc; padding: 8px;">${a.nome}</td><td style="border: 1px solid #ccc; padding: 8px;">${labelTurma(a.turma)}</td><td style="border: 1px solid #ccc; padding: 8px; color: red;">PENDENTE</td></tr>`;
        }
    });

    if (linhas === '') {
        linhas = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Nenhum aluno encontrado.</td></tr>';
    }

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Relatório Global - ${tipo}</title>
        ${CSS_GLOBAL}
    </head>
    <body>
        <div class="doc-container">
            <h1 class="doc-title">Relatório Global de ${tipo === 'pagos' ? 'Pagamentos' : 'Pendências'}</h1>
            <p><strong>Mês Referência:</strong> ${new Date().toLocaleString('pt-BR', { month: 'long' }).toUpperCase()}</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #f0f0f0;">
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Aluno</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Turma</th>
                        <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${linhas}
                </tbody>
            </table>
        </div>
    </body>
    </html>`;
}
