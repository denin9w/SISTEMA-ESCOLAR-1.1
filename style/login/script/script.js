let elemento_Turma = document.querySelector("#iturma");
let elemento_Aluno = document.querySelector("#ialuno");
let nome_Aluno = document.querySelector("#inome-Aluno")
let list_Alunos = document.querySelector("#lista-Alunos");
let elemento_Button = document.querySelector(".Adicionar")

let lançar_Notas = document.querySelector("lançar_Notas");

let Alunos = [];
elemento_Aluno.style.display = "none";

elemento_Turma.addEventListener("change", selecionarTurma);
elemento_Button.addEventListener("click", adicionarAluno);


function selecionarTurma(){

    if(elemento_Turma.value !== ""){
        elemento_Aluno.style.display = "block";
       
    }else{
        elemento_Aluno.style.display ="none";

    }

    renderTarefas()
}


function renderTarefas(){
    list_Alunos.innerHTML = ""

    let ulElement = document.createElement("ul");

    if(elemento_Turma.value !==""){
        let turmaText = document.createTextNode(elemento_Turma.value);
        ulElement.appendChild(turmaText);
    }

    Alunos.forEach(function (aluno, posicao){

    let novoAluno = document.createElement("li");
    let tarefasText = document.createTextNode(aluno);
    
    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", "#");

    linkElement.appendChild(document.createTextNode("Excluir"));
    
    linkElement.setAttribute("onclick", " deletar(" + posicao + "); return false;");




    novoAluno.appendChild(tarefasText);
    novoAluno.appendChild(linkElement);
    ulElement.appendChild(novoAluno);

    });



    list_Alunos.appendChild(ulElement); 
    console.log(Alunos)

}



function adicionarAluno(){

    if(nome_Aluno.value === ""){
        alert("Digite o Nome do Aluno")
        return false;
    }else{
        let novoAluno = nome_Aluno.value
        Alunos.push(nome_Aluno.value.trim());
        nome_Aluno.value = "";
        nome_Aluno.focus();

        renderTarefas();
        
    }
}








  


















//let buttonAdicionar = document.querySelector(".Adicionar");
//let lançarNotas = document.querySelector("#lançar-Notas");


//buttonAdicionar.onclick = function Adcionar(){
    //if(lançarNotas.style.display === "none" ){
       // lançarNotas.style.display = "block";
   // }else{
       // lançarNotas.style.display = "none";
   // }
  
//}