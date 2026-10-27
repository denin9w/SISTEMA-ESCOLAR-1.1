// ============================================================
// templates-docs.js — Modelos de documentos em HTML
// Formatação otimizada e blindada para Word (.doc)
// ============================================================

function labelTurma(t) {
    if (!t) return '';
    const m = t.match(/^(\d)ano-([ab])$/i);
    if (m) return `${m[1]}º Ano ${m[2].toUpperCase()}`;
    const inf = t.match(/^infantil-([IVX]+)-([ab])$/i);
    if (inf) return `Infantil ${inf[1].toUpperCase()} ${inf[2].toUpperCase()}`;
    return t.toUpperCase();
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

// Função auxiliar para evitar "de — e de —" quando o dado está vazio
function dadosPais(a) {
    const pai = a.nome_pai ? up(a.nome_pai) : '_________________________________';
    const mae = a.nome_mae ? up(a.nome_mae) : '_________________________________';
    return { pai, mae };
}

// Função para gerar linha de assinatura perfeita (sem usar _ )
function linhaAssinatura(nome, cargo) {
    return `
    <table style="width: 80%; margin: 50px auto 0 auto; border: none; text-align: center;">
        <tr>
            <td style="border: none; border-bottom: 1px solid #000; padding-bottom: 2px;">&nbsp;</td>
        </tr>
        <tr>
            <td style="border: none; padding-top: 5px; font-size: 13px;">
                <strong>${nome}</strong><br>${cargo}
            </td>
        </tr>
    </table>`;
}

// --- CSS embutido ---
const CSS_INLINE = `
<style>
* { box-sizing: border-box; }
body { font-family: Arial, Helvetica, sans-serif; color: #222; background: #f5f5f5; margin: 0; padding: 20px; line-height: 1.5; }
.doc { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); font-size: 14px; }
.doc-header { text-align: center; border-bottom: 2px solid #003869; padding-bottom: 10px; margin-bottom: 20px; }
.doc-header h1 { font-size: 18px; margin: 0 0 4px 0; color: #003869; }
.doc-header h2 { font-size: 12px; margin: 2px 0; font-weight: normal; }
.doc-header p  { font-size: 11px; margin: 2px 0; }
.doc-title { text-align: center; font-size: 16px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }
.doc-body p { margin: 10px 0; text-align: justify; }
.doc-body strong { color: #003869; }
.doc-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
.doc-table th, .doc-table td { border: 1px solid #333; padding: 5px; text-align: center; }
.doc-table th { background: #eef3f8; color: #003869; }
.doc-table .left { text-align: left; padding-left: 8px; }
@media print {
    body { background: #fff; padding: 0; }
    .doc { box-shadow: none; max-width: 100%; padding: 20px; }
    @page { margin: 1.5cm; }
}
</style>`;

// --- Cabeçalho padrão ---
function headerPadrao() {
    return `
    <div class="doc-header">
        <h1>CENTRO EDUCACIONAL JARDIM DO ÉDEN</h1>
        <p>Rua Clementino Ricardo de Souza, 134 — Severiano Moraes Filho</p>
        <p>Fone: (87) 98114-9883 — Cadastro Escolar P-459-058 — CNPJ 05.198.663/0001-86</p>
        <p>Portaria nº 220 D.O.E. 22/01/2004 — Portaria nº 4160 D.O.E. 06/06/2011</p>
        <p>CEP: 552900 — Garanhuns — Pernambuco</p>
    </div>`;
}

// ============================================================
// 1) BOLSA FAMÍLIA
// ============================================================
function docBolsaFamilia(a) {
    const p = dadosPais(a);
    const cidadeNasc = a.cidade_nascimento ? up(a.cidade_nascimento) : '___________________';
    const estadoNasc = a.estado ? up(a.estado) : '__';
    const cidadeRes = a.cidade ? up(a.cidade) : '___________________';
    const estadoRes = a.estado ? up(a.estado) : '__';

    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Bolsa Família — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração</h2>
        <div class="doc-body">
            <table style="width:100%; border:none; border-collapse:collapse; font-size:14px; text-align:justify; line-height:1.6;">
                <tr><td style="border:none; padding:0;">
                    Declaro para os devidos fins que o(a) Estudante <strong>${up(a.nome)}</strong>, filho(a) de <strong>${p.pai}</strong> e de <strong>${p.mae}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, natural de <strong>${cidadeNasc}</strong>, estado <strong>${estadoNasc}</strong>, residente no município de <strong>${cidadeRes}</strong>, Estado <strong>${estadoRes}</strong>, está matriculado(a) nesta Unidade de Ensino no <strong>${labelTurma(a.turma)}</strong> do(a) ENSINO FUNDAMENTAL I TARDE.
                </td></tr>
            </table>
            <br><br>
            <p style="text-align:center;">Garanhuns, ${dataHojeExtenso()}.</p>
            ${linhaAssinatura('Márcia de Souza', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 2) TRANSFERÊNCIA (HISTÓRICO)
// ============================================================
function docTransferencia(a) {
    const materias = ['Língua Portuguesa','História','Geografia','Arte','Ciências','Matemática','Educação Física','Ensino Religioso','Gramática','Leitura','Língua Estrangeira - Inglês','Cidadania','Redação'];
    let cabecalhoMaterias = materias.map(m => `<th style="font-size:10px;">${m}</th>`).join('');
    let linhas = '';
    for (let ano = 0; ano < 9; ano++) {
        let celulasNotas = materias.map(() => `<td>--</td>`).join('');
        linhas += `<tr><td>${ano+1}º ANO<br><small>Ano: ____</small></td>${celulasNotas}<td>--</td><td>--</td><td>____</td><td>____</td><td>____</td><td>____</td></tr>`;
    }
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Histórico — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc" style="font-size:11px;">
        ${headerPadrao()}
        <h2 class="doc-title">Histórico Escolar do Ensino Fundamental</h2>
        <div class="doc-body">
            <p><strong>Certificamos que:</strong> ${up(a.nome)}</p>
            <p><strong>Filiação:</strong> ${up(a.nome_pai || '—')} e ${up(a.nome_mae || '—')}</p>
            <p><strong>Nascido em:</strong> ${dataBR(a.data_nascimento)} &nbsp;&nbsp; <strong>Natural de:</strong> ${up(a.cidade_nascimento || '—')} — ${up(a.estado || '—')}</p>
            <p><strong>Nacionalidade:</strong> ${up(a.nacionalidade || 'BRASILEIRA')} &nbsp;&nbsp; <strong>RG:</strong> ${a.rg || 'XXXXX'} &nbsp;&nbsp; <strong>CPF:</strong> ${a.cpf || 'XXXXX'}</p>
            <p><strong>Concluiu o 1º ANO</strong> do Ensino Fundamental, nos termos da Lei Federal 9.394 de 20 de dezembro de 1996.</p>
            <table class="doc-table" style="font-size:10px;">
                <thead><tr><th style="width:60px;">SÉRIE/ANO</th>${cabecalhoMaterias}<th>CH</th><th>Freq.</th><th>Horas</th><th>Dias</th><th>Resultado</th></tr></thead>
                <tbody>${linhas}</tbody>
            </table>
            <p style="margin-top:30px;text-align:center;">Garanhuns, ${dataHojeExtenso()}.</p>
            <table style="width:100%; margin-top:40px; border:none; text-align:center;">
                <tr>
                    <td style="border:none; width:50%;">${linhaAssinatura('', 'Secretário(a)')}</td>
                    <td style="border:none; width:50%;">${linhaAssinatura('', 'Gestor(a)')}</td>
                </tr>
            </table>
        </div>
    </div></body></html>`;
}

// ============================================================
// 3) DECLARAÇÃO DE MATRÍCULA
// ============================================================
function docDeclaracaoMatricula(a) {
    const p = dadosPais(a);
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Declaração de Matrícula — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins de justificativa que o aluno(a) <strong>${up(a.nome)}</strong>, nascido em <strong>${dataBR(a.data_nascimento)}</strong>, filho de <strong>${p.pai}</strong> e <strong>${p.mae}</strong>, o mesmo(a) está devidamente matriculado neste estabelecimento de ensino cursando o <strong>${labelTurma(a.turma)} DO EDUCAÇÃO INFANTIL I MANHÃ</strong>.</p>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 4) DECLARAÇÃO PROVISÓRIA
// ============================================================
function docProvissoria(a) {
    const p = dadosPais(a);
    const cidadeNasc = a.cidade_nascimento ? up(a.cidade_nascimento) : '___________________';
    const estadoNasc = a.estado ? up(a.estado) : '__';
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Provisória — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração Provisória de Transferência</h2>
        <div class="doc-body">
            <p>Declaramos que o aluno(a) <strong>${up(a.nome)}</strong>, filho(a) de <strong>${p.pai}</strong> e de <strong>${p.mae}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, natural de <strong>${cidadeNasc}</strong>, Estado de <strong>${estadoNasc}</strong>, tem direito a matrícula no <strong>${labelTurma(a.turma)}</strong> do Ensino Fundamental.</p>
            <p>Desde que obteve nos períodos anteriores os seguintes resultados:</p>
            <p style="margin-left:20px;">( X ) aprovação &nbsp;&nbsp; ( &nbsp; ) reprovação &nbsp;&nbsp; ( &nbsp; ) cursando</p>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 5) RECIBO DE PAGAMENTO
// ============================================================
function docReciboPagamento(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Recibo de Pagamento — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Recibo de Pagamento</h2>
        <div class="doc-body">
            <p>Eu, <strong>MARCIA DE SOUZA</strong>, responsável pela Escola <strong>CENTRO EDUCACIONAL JARDIM DO ÉDEN</strong>, localizada em Garanhuns, Rua Clementino Ricardo de Souza, N° 134, Bairro Severiano Moraes Filho, declaro que recebemos do Sr. <strong>${up(nomeResp)}</strong>, responsável financeiro pelo(a) aluno(a) <strong>${up(a.nome)}</strong>, a quantia de <strong>1.750,00 reais (mil setecentos e cinquenta reais)</strong> referente ao pagamento de mensalidades, conforme detalhado abaixo:</p>
            <ul><li>Mensalidades do ano letivo: (250,00)</li><li>Taxa de Matrícula: (250,00)</li></ul>
            <p><strong>Valor Total Pago: 1.750,00 (mil setecentos e cinquenta reais)</strong></p>
            <p>Este recibo é válido como comprovante de pagamento integral das despesas educacionais durante o ano na Escola CENTRO EDUCACIONAL JARDIM DO ÉDEN.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('Assinatura', '')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 6) FICHA INDIVIDUAL DO ALUNO
// ============================================================
function docFichaIndividual(a) {
    const materias = ['Língua Portuguesa e Literatura','História','Geografia','Ciências','Matemática','Educação Física','Inglês','Arte','Cidadania'];
    let linhas = '';
    materias.forEach(m => { linhas += `<tr><td class="left">${m}</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`; });
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Ficha Individual — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Ficha Individual do Aluno</h2>
        <div class="doc-body">
            <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:10px;">
                <tr>
                    <td style="border:none; padding:2px;"><strong>Aluno(a):</strong> ${up(a.nome)}</td>
                    <td style="border:none; padding:2px;"><strong>Data de Nascimento:</strong> ${dataBR(a.data_nascimento)}</td>
                </tr>
                <tr>
                    <td style="border:none; padding:2px;"><strong>Ano:</strong> ${new Date().getFullYear()}</td>
                    <td style="border:none; padding:2px;"><strong>Série:</strong> ${labelTurma(a.turma)} &nbsp;&nbsp; <strong>Turma:</strong> ${(a.turma || '').slice(-1).toUpperCase()}</td>
                </tr>
            </table>
            
            <table class="doc-table"><thead>
                <tr><th rowspan="2" class="left">Disciplina</th><th colspan="4">1º Semestre</th><th colspan="4">2º Semestre</th></tr>
                <tr><th>I Un.</th><th>II Un.</th><th>Rec.</th><th>Média</th><th>III Un.</th><th>IV Un.</th><th>Rec.</th><th>Média</th></tr>
            </thead><tbody>${linhas}</tbody></table>
            <p style="margin-top:15px;">APROVADO( &nbsp; ) &nbsp; REPROVADO( &nbsp; ) &nbsp; CURSANDO( X ) &nbsp; DESISTENTE( &nbsp; )</p>
            <p><strong>Percentual de Frequência:</strong> ____% &nbsp;&nbsp; <strong>Carga Horária Anual:</strong> 800h &nbsp;&nbsp; <strong>Dias Letivos:</strong> 200</p>
            ${linhaAssinatura('', 'Direção')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 7) RECIBO
// ============================================================
function docRecibo(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Recibo — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Recibo</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins de justificativa que o senhor(a) <strong>${up(nomeResp)}</strong> efetuou o pagamento da matrícula escolar do mês de janeiro do aluno(a) <strong>${up(a.nome)}</strong> no valor de R$ 300,00 (Trezentos reais).</p>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para quaisquer esclarecimentos.</p>
            <p>Atenciosamente a Direção</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('Márcia de Souza', '')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 8) DECLARAÇÃO DE QUITAÇÃO SIMPLES
// ============================================================
function docQuitacaoSimples(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Quitação — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração de Quitação de Débito</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins de justificativa que o senhor(a) <strong>${up(nomeResp)}</strong> efetuou o pagamento das mensalidades escolares do ano letivo de <strong>${new Date().getFullYear()}</strong> do(a) aluno(a) <strong>${up(a.nome)}</strong>.</p>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para quaisquer esclarecimentos.</p>
            <p>Atenciosamente a Direção</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 9) DECLARAÇÃO DE QUITAÇÃO TABELA
// ============================================================
function docQuitacaoTabela(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    const ano = new Date().getFullYear();
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    let linhas = ''; let total = 0;
    meses.forEach((m, i) => { const valor = 250; total += valor; linhas += `<tr><td>${String(i+1).padStart(2,'0')}/${ano}</td><td>${valor.toFixed(2).replace('.',',')} R$</td></tr>`; });
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Quitação Tabela — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração de Quitação de Débito</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins de justificativa que o senhor(a) <strong>${up(nomeResp)}</strong> responsável pelo(a) aluno(a) <strong>${up(a.nome)}</strong> efetuou o pagamento das mensalidades escolares do ano letivo de <strong>${ano}</strong> no valor total de <strong>${total.toFixed(2).replace('.',',')} R$</strong>.</p>
            <table class="doc-table"><thead><tr><th>Mês</th><th>Valor</th></tr></thead><tbody>${linhas}<tr><th>Total</th><th>${total.toFixed(2).replace('.',',')} R$</th></tr></tbody></table>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para quaisquer esclarecimentos.</p>
            <p>Atenciosamente a Direção</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 10) DECLARAÇÃO NORMAL
// ============================================================
function docDeclaracaoNormal(a) {
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Declaração — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins que o(a) aluno(a) <strong>${up(a.nome)}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, encontra-se regularmente matriculado(a) neste estabelecimento de ensino, cursando o <strong>${labelTurma(a.turma)}</strong>.</p>
            <p>Sem mais para o momento, agradeço e coloco-me ao inteiro dispor.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 11) DECLARAÇÃO NORMAL COM NOME DO PAI E DA MÃE
// ============================================================
function docDeclaracaoNormalPaiMae(a) {
    const p = dadosPais(a);
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Declaração — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins que o(a) aluno(a) <strong>${up(a.nome)}</strong>, filho(a) de <strong>${p.pai}</strong> e de <strong>${p.mae}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, encontra-se regularmente matriculado(a) neste estabelecimento de ensino, cursando o <strong>${labelTurma(a.turma)}</strong>.</p>
            <p>Sem mais para o momento, agradeço e coloco-me ao inteiro dispor.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 12) DECLARAÇÃO DE PROFESSOR QUE SAIU
// ============================================================
function docProfessorSaiu(a) {
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Declaração Professor</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins de justificativa que <strong>${up(a.nome_pai || a.nome_mae || '—')}</strong> trabalhou em nosso estabelecimento de ensino exercendo a função de professor(a) regente.</p>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para qualquer dúvida ou esclarecimento.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 13) PAGAMENTO ESCOLAR
// ============================================================
function docPagamentoEscolar(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Pagamento Escolar — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Declaração de Pagamento Escolar</h2>
        <div class="doc-body">
            <p>Declaro para os devidos fins que o(a) Sr(a). <strong>${up(nomeResp)}</strong>, responsável pelo(a) aluno(a) <strong>${up(a.nome)}</strong>, efetuou o pagamento das mensalidades escolares referentes ao ano letivo de <strong>${new Date().getFullYear()}</strong>.</p>
            <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor.</p>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'DIRETORA')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 14) BOLETIM
// ============================================================
function docBoletim(a) {
    const materias = [
        { nome: 'Português', id: 'portugues' }, { nome: 'Matemática', id: 'matematica' },
        { nome: 'História', id: 'historia' }, { nome: 'Geografia', id: 'geografia' },
        { nome: 'Ciências', id: 'ciencias' }, { nome: 'Ed. Física', id: 'ed_fisica' },
        { nome: 'Inglês', id: 'ingles' }, { nome: 'Arte', id: 'arte' },
        { nome: 'Ética e Cidadania', id: 'etica' }
    ];
    let linhas = '';
    materias.forEach(mat => {
        const b1 = a[`b1_${mat.id}`] || '-'; const b2 = a[`b2_${mat.id}`] || '-';
        const b3 = a[`b3_${mat.id}`] || '-'; const b4 = a[`b4_${mat.id}`] || '-';
        const mdf = a[`mdf_${mat.id}`] || '-'; const st = a[`status_${mat.id}`] || '-';
        linhas += `<tr><td class="left">${mat.nome}</td><td>${b1}</td><td>${b2}</td><td>${b3}</td><td>${b4}</td><td><strong>${mdf}</strong></td><td><strong>${st}</strong></td></tr>`;
    });
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Boletim — ${a.nome}</title>${CSS_INLINE}</head><body>
    <div class="doc">
        ${headerPadrao()}
        <h2 class="doc-title">Boletim de Notas ${new Date().getFullYear()}</h2>
        <div class="doc-body">
            <p><strong>Aluno(a):</strong> ${up(a.nome)}</p>
            <p><strong>Turma:</strong> ${labelTurma(a.turma)} &nbsp;&nbsp; <strong>Matrícula:</strong> ${a.numero_matricula || '---'}</p>
            <table class="doc-table"><thead><tr><th class="left">Disciplina</th><th>1º Bim</th><th>2º Bim</th><th>3º Bim</th><th>4º Bim</th><th>Média Final</th><th>Resultado</th></tr></thead>
            <tbody>${linhas}</tbody></table>
            <p style="margin-top:40px;text-align:center;">Garanhuns, ${dataHojeExtenso()}</p>
            ${linhaAssinatura('', 'Assinatura da Direção')}
        </div>
    </div></body></html>`;
}

// ============================================================
// 15 e 16) ALIAS
// ============================================================
function docDeclaracaoQuitacaoDebito(a) { return docQuitacaoSimples(a); }
function docDeclaracaoQuitacaoDebitoTabela(a) { return docQuitacaoTabela(a); }

// ============================================================
// MAPA
// ============================================================
const DOCUMENTOS_HTML = {
    'Bolsa Família':                       docBolsaFamilia,
    'Bolsa Familia':                       docBolsaFamilia,
    'Transferência':                       docTransferencia,
    'Transferencia':                       docTransferencia,
    'Declaração de Matrícula':             docDeclaracaoMatricula,
    'Declaracao Matricula':                docDeclaracaoMatricula,
    'Declaração Provisória':               docProvissoria,
    'Provissoria':                         docProvissoria,
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
    'Declaração de Professor que Saiu':    docProfessorSaiu,
    'Declaracao Professor Saiu':           docProfessorSaiu,
    'Pagamento Escolar':                   docPagamentoEscolar,
    'Boletim':                             docBoletim,
    'boletim':                             docBoletim
};