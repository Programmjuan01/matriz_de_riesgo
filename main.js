/***** datos mínimos para demo *****/
const riesgos   = [];
const tbody     = document.querySelector("#tabla tbody");
const frm       = document.getElementById("frm");

/* añade fila */
function addRow(r,res){
  const tr=document.createElement("tr");
  tr.innerHTML=`<td>${r}</td><td>${res}</td>
                <td><button>⨯</button></td>`;
  tr.querySelector("button").onclick=()=>{tr.remove();}
  tbody.appendChild(tr);
}

/* calcula riesgo demo <- sustituye por tu lógica real */
function calc(prob,imp){
  if(prob==="Probable"&&imp==="Alto") return "Crítico";
  return "Bajo";
}

/* submit */
frm.addEventListener("submit",e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(frm).entries());
  const riesgo      = calc(d.prob_pre,d.imp_pre);
  const riesgoResid = calc(d.prob_post,d.imp_post);
  riesgos.push({riesgo,riesgoResid});
  addRow(riesgo,riesgoResid);
  frm.reset();
});

/* descarga JSON demo  (cámbialo por SheetJS si quieres Excel) */
document.getElementById("btn-excel").onclick=()=>{
  const blob=new Blob([JSON.stringify(riesgos,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="matriz_riesgos.json";
  a.click();
};
// ... tu código previo de MSAL, calcRiesgo, renderTable, etc. ...

/* Helpers */
function limpiarMatriz(){
  if(confirm("¿Borrar toda la matriz?")){
    rows=[]; persist(); renderTable();
  }
}

/* Desktop */
document.getElementById("btn-save")  ?.addEventListener("click", ()=>frm.requestSubmit());
document.getElementById("btn-clear") ?.addEventListener("click", limpiarMatriz);
document.getElementById("btn-upload")?.addEventListener("click", uploadExcel);

/* Móvil */
document.getElementById("btn-save-xs")  ?.addEventListener("click", ()=>frm.requestSubmit());
document.getElementById("btn-clear-xs") ?.addEventListener("click", limpiarMatriz);
document.getElementById("btn-upload-xs")?.addEventListener("click", uploadExcel);
