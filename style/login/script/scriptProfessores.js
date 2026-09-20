let elemento_Turma = document.querySelector("#iturma");
let elemento_Aluno = document.querySelector("#ialuno");
let nome_Aluno = document.querySelector("#inome-Aluno")
let list_Alunos = document.querySelector("#lista-Alunos");
let elemento_Button = document.querySelector(".Adicionar")

let lancar_Notas = document.querySelector("#lancar-Notas");

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

    let ulElement = document.createElement("ol");

    if(elemento_Turma.value !==""){
        let turmaText = document.createTextNode(elemento_Turma.value);
        ulElement.appendChild(turmaText);
    }

    Alunos.forEach(function (aluno, posicao){

    let novoAluno = document.createElement("li");
    let tarefasText = document.createTextNode(aluno);
    
    let linkElement = document.createElement("button");
    linkElement.setAttribute("type", "button");
    linkElement.setAttribute("class", "btn-notas");
    linkElement.textContent = "Lançar Notas";
    linkElement.addEventListener("click", bimestral);



    //let alunoElement = document.createElement("a");
    //alunoElement.setAttribute("href", "#");

    //alunoElement.appendChild(document.createTextNode("Laçar Notas"));


    //linkElement.setAttribute("onclick", " bimestral(" + posicao + "); return false;");

    
   // nome_Aluno.appendChild(alunoElement)
    
   
    novoAluno.appendChild(tarefasText);
    novoAluno.appendChild(linkElement);
    ulElement.appendChild(novoAluno);

    });

    list_Alunos.appendChild(ulElement); 
  

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


function bimestral (evento){
    if(evento) evento.preventDefault();
    if(!lancar_Notas){
        console.log("id não encontrado: confira se é lacar-notas no HTML")
        return;
    }
    lancar_Notas.style.display ="block";
     lancar_Notas.scrollIntoView({ behavior: "smooth", block: "start" });
  
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