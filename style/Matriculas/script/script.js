const etapas = document.querySelectorAll(".etapa");

const botoesProximo = document.querySelectorAll(".proximo");

const botoesVoltar = document.querySelectorAll(".voltar");

const formulario = document.getElementById("formMatricula");

let etapaAtual = 0;


// PRÓXIMO

botoesProximo.forEach(botao => {

    botao.addEventListener("click", () => {

        const campos = etapas[etapaAtual]
            .querySelectorAll("input, select");

        let valido = true;

        campos.forEach(campo => {

            if (!campo.checkValidity()) {

                campo.reportValidity();

                valido = false;
            }

        });

        if (!valido) {
            return;
        }

        etapas[etapaAtual]
            .classList.remove("ativa");

        etapaAtual++;

        etapas[etapaAtual]
            .classList.add("ativa");

    });

});


// VOLTAR

botoesVoltar.forEach(botao => {

    botao.addEventListener("click", () => {

        etapas[etapaAtual]
            .classList.remove("ativa");

        etapaAtual--;

        etapas[etapaAtual]
            .classList.add("ativa");

    });

});


// SUBMIT FINAL

formulario.addEventListener("submit", (event) => {

    event.preventDefault();

    const dados = new FormData(formulario);

    console.log("Dados da matrícula:");

    for (const [campo, valor] of dados) {

        console.log(campo, valor);

    }

    alert("Matrícula preenchida com sucesso!");

});