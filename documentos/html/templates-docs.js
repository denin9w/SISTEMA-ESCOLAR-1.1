// ============================================================
// templates-docs.js — Modelos de documentos em HTML (COMPLETO)
// ============================================================

function labelTurma(t) {
    if (!t) return '';
    const m = t.match(/^(\d)ano-([ab])$/i);
    if (m) return `${m[1]}º ANO ${m[2].toUpperCase()}`;
    const inf = t.match(/^infantil-([IVX]+)-([ab])$/i);
    if (inf) return `INFANTIL ${inf[1].toUpperCase()} ${inf[2].toUpperCase()}`;
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

function dadosPais(a) {
    const pai = a.nome_pai ? up(a.nome_pai) : '_________________________________';
    const mae = a.nome_mae ? up(a.nome_mae) : '_________________________________';
    return { pai, mae };
}

// --- CSS GLOBAL ---
const CSS_GLOBAL = `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @page { size: A4 portrait; margin: 2cm; }
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt; 
            color: #000; 
            margin: 0; 
            padding: 20px; 
            background: #f0f0f0; 
            display: flex; 
            justify-content: center; 
        }
        .doc-container { 
            width: 100%; 
            max-width: 800px; 
            background: #fff; 
            padding: 40px; 
            box-shadow: 0 0 10px rgba(0,0,0,0.1); 
            box-sizing: border-box;
        }
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

function headerPadraoBordado() {
    return `
    <table style="width: 100%; border: 2px solid #000; border-collapse: collapse; text-align: center; font-family: Arial, sans-serif; margin-bottom: 30px;">
        <tr>
            <td style="border-bottom: 1px solid #000; padding: 10px 5px 5px 5px;">
                <img src="../../imagens/logo.png" alt="Logo CEJE" style="width: 70px; margin-bottom: 5px;"><br>
                <h1 style="font-size: 16pt; margin: 0; font-weight: bold; font-family: 'Times New Roman', Times, serif;">CENTRO EDUCACIONAL JARDIM DO ÉDEN</h1>
            </td>
        </tr>
        <tr>
            <td style="padding: 8px; font-size: 9pt; line-height: 1.4;">
                Rua: Clementino Ricardo de Souza, 134 — Severiano Moraes Filho<br>
                Fone: (87) 98114-9883 — CNPJ 05.198.663/0001-86<br>
                Portaria nº 220 D.O.E. 22/01/2004 — Portaria nº 4160 D.O.E. 06/06/2011<br>
                CEP: 552900 — Garanhuns — Pernambuco
            </td>
        </tr>
    </table>`;
}

function linhaAssinatura(nome, cargo) {
    return `
    <table style="width: 100%; border: none; margin-top: 60px; text-align: center;">
        <tr><td style="border: none; border-bottom: 1px solid #000; width: 60%; max-width: 300px;">&nbsp;</td></tr>
        <tr><td style="border: none; padding-top: 5px; font-size: 12pt;">${nome ? `<strong>${nome}</strong><br>` : ''}${cargo}</td></tr>
    </table>`;
}

function getWordHead(title) {
    return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${CSS_GLOBAL}
    </head>
    <body>
        <div class="doc-container">
            <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                    <td style="border: none; padding: 0;">`;
}

function footerPadrao() {
    return `
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>`;
}

// ============================================================
// DOCUMENTOS
// ============================================================

