let selecionarTurma = document.querySelector('#iturma');
let aluno = document.querySelector('#ialuno');
let buttonAdiconar = document.querySelector('.adicionar')
let listaDeAlunos = document.querySelector('#lista-Alunos')


const formulario = document.querySelector('#formulario');



selecionarTurma.addEventListener('click', function(){
    aluno.style.display = "block"
});


let listaAlunos = [];


function MostrarAluno(){
    
};

function AdicionarAluno(){
    if(aluno.value === ""){
        alert("Digite um alunos para adicionar")
    };
  listaAlunos.push(aluno.value)
  aluno.value = '';


};
buttonAdiconar.addEventListener('click', AdicionarAluno);




let alunoMedia = {};


formulario.addEventListener("subimit", function(event){
    event.preventDefault();
    const dados = new FormData(formulario);
    const nota = Object.fromEntries(dados);

    matriculasSalva = nota

    alunoMedia = nota

    localStorage.setItem("@nota", JSON.stringify(alunoMedia));

    console.log(alunoMedia);

});



















//let buttonAdicionar = document.querySelector(".Adicionar");
//let lançarNotas = document.querySelector("#lançar-Notas");


//buttonAdicionar.onclick = function Adcionar(){
    //if(lançarNotas.style.display === "none" ){
       // lançarNotas.style.display = "block";
   // }else{
       // lançarNotas.style.display = "none";
   // }
  
//}