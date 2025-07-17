/* … todo tu código previo permanece … */

/* Helpers */
function limpiarMatriz(){
  if(confirm("¿Borrar toda la matriz?")){
    rows=[]; persist(); renderTable();
  }
}

/* Desktop */
document.getElementById("btn-save")  ?.addEventListener("click", ()=>form.requestSubmit());
document.getElementById("btn-clear") ?.addEventListener("click", limpiarMatriz);
document.getElementById("btn-upload")?.addEventListener("click", uploadExcel);

/* Móvil */
document.getElementById("btn-save-xs") ?.addEventListener("click", ()=>form.requestSubmit());
document.getElementById("btn-clear-xs")?.addEventListener("click", limpiarMatriz);
document.getElementById("btn-upload-xs")?.addEventListener("click", uploadExcel);