function docBolsaFamilia(a) {
    const p = dadosPais(a);
    return `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>Declaração — ${a.nome}</title>
        ${CSS_GLOBAL}
        <style> @page { size: A4; margin: 3cm 2cm; } </style>
    </head>
    <body>
        <div class="doc-container">
            <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                    <td style="border: none; padding: 0;">
                        <table style="width: 100%; border: 2px solid #000; border-collapse: collapse; text-align: center; font-family: Arial, sans-serif; margin-bottom: 40px;">
                            <tr>
                                <td style="padding: 10px 5px 5px 5px;">
                                    <img src="../../imagens/logo.png" alt="Logo CEJE" style="width: 70px; margin-bottom: 5px;"><br>
                                    <h1 style="font-size: 18pt; margin: 0; font-family: 'Times New Roman', Times, serif;">CENTRO EDUCACIONAL JARDIM DO ÉDEN</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 0 5px 10px 5px; font-size: 9pt; line-height: 1.3;">
                                    <strong>Rua Clementino Ricardo de Souza 134 – Severiano Moraes Filho fone: (87) 98114-9883</strong><br>
                                    <strong>Cadastro Escolar P – 459-058 __ CNPJ 05198.663/0001 -86</strong><br>
                                    <div style="margin-top: 5px;">
                                        <span style="display:inline-block; width: 150px; text-align:left;">P – Nº 220</span><span style="display:inline-block; width: 200px; text-align:left;">D.O.E. de 22 / 01 / 2004</span>
                                    </div>
                                    <div>
                                        <span style="display:inline-block; width: 150px; text-align:left;">P – Nº 4160</span><span style="display:inline-block; width: 200px; text-align:left;">D.O.E. de 06 / 06 / 2011</span>
                                    </div>
                                    <strong>CEP: 552900 __ Garanhuns __ Pernambuco</strong>
                                </td>
                            </tr>
                        </table>

                        <div style="text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 50px;">DECLARAÇÃO</div>

                        <div style="display: flex; justify-content: center;">
                            <div style="width: 100%; text-align: justify; line-height: 2;">
                                Declaro para os devidos fins que o(a) Estudante <strong>${up(a.nome)}</strong>, filho(a) de 
                                <strong>${p.pai}</strong> e de <strong>${p.mae}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, 
                                natural de <strong>${up(a.cidade_nascimento || '—')}</strong>, estado <strong>${up(a.estado || '—')}</strong>, 
                                residente no município de <strong>${up(a.cidade || '—')}</strong>, Estado <strong>${up(a.estado || '—')}</strong>, 
                                está matriculado(a) nesta Unidade de Ensino no <strong>${labelTurma(a.turma)} do(a) EDUCAÇÃO INFANTIL I MANHÃ</strong>.
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 80px;">Garanhuns, ${dataHojeExtenso()}.</div>

                        <table style="width: 100%; border: none; margin-top: 60px; text-align: center;">
                            <tr><td style="border: none; border-bottom: 1px solid #000; width: 60%;">&nbsp;</td></tr>
                            <tr><td style="border: none; padding-top: 5px; font-size: 11pt;">Marcia de Souza<br>DIRETORA</td></tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>`;
}

function docBoletim(a) {
    const materias = [
        { nome: 'Português', id: 'portugues' }, { nome: 'História', id: 'historia' },
        { nome: 'Geografia', id: 'geografia' }, { nome: 'Ciências', id: 'ciencias' },
        { nome: 'Matemática', id: 'matematica' }, { nome: 'Educação Física', id: 'ed_fisica' },
        { nome: 'Inglês', id: 'ingles' }, { nome: 'Arte', id: 'arte' },
        { nome: 'Cidadania', id: 'etica' }
    ];
    
    let linhas = '';
    materias.forEach(mat => {
        const b1 = a[`b1_${mat.id}`] || '-'; const b2 = a[`b2_${mat.id}`] || '-';
        const b3 = a[`b3_${mat.id}`] || '-'; const b4 = a[`b4_${mat.id}`] || '-';
        const mdf = a[`mdf_${mat.id}`] || '-'; const st = a[`status_${mat.id}`] || '-';
        linhas += `<tr>
            <td style="border: 1px solid #000; padding: 4px;">${mat.nome}</td>
            <td style="border: 1px solid #000; padding: 4px;"><strong>${b1}</strong></td>
            <td style="border: 1px solid #000; padding: 4px;">${b2}</td>
            <td style="border: 1px solid #000; padding: 4px;">${b3}</td>
            <td style="border: 1px solid #000; padding: 4px;">${b4}</td>
            <td style="border: 1px solid #000; padding: 4px;"><strong>${mdf}</strong></td>
            <td style="border: 1px solid #000; padding: 4px;"><strong>${st}</strong></td>
        </tr>`;
    });

    return `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>Boletim — ${a.nome}</title>
        ${CSS_GLOBAL}
        <style> @page { size: A4 landscape; margin: 1.5cm; } .doc-container { max-width: 1000px; } </style>
    </head>
    <body>
        <div class="doc-container">
            <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                    <td style="border: none; padding: 0;">
                        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 5px;">
                            <tr>
                                <td style="width: 120px; text-align: center; border-right: 1px solid #000; padding: 5px;">
                                    <img src="../../imagens/logo.png" alt="Logo CEJE" style="width: 80px;"><br>
                                    <div style="font-size: 7pt; margin-top: 5px;">UMA ESCOLA DE GERAÇÕES</div>
                                </td>
                                <td style="padding: 10px; text-align: left; font-family: Arial, sans-serif;">
                                    <h2 style="margin: 0; font-size: 14pt; font-weight: bold;">ESCOLA CENTRO EDUCACIONAL JARDIM DO ÉDEN</h2>
                                    <h3 style="margin: 2px 0; font-size: 11pt; font-weight: bold;">EDUCAÇÃO INFANTIL E ENSINO FUNDAMENTAL DO 1º AO 9º ANO</h3>
                                    <h3 style="margin: 2px 0; font-size: 12pt; font-weight: bold;">BOLETIM DE NOTAS <span style="margin-left: 20px;">${new Date().getFullYear()}</span></h3>
                                    <div style="font-size: 11pt; font-weight: bold; margin-top: 5px;">
                                        Nome: <u>${up(a.nome)}</u> &nbsp;&nbsp; Turma: <u>ÚNICA</u> &nbsp;&nbsp; Série: <u>${labelTurma(a.turma)}</u>
                                    </div>
                                </td>
                            </tr>
                        </table>

                        <div class="table-responsive">
                            <table style="width: 100%; border-collapse: collapse; text-align: center; font-family: Arial, sans-serif; font-size: 11pt;">
                                <thead>
                                    <tr>
                                        <th rowspan="2" style="border: 1px solid #000; padding: 5px; width: 25%;">Disciplina</th>
                                        <th colspan="4" style="border: 1px solid #000; padding: 5px;">Unidade</th>
                                        <th rowspan="2" style="border: 1px solid #000; padding: 5px; width: 12%;">MÉDIA<br>FINAL</th>
                                        <th rowspan="2" style="border: 1px solid #000; padding: 5px; width: 15%;">RESULTADO</th>
                                    </tr>
                                    <tr>
                                        <th style="border: 1px solid #000; padding: 5px;">1º Bimestre</th>
                                        <th style="border: 1px solid #000; padding: 5px;">2º Bimestre</th>
                                        <th style="border: 1px solid #000; padding: 5px;">3º Bimestre</th>
                                        <th style="border: 1px solid #000; padding: 5px;">4º Bimestre</th>
                                    </tr>
                                </thead>
                                <tbody>${linhas}</tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>`;
}

