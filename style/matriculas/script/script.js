const etapa1 = document.querySelector('.etapa1');
const etapa2 = document.querySelector('.etapa2');
const btnproximo = document.querySelector('#btnProximo');
const btnvoltar = document.querySelector('#btnVoltar');
const btnfinalizar = document.querySelector('#btnFinalizar');


const formulario = document.querySelector("#formulario");


let listaDeMatriculas = []

const elementoListaMatriculas = document.querySelector("#listaMatriculas")

const dadosSalvos = localStorage.getItem("@matricula");
if(dadosSalvos){
    listaDeMatriculas =JSON.parse(dadosSalvos);

    mostrarMatricula();
};



function mostrarMatricula(){
    elementoListaMatriculas.innerHTML = "";


    listaDeMatriculas.forEach(function(matricula,indice){

        const item = document.createElement("li");

        item.textContent = 
            matricula.nome + "-" + matricula.turma;
        
        const botao = document.createElement("button");

        botao.textContent = "Selecionar";

        botao.addEventListener("click", function(){

            const matriculaSelecionada = listaDeMatriculas[indice];

            console.log(matriculaSelecionada);
            console.log(matriculaSelecionada.nome);

            console.log(
                matriculaSelecionada["data-nascimento"]
            );

            console.log(matriculaSelecionada.cpf);


        });
        

        item.appendChild(botao);
  

        elementoListaMatriculas.appendChild(item);

    });
}



formulario.addEventListener("submit", function(event){

    event.preventDefault();

    const dados = new FormData(formulario);

    const matricula = Object.fromEntries(dados);

    listaDeMatriculas.push(matricula)

   
    localStorage.setItem(
        "@matricula", 
        JSON.stringify(listaDeMatriculas)

    );

    
    formulario.reset();
    mostrarMatricula();


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




  

