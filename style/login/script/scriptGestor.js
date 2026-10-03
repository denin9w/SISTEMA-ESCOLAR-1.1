let selecionarAluno = document.querySelector('#iturma');
let listaDeAlunos = document.querySelector('#listaAlunos');
let documentoporAluno = document.querySelector('#idocumentos');
let buttonAluno = document.querySelector('.btn-aluno')



selecionarAluno.addEventListener('change', function(){
    listaDeAlunos.style.display = "block";
    
});



buttonAluno.addEventListener('click', function(){
    documentoporAluno.style.display = "block";
});


