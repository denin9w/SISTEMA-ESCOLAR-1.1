let buttonAdicionar = document.querySelector(".Adicionar");
let lançarNotas = document.querySelector("#lançar-Notas");


buttonAdicionar.onclick = function Adcionar(){
    if(lançarNotas.style.display === "none" ){
        lançarNotas.style.display = "block";
    }else{
        lançarNotas.style.display = "none";
    }
  
}