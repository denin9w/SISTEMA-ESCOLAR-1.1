let responsavelElement = document.querySelector("#responsavel");
let professorElement = document.querySelector("#professor");
let gestorElement = document.querySelector("#gestor");

let input = document.querySelector("#usuario");
let input_b = document.querySelector(".input-b");

// Para onde cada perfil leva — troque os caminhos conforme as suas pastas
const PAGINAS = {
    responsavel: "loginresponsavel.htm",
    professor: "login-professores.htm",
    gestor: "login-gestor.htm",
};

let tipoSelecionado = "";   // nenhum perfil escolhido ainda


// Marca a aba clicada e guarda qual perfil foi escolhido
function selecionar(tipo, elemento){

    tipoSelecionado = tipo;

    [responsavelElement, professorElement, gestorElement].forEach(function (aba){
        aba.classList.remove("ativa");
    });

    elemento.classList.add("ativa");
}


responsavelElement.addEventListener("click", function (){
    selecionar("responsavel", responsavelElement);
});

professorElement.addEventListener("click", function (){
    selecionar("professor", professorElement);
});

gestorElement.addEventListener("click", function (){
    selecionar("gestor", gestorElement);
});


// Clique em Entrar
function entrar(){

    // 1) precisa ter algo digitado
    if (input.value.trim() === ""){
        alert("Digite o usuário");
        input.focus();
        return;
    }

    // 2) precisa ter escolhido um perfil
    if (tipoSelecionado === ""){
        alert("Escolha: Responsável, Professor ou Gestor");
        return;
    }

    // 3) vai para o index do perfil escolhido
    window.location.href = PAGINAS[tipoSelecionado];
}

input_b.addEventListener("click", entrar);


// Apertar Enter no campo também entra
input.addEventListener("keydown", function (evento){
    if (evento.key === "Enter"){
        entrar();
    }
});