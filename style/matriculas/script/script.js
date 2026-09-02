
let etapa1 = document.querySelector('.etapa1');
let etapa2 = document.querySelector('.etapa2');

let btnproximo = document.querySelector('#btnProximo');
let btnvoltar = document.querySelector('#btnVoltar');

function proximo(){
    etapa1.style.display = 'none';
    etapa2.style.display = 'block';
}

function voltar(){
    etapa1.style.display = 'block';
    etapa2.style.display= 'none';
}
