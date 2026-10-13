
const etapa1 = document.querySelector('.etapa1');
const etapa2 = document.querySelector('.etapa2');

const btnproximo = document.querySelector('#btnProximo');
const btnvoltar = document.querySelector('#btnVoltar');
const btnfinalizar = document.querySelector('#btnFinalizar');

const formulario = document.querySelector("#formulario");

const elementoListaMatriculas =
    document.querySelector("#listaMatriculas");

const informacoesMatricula =
    document.querySelector("#informacoesMatricula");

const btnGerarDocumento =
    document.querySelector("#gerarDocumento");

let listaDeMatriculas = [];

let matriculaSelecionada = null;

let indiceSelecionado = null;


// RECUPERAR MATRÍCULAS SALVAS

const dadosSalvos = localStorage.getItem("@matricula");

if (dadosSalvos) {

    try {

        const dadosRecuperados = JSON.parse(dadosSalvos);

        if (Array.isArray(dadosRecuperados)) {

            listaDeMatriculas = dadosRecuperados;

        } else if (
            dadosRecuperados !== null &&
            typeof dadosRecuperados === "object"
        ) {

            listaDeMatriculas = [dadosRecuperados];

        }

    } catch (erro) {

        console.error("Erro ao recuperar matrículas:", erro);

    }
}


// RECUPERAR MATRÍCULA SELECIONADA

const indiceSalvo =
    localStorage.getItem("@indiceSelecionado");

if (indiceSalvo !== null) {

    const indice = Number(indiceSalvo);

    if (
        Number.isInteger(indice) &&
        indice >= 0 &&
        indice < listaDeMatriculas.length
    ) {

        indiceSelecionado = indice;

        matriculaSelecionada =
            listaDeMatriculas[indice];

    }
}


// MOSTRAR DADOS DA MATRÍCULA

function mostrarDadosSelecionados(matricula) {

    if (!informacoesMatricula) {
        console.error(
            "Elemento #informacoesMatricula não encontrado"
        );
        return;
    }

    informacoesMatricula.innerHTML = "";

    Object.entries(matricula).forEach(function([campo, valor]) {

        const paragrafo = document.createElement("p");

        paragrafo.textContent = campo + ": " + valor;

        informacoesMatricula.appendChild(paragrafo);

    });
}


// MOSTRAR MATRÍCULAS CADASTRADAS

function mostrarMatricula() {

    if (!elementoListaMatriculas) {
        console.error(
            "Elemento #listaMatriculas não encontrado"
        );
        return;
    }

    elementoListaMatriculas.innerHTML = "";

    listaDeMatriculas.forEach(function(matricula, indice) {

        const item = document.createElement("li");

        item.textContent =
            matricula.nome + " - " + matricula.turma + " ";


        // CRIAR BOTÃO SELECIONAR

        const botao = document.createElement("button");

        botao.textContent = "Selecionar";
        botao.type = "button";


        botao.addEventListener("click", function() {

            indiceSelecionado = indice;

            matriculaSelecionada =
                listaDeMatriculas[indice];


            // GUARDAR A SELEÇÃO

            localStorage.setItem(
                "@indiceSelecionado",
                String(indiceSelecionado)
            );


            // MOSTRAR DADOS

            mostrarDadosSelecionados(matriculaSelecionada);

            console.log("Matrícula selecionada:");
            console.log(matriculaSelecionada);

        });


        item.appendChild(botao);

        elementoListaMatriculas.appendChild(item);

    });
}


// FINALIZAR MATRÍCULA

if (formulario) {

    formulario.addEventListener("submit", function(event) {

        event.preventDefault();

        const dados = new FormData(formulario);

        const matricula = Object.fromEntries(dados);


        // ADICIONAR AO ARRAY

        listaDeMatriculas.push(matricula);


        // SALVAR MATRÍCULAS

        localStorage.setItem(
            "@matricula",
            JSON.stringify(listaDeMatriculas)
        );


        // LIMPAR FORMULÁRIO

        formulario.reset();


        // ATUALIZAR LISTA

        mostrarMatricula();

    });
}


// PREPARAR DOCUMENTO

if (btnGerarDocumento) {

    btnGerarDocumento.addEventListener("click", function() {

        if (matriculaSelecionada === null) {

            alert("Selecione uma matrícula primeiro!");

            return;
        }

        console.log("Matrícula para o documento:");

        console.log(matriculaSelecionada);

    });
}


// INICIAR EXIBIÇÃO

mostrarMatricula();

if (matriculaSelecionada !== null) {

    mostrarDadosSelecionados(matriculaSelecionada);

}



function proximo(){
    etapa1.style.display = 'none';
    etapa2.style.display = 'block';
    btnproximo.style.display = 'none';
    btnfinalizar.style.display = 'block';
    btnvoltar.style.display = 'block';
}

function voltar(){
    etapa1.style.display = 'block';
    etapa2.style.display= 'none';
    btnproximo.style.display = 'block';
    btnfinalizar.style.display = 'none';
    btnvoltar.style.display = 'none'
}




  

