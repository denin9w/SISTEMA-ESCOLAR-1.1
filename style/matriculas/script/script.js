
const etapa1 = document.querySelector('.etapa1');
const etapa2 = document.querySelector('.etapa2');

const btnproximo = document.querySelector('#btnProximo');
const btnvoltar = document.querySelector('#btnVoltar');
const btnfinalizar = document.querySelector('#btnFinalizar');

const formulario = document.getElementById('formulario');

function proximo(){
    etapa1.style.display = 'none';
    etapa2.style.display = 'block';
    btnproximo.style.display = 'none';
    btnfinalizar.style.display = 'block';
}

function voltar(){
    etapa1.style.display = 'block';
    etapa2.style.display= 'none';
    btnproximo.style.display = 'block';
    btnfinalizar.style.display = 'none';
}

function finalizar(){
    // Finalize the registration logic here
}
