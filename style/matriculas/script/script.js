
const etapa1 = document.querySelector('.etapa1');
const etapa2 = document.querySelector('.etapa2');
const btnproximo = document.querySelector('#btnProximo');
const btnvoltar = document.querySelector('#btnVoltar');
const btnfinalizar = document.querySelector('#btnFinalizar');

const formulario = document.querySelector("#formulario");


let matriculaSalva = {};


formulario.addEventListener("submit", function(event){
    event.preventDefault();
    const dados = new FormData(formulario);
    const matricula = Object.fromEntries(dados);

    matriculaSalva = matricula

    localStorage.setItem("@matricula", JSON.stringify(matriculaSalva));
    console.log(matriculaSalva)


});






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




  