function docTransferencia(a) {
    const materias = ['Língua Portuguesa','História','Geografia','Arte','Ciências','Matemática','Educação Física','Ensino Religioso','Gramática','Leitura','Língua Estrangeira','Cidadania','Redação'];
    
    let cabecalhoMaterias = materias.map(m => `<th style="border: 1px solid #000; padding: 2px; font-size: 6pt; writing-mode: vertical-rl; transform: rotate(180deg); height: 80px; width: 30px;">${m.toUpperCase()}</th>`).join('');
    
    let linhas = '';
    for (let ano = 0; ano < 8; ano++) {
        let celulasNotas = materias.map(() => `<td style="border: 1px solid #000; padding: 2px;">--</td>`).join('');
        linhas += `<tr>
            <td style="border: 1px solid #000; padding: 2px; text-align: center; font-size: 8pt;">
                ( &nbsp; ) ${ano+1}º ANO<br>Ano: ____
            </td>
            ${celulasNotas}
            <td style="border: 1px solid #000; padding: 2px;">--</td>
            <td style="border: 1px solid #000; padding: 2px;">--</td>
            <td style="border: 1px solid #000; padding: 2px;">____</td>
            <td style="border: 1px solid #000; padding: 2px;">____</td>
            <td style="border: 1px solid #000; padding: 2px;">____</td>
            <td style="border: 1px solid #000; padding: 2px;">____</td>
        </tr>`;
    }

    return `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>Histórico — ${a.nome}</title>
        ${CSS_GLOBAL}
        <style> @page { size: A4 portrait; margin: 1cm; } </style>
    </head>
    <body>
        <div class="doc-container">
            <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                    <td style="border: none; padding: 0;">
                        <div style="text-align: center; margin-bottom: 10px;">
                            <img src="../../imagens/logo.png" alt="Logo CEJE" style="width: 80px;"><br>
                            <div style="font-size: 8pt; margin-top: 5px;">UMA ESCOLA DE GERAÇÕES</div>
                        </div>

                        <table style="width: 100%; border: 2px solid #000; border-collapse: collapse; margin-bottom: 5px;">
                            <tr>
                                <td style="border-bottom: 1px solid #000; text-align: center; padding: 5px;">
                                    <h1 style="font-size: 16pt; margin: 0; font-family: 'Times New Roman', Times, serif;">CENTRO EDUCACIONAL JARDIM DO ÉDEN</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="border-bottom: 1px solid #000; text-align: center; padding: 2px; font-size: 9pt;">
                                    RUA: CLEMENTINO RICARDO DE SOUZA N° 132 &nbsp;&nbsp; Cidade: GARANHUNS &nbsp;&nbsp; UF: PE
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 5px;">
                                    <table style="width: 100%; border: none; font-size: 9pt;">
                                        <tr>
                                            <td style="border: none; text-align: left;">Autorização de Funcionamento: P – Nº 220</td>
                                            <td style="border: none; text-align: right;">D.O.E. de 22 / 01 / 2004</td>
                                        </tr>
                                        <tr>
                                            <td style="border: none; text-align: left;">P – Nº 4160</td>
                                            <td style="border: none; text-align: right;">D.O.E. de 06 / 06 / 2011</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="border: 1px solid #000; padding: 5px 30px; font-weight: bold; font-size: 10pt;">Cadastro Escolar: P – 459 - 058</span>
                        </div>

                        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin-bottom: 10px; font-family: 'Times New Roman', Times, serif;">
                            <tr>
                                <td style="border-bottom: 1px solid #000; text-align: center; padding: 5px; font-weight: bold; font-size: 11pt;">Histórico Escolar do Ensino Fundamental</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-size: 11pt; line-height: 1.8;">
                                    <p style="margin: 2px 0;">Certificamos que: <strong>${up(a.nome)}</strong></p>
                                    <p style="margin: 2px 0;">Filiação: <strong>${up(a.nome_pai || '—')}</strong> e de <strong>${up(a.nome_mae || '—')}</strong></p>
                                    <p style="margin: 2px 0;">Nascido em: <strong>${dataBR(a.data_nascimento)}</strong> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Natural de: <strong>${up(a.cidade_nascimento || '—')}</strong> &nbsp;&nbsp;&nbsp;&nbsp; UF: <strong>${up(a.estado || '—')}</strong></p>
                                    <p style="margin: 2px 0;">Nacionalidade: <strong>BRASILEIRA</strong> &nbsp;&nbsp;&nbsp;&nbsp; RG: <strong>${a.rg || 'XXXXX'}</strong> &nbsp;&nbsp;&nbsp;&nbsp; CPF: <strong>${a.cpf || 'XXXXX'}</strong></p>
                                    <p style="margin: 2px 0;"><strong>Concluiu o 1º ANO</strong> do Ensino Fundamental, nos termos da Lei Federal 9.394 de 20 de dezembro 1996.</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="border-top: 1px solid #000; text-align: center; padding: 5px; font-weight: bold; font-size: 11pt;">INFORMAÇÕES COMPLEMENTARES</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-size: 10pt; line-height: 1.5;">
                                    <p style="margin: 2px 0;">1- O mínimo exigido para promoção é 6,0(seis) e 75% de frequência do total de horas letivas</p>
                                    <p style="margin: 2px 0;">Formas de acesso: ( &nbsp; ) Classificação &nbsp;&nbsp; ( &nbsp; ) Reclassificação &nbsp;&nbsp; Base Legal: Artigo 23 e 24 da Lei Federal Nº 9.394/96:</p>
                                    <p style="text-align: center; margin: 2px 0;">Série ( &nbsp; ) &nbsp;&nbsp; ano ( X ) &nbsp;&nbsp; Fase ( &nbsp; ) &nbsp;&nbsp; Ciclo / Ano ( &nbsp; )</p>
                                    <p style="margin: 2px 0;">1- Dispensa de Ensino Religioso: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ( &nbsp;X&nbsp; ) Sim &nbsp;&nbsp; ( &nbsp; ) Não</p>
                                    <p style="margin: 2px 0;">Base Legal:</p>
                                    <p style="margin: 2px 0;">4- Dispensa de Educação Física: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ( &nbsp; ) Sim &nbsp;&nbsp; ( &nbsp;X&nbsp; ) Não</p>
                                    <p style="margin: 2px 0;">Base Legal: ___________________________________________________________________________.</p>
                                    <p style="margin-top: 10px;">Observação:</p>
                                    <div style="border-bottom: 1px solid #000; width: 100%; height: 15px;"></div>
                                    <div style="border-bottom: 1px solid #000; width: 100%; height: 15px; margin-top: 5px;"></div>
                                </td>
                            </tr>
                        </table>

                        <div style="text-align: center; font-size: 12pt; font-weight: bold; font-family: 'Times New Roman', Times, serif; margin: 20px 0;">CERTIFICADO E HISTÓRICO ESCOLAR DO ENSINO FUNDAMENTAL</div>

                        <div class="table-responsive">
                            <table style="width: 100%; border-collapse: collapse; text-align: center; font-family: Arial, sans-serif; font-size: 8pt;">
                                <thead>
                                    <tr>
                                        <th colspan="15" style="border: 1px solid #000; padding: 2px;">BASE CURRICULAR COMUM</th>
                                        <th colspan="4" style="border: 1px solid #000; padding: 2px;">PARTE DIVERSIFICADA</th>
                                    </tr>
                                    <tr>
                                        <th style="border: 1px solid #000; padding: 2px;">SÉRIE / ANO</th>
                                        <th style="border: 1px solid #000; padding: 2px;">COMPONENTES CURRICULARES</th>
                                        ${cabecalhoMaterias}
                                    </tr>
                                </thead>
                                <tbody>${linhas}</tbody>
                            </table>
                        </div>

                        <div style="text-align: center; margin-top: 20px; font-size: 10pt; font-weight: bold;">Garanhuns, ${dataHojeExtenso()}.</div>

                        <table style="width: 100%; border: none; margin-top: 30px; font-size: 10pt;">
                            <tr>
                                <td style="border: none; text-align: center; width: 50%;">
                                    <div style="border-bottom: 1px solid #000; width: 80%; margin: 0 auto;">&nbsp;</div>
                                    Secretário(a)<br>Autorização nº<br>Carimbo
                                </td>
                                <td style="border: none; text-align: center; width: 50%;">
                                    <div style="border-bottom: 1px solid #000; width: 80%; margin: 0 auto;">&nbsp;</div>
                                    Gestor(a)<br>Autorização nº<br>Carimbo
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </body>
    </html>`;
}

function docDeclaracaoMatricula(a) {
    const p = dadosPais(a);
    return `${getWordHead('Declaração de Matrícula')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO</div>
        <p>Declaro para os devidos fins de justificativa que o aluno (a) <strong>${up(a.nome)}</strong> nascido em <strong>${dataBR(a.data_nascimento)}</strong>, filho de <strong>${p.pai}</strong> e <strong>${p.mae}</strong> o mesmo(a) está devidamente matriculada neste estabelecimento de ensino cursando o <strong>${labelTurma(a.turma)} DO EDUCAÇÃO INFANTIL I MANHÃ</strong>.</p>
        <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor.</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docProvissoria(a) {
    const p = dadosPais(a);
    return `${getWordHead('Provisória')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO PROVISÓRIA DE TRANSFERÊNCIA</div>
        <p>Declaramos que o aluno (a) <strong>${up(a.nome)}</strong> filho(a) de <strong>${p.pai}</strong> e de <strong>${p.mae}</strong> nascido(a) <strong>${dataBR(a.data_nascimento)}</strong>, natural de <strong>${up(a.cidade_nascimento || '—')}</strong>, Estado de <strong>${up(a.estado || '—')}</strong>, tem direito a matricula no <strong>${labelTurma(a.turma)} do Ensino Fundamental</strong>.</p>
        <p>Desde que obteve nos períodos anteriores os seguintes resultados:</p>
        <p style="text-align: center;">( X ) aprovação &nbsp;&nbsp; ( &nbsp; ) reprovação &nbsp;&nbsp; ( &nbsp; ) cursando</p>
        <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor.</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docReciboPagamento(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `${getWordHead('Recibo de Pagamento')}
        ${headerPadraoBordado()}
        <div class="doc-title">RECIBO DE PAGAMENTO</div>
        <p>Eu, <strong>MARCIA DE SOUZA</strong>, responsável pela Escola CENTRO EDUCACIONAL JARDIM DO ÉDEN, localizada em Garanhuns Rua Clementino Ricardo de Souza N° 134 Bairro Severiano Moraes Filho, declaro que recebemos do Sr. <strong>${up(nomeResp)}</strong> responsável financeiro pelo(a) aluno(a) <strong>${up(a.nome)}</strong> a quantia de 1.750,00 reais (mil setecentos e cinquenta reais) referente ao pagamento de mensalidades, conforme detalhado abaixo:</p>
        <p style="margin-left: 20px;">Mensalidades do ano letivo de 2024: (250,00)</p>
        <p style="margin-left: 20px;">Taxa de Matrícula: (250,00)</p>
        <p><strong>Valor Total Pago em 2024: 1.750,00 (mil setecentos e cinquenta reais)</strong></p>
        <p>Este recibo é valido como comprovante de pagamento integral das despesas educacionais durante o ano de 2024 na Escola CENTRO EDUCACIONAL JARDIM DO ÉDEN</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('Assinatura', '')}
    ${footerPadrao()}`;
}

function docFichaIndividual(a) {
    const materias = ['Língua Portuguesa e Literatura','História','Geografia','Ciências','Matemática','Educação Física','Inglês','Arte','Cidadania'];
    let linhas = '';
    materias.forEach(m => { linhas += `<tr><td style="border: 1px solid #000; padding: 4px; text-align: left;">${m}</td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td></tr>`; });
    
    return `${getWordHead('Ficha Individual')}
        ${headerPadraoBordado()}
        <div class="doc-title">FICHA INDIVIDUAL DO ALUNO</div>
        
        <table style="width:100%; border:none; margin-bottom: 15px; font-size: 14px;">
            <tr><td style="border:none; padding:2px;"><strong>Aluno (a):</strong> ${up(a.nome)}</td></tr>
            <tr><td style="border:none; padding:2px;"><strong>Ano:</strong> ${new Date().getFullYear()} &nbsp;&nbsp; <strong>Série:</strong> ${labelTurma(a.turma)} &nbsp;&nbsp; <strong>Turma:</strong> ${(a.turma || '').slice(-1).toUpperCase()}</td></tr>
        </table>
        
        <div class="table-responsive">
            <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; text-align: center; font-size: 12px;">
                <thead>
                    <tr>
                        <th rowspan="2" style="border: 1px solid #000; padding: 4px;">APROVEITAMENTO</th>
                        <th colspan="5" style="border: 1px solid #000; padding: 4px;">I SEMESTRE</th>
                        <th colspan="5" style="border: 1px solid #000; padding: 4px;">II SEMESTRE</th>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000;">I UNIDADE</th><th style="border: 1px solid #000;">II UNIDADE</th><th style="border: 1px solid #000;">Recuperação</th><th style="border: 1px solid #000;">Média</th><th style="border: 1px solid #000;">Nota</th>
                        <th style="border: 1px solid #000;">III UNIDADE</th><th style="border: 1px solid #000;">IV UNIDADE</th><th style="border: 1px solid #000;">Recuperação</th><th style="border: 1px solid #000;">Média</th><th style="border: 1px solid #000;">Nota</th>
                    </tr>
                </thead>
                <tbody>${linhas}</tbody>
            </table>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px;">APROVADO( &nbsp; ) &nbsp; REPROVADO( &nbsp; ) &nbsp; CURSANDO( X ) &nbsp; DESISTENTE( &nbsp; )</p>
        <p style="font-size: 12px;">Percentual de Frequência de dias frequentados: ____% &nbsp;&nbsp; Carga Horária Anual: 800 dias letivos: 200</p>
        ${linhaAssinatura('', 'Direção')}
    ${footerPadrao()}`;
}

function docRecibo(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `${getWordHead('Recibo')}
        ${headerPadraoBordado()}
        <div class="doc-title">RECIBO</div>
        <p>Declaro para os devidos fins de justificativa que o senhor(a) <strong>${up(nomeResp)}</strong> efetuou o pagamento da matricula escolar do mês de janeiro do aluno(a) <strong>${up(a.nome)}</strong> no valor de R$ 300,00 reais (Trezentos reais).</p>
        <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para quaisquer esclarecimentos.</p>
        <p>Atenciosamente a Direção</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('Márcia de Souza', '')}
    ${footerPadrao()}`;
}

function docQuitacaoSimples(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `${getWordHead('Quitação')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO DE QUITAÇÃO DE DÉBITO</div>
        <p>Declaro para os devidos fins de justificativa que o senhor(a) <strong>${up(nomeResp)}</strong> efetuou o pagamento das mensalidades escolares do ano letivo de <strong>${new Date().getFullYear()}</strong> do(a) aluno(a) <strong>${up(a.nome)}</strong>.</p>
        <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para quaisquer esclarecimentos.</p>
        <p>Atenciosamente a Direção</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docQuitacaoTabela(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    const ano = new Date().getFullYear();
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    let linhas = ''; let total = 0;
    meses.forEach((m, i) => { const valor = 250; total += valor; linhas += `<tr><td style="border: 1px solid #000; padding: 4px;">${String(i+1).padStart(2,'0')}/${ano}</td><td style="border: 1px solid #000; padding: 4px;">${valor.toFixed(2).replace('.',',')} R$</td></tr>`; });
    return `${getWordHead('Quitação Tabela')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO DE QUITAÇÃO DE DÉBITO</div>
        <p>Declaro para os devidos fins de justificativa que o senhor(a) <strong>${up(nomeResp)}</strong> responsável pelo(a) aluno(a) <strong>${up(a.nome)}</strong> efetuou o pagamento das mensalidades escolares do ano letivo de <strong>${ano}</strong> no valor total de <strong>${total.toFixed(2).replace('.',',')} R$</strong>.</p>
        <p>Segue o valor abaixo:</p>
        <table style="width: 100%; max-width: 400px; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; margin: 0 auto;">
            <thead><tr><th style="border: 1px solid #000; padding: 4px;">Data</th><th style="border: 1px solid #000; padding: 4px;">Valor</th></tr></thead>
            <tbody>${linhas}<tr><th style="border: 1px solid #000; padding: 4px;">Total</th><th style="border: 1px solid #000; padding: 4px;">${total.toFixed(2).replace('.',',')} R$</th></tr></tbody>
        </table>
        <p style="margin-top: 20px;">Sem mais para o momento agradeço e coloco-me ao inteiro dispor para quaisquer esclarecimentos.</p>
        <p>Atenciosamente a Direção</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docDeclaracaoNormal(a) {
    return `${getWordHead('Declaração')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO</div>
        <p>Declaro para os devidos fins que o(a) aluno(a) <strong>${up(a.nome)}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, encontra-se regularmente matriculado(a) neste estabelecimento de ensino, cursando o <strong>${labelTurma(a.turma)}</strong>.</p>
        <p>Sem mais para o momento, agradeço e coloco-me ao inteiro dispor.</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docDeclaracaoNormalPaiMae(a) {
    const p = dadosPais(a);
    return `${getWordHead('Declaração Pai Mãe')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO</div>
        <p>Declaro para os devidos fins que o(a) aluno(a) <strong>${up(a.nome)}</strong>, filho(a) de <strong>${p.pai}</strong> e de <strong>${p.mae}</strong>, nascido(a) em <strong>${dataBR(a.data_nascimento)}</strong>, encontra-se regularmente matriculado(a) neste estabelecimento de ensino, cursando o <strong>${labelTurma(a.turma)}</strong>.</p>
        <p>Sem mais para o momento, agradeço e coloco-me ao inteiro dispor.</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docProfessorSaiu(a) {
    return `${getWordHead('Professor Saiu')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO</div>
        <p>Declaro para os devidos fins de justificativa que <strong>${up(a.nome_pai || a.nome_mae || '—')}</strong> trabalhou em nosso estabelecimento de ensino exercendo a função de professora regente.</p>
        <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor para qualquer dúvida ou esclarecimento.</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docPagamentoEscolar(a) {
    const nomeResp = a.nome_pai || a.nome_mae || a.responsavel_outro || '—';
    return `${getWordHead('Pagamento Escolar')}
        ${headerPadraoBordado()}
        <div class="doc-title">DECLARAÇÃO DE PAGAMENTO ESCOLAR</div>
        <p>Declaro para os devidos fins que o(a) Sr(a). <strong>${up(nomeResp)}</strong>, responsável pelo(a) aluno(a) <strong>${up(a.nome)}</strong>, efetuou o pagamento das mensalidades escolares referentes ao ano letivo de <strong>${new Date().getFullYear()}</strong>.</p>
        <p>Sem mais para o momento agradeço e coloco-me ao inteiro dispor.</p>
        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'DIRETORA')}
    ${footerPadrao()}`;
}

function docCarne(a, opcoes) {
    const { valor, temIrmao, irmao1, irmao2 } = opcoes || { valor: '300,00', temIrmao: false };
    
    const nomeResponsavel = a.nome_pai || a.nome_mae || a.responsavel_outro || 'NÃO INFORMADO';
    const endereco = a.endereco ? `${a.endereco}, Nº ${a.numero_endereco || 'S/N'}` : 'Endereço não informado';
    const cidadeEstado = a.cidade ? `${a.cidade}/${a.estado || ''}` : '';
    const cpfResp = a.cpf_pai || a.cpf_mae || 'NÃO INFORMADO';
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
                                    <div style="padding: 2px 4px; font-weight: bold;">DIURNO</div>
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

function docContabilidade(a, pagamentos) {
    const anoAtual = new Date().getFullYear();
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    let linhas = '';
    let totalPago = 0;
    let totalPendente = 0;

    meses.forEach((m, i) => {
        const numMes = i + 1;
        const pago = pagamentos.includes(numMes);
        const valorMes = 300; 
        const status = pago ? '<span style="color: green; font-weight: bold;">PAGO</span>' : '<span style="color: red; font-weight: bold;">PENDENTE</span>';
        
        if (pago) totalPago += valorMes;
        else totalPendente += valorMes;

        linhas += `<tr>
            <td style="border: 1px solid #000; padding: 4px;">${m}</td>
            <td style="border: 1px solid #000; padding: 4px;">${valorMes.toFixed(2).replace('.',',')} R$</td>
            <td style="border: 1px solid #000; padding: 4px;">${status}</td>
        </tr>`;
    });

    return `${getWordHead('Relatório Financeiro')}
        ${headerPadraoBordado()}
        <div class="doc-title">RELATÓRIO FINANCEIRO (${anoAtual})</div>
        
        <table style="width:100%; border:none; margin-bottom: 15px; font-size: 14px;">
            <tr><td style="border:none; padding:2px;"><strong>Aluno (a):</strong> ${up(a.nome)}</td></tr>
            <tr><td style="border:none; padding:2px;"><strong>Responsável:</strong> ${up(a.nome_pai || a.nome_mae || a.responsavel_outro || '—')}</td></tr>
            <tr><td style="border:none; padding:2px;"><strong>Turma:</strong> ${labelTurma(a.turma)}</td></tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; text-align: center; font-size: 12px; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="border: 1px solid #000; padding: 5px; background: #f0f0f0;">Mês de Referência</th>
                    <th style="border: 1px solid #000; padding: 5px; background: #f0f0f0;">Valor</th>
                    <th style="border: 1px solid #000; padding: 5px; background: #f0f0f0;">Status</th>
                </tr>
            </thead>
            <tbody>${linhas}</tbody>
        </table>

        <div style="background: #eef3f8; padding: 15px; border-radius: 8px; font-size: 14px;">
            <p style="margin: 5px 0;"><strong>Total Pago:</strong> <span style="color: green;">${totalPago.toFixed(2).replace('.',',')} R$</span></p>
            <p style="margin: 5px 0;"><strong>Total Pendente:</strong> <span style="color: red;">${totalPendente.toFixed(2).replace('.',',')} R$</span></p>
        </div>

        <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
        ${linhaAssinatura('', 'Direção')}
    ${footerPadrao()}`;
}

function docRelatorioGlobal(alunos, tipo) {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; 
    const anoAtual = hoje.getFullYear();
    const mesesNomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const nomeMesAtual = mesesNomes[mesAtual - 1];

    const alunosPorTurma = {};
    alunos.forEach(aluno => {
        if (!alunosPorTurma[aluno.turma]) alunosPorTurma[aluno.turma] = [];
        alunosPorTurma[aluno.turma].push(aluno);
    });

    let htmlTurmas = '';
    let temAlguemNoRelatorio = false;
    const turmasOrdenadas = Object.keys(alunosPorTurma).sort();

    turmasOrdenadas.forEach(turma => {
        let linhasAlunos = '';
        let contagem = 0;

        alunosPorTurma[turma].forEach(aluno => {
            const pagamentos = aluno.pagamentos || [];
            const isPagoAteMesAtual = pagamentos.includes(mesAtual);

            if (tipo === 'pagos' && !isPagoAteMesAtual) return;
            if (tipo === 'pendentes' && isPagoAteMesAtual) return;

            contagem++;
            temAlguemNoRelatorio = true;

            let detalhes = '';
            if (tipo === 'pendentes') {
                const faltantes = [];
                for (let i = 1; i <= mesAtual; i++) {
                    if (!pagamentos.includes(i)) faltantes.push(mesesNomes[i-1]);
                }
                detalhes = `<span style="color: #dc3545; font-size: 10pt;">Meses em falta: ${faltantes.join(', ')}</span>`;
            } else {
                detalhes = `<span style="color: #28a745; font-size: 10pt;">Pago até ${nomeMesAtual}</span>`;
            }

            linhasAlunos += `
                <tr>
                    <td style="border: 1px solid #000; padding: 6px; text-align: left;">${up(aluno.nome)}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: left;">${detalhes}</td>
                </tr>
            `;
        });

        if (contagem > 0) {
            htmlTurmas += `
                <div style="margin-bottom: 20px; page-break-inside: avoid;">
                    <h3 style="background: #eef3f8; color: #003869; padding: 5px 10px; margin: 0; font-size: 12pt; border: 1px solid #000; border-bottom: none;">
                        Turma: ${labelTurma(turma)}
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11pt;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="border: 1px solid #000; padding: 5px; width: 40%;">Nome do Aluno</th>
                                <th style="border: 1px solid #000; padding: 5px; text-align: left;">Status Financeiro</th>
                            </tr>
                        </thead>
                        <tbody>${linhasAlunos}</tbody>
                    </table>
                </div>
            `;
        }
    });

    if (!temAlguemNoRelatorio) {
        htmlTurmas = `<p style="text-align: center; font-size: 14pt; margin-top: 50px;">Nenhum aluno encontrado para este filtro (Mês de referência: ${nomeMesAtual}).</p>`;
    }

    const titulo = tipo === 'pagos' ? 'EXTRATO DE ALUNOS COM PAGAMENTO EM DIA' : 'RELATÓRIO DE PENDÊNCIAS FINANCEIRAS';

    return `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
        <meta charset="UTF-8">
        <title>Relatório Financeiro Global</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @page { size: A4 portrait; margin: 1.5cm; }
            body { font-family: 'Times New Roman', Times, serif; margin: 0; padding: 0; background: #f0f0f0; display: flex; justify-content: center; }
            .doc-container { width: 100%; max-width: 800px; background: #fff; padding: 40px; box-sizing: border-box; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            @media print {
                body { background: #fff; }
                .doc-container { box-shadow: none; padding: 0; max-width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="doc-container">
            ${headerPadraoBordado()}
            <div class="doc-title">${titulo}</div>
            <div style="text-align: right; font-size: 10pt; margin-bottom: 15px;">
                Referência: Até ${nomeMesAtual} de ${anoAtual}<br>
                Emitido em: ${dataHojeExtenso()}
            </div>
            ${htmlTurmas}
            <div style="text-align: center; margin-top: 50px;">Garanhuns, ${dataHojeExtenso()}</div>
            ${linhaAssinatura('', 'Direção')}
        </div>
    </body>
    </html>`;
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
    'boletim':                             docBoletim,
    'Carnê':                               docCarne,
    'Carne':                               docCarne,
    'Contabilidade':                       docContabilidade
};