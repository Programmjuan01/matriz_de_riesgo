/* ========================  main.js  ======================== */
/* 1. Catálogos ------------------------------------------------ */
const NIV_PROB = [
  ["Raro/Incierto",1],["Poco probable",2],["Medianamente",3],
  ["Probable",4],["Casi certeza",5]
];
const NIV_IMP  = [
  ["Muy Bajo",1],["Bajo",2],["Medio",3],["Alto",4],["Muy Alto",5]
];
/* Matriz Impacto‑Probabilidad → Nivel de riesgo */
const RISK_MAP = {
  "1-1":"Bajo","1-2":"Bajo","1-3":"Bajo","1-4":"Medio","1-5":"Alto",
  "2-1":"Bajo","2-2":"Bajo","2-3":"Medio","2-4":"Alto","2-5":"Alto",
  "3-1":"Medio","3-2":"Medio","3-3":"Alto","3-4":"Alto","3-5":"Crítico",
  "4-1":"Alto","4-2":"Alto","4-3":"Alto","4-4":"Crítico","4-5":"Crítico",
  "5-1":"Alto","5-2":"Alto","5-3":"Crítico","5-4":"Crítico","5-5":"Crítico"
};

/* 2. Estado y DOM -------------------------------------------- */
const riesgos = [];
const tbody   = document.querySelector("#tabla tbody");
const frm     = document.getElementById("frm");

/* 3. Calcula nivel de riesgo ---------------------------------- */
function calc(probTxt, impTxt){
  const p = NIV_PROB.find(([t])=>t===probTxt)?.[1];
  const i = NIV_IMP .find(([t])=>t===impTxt )?.[1];
  return (p && i) ? RISK_MAP[`${i}-${p}`] : "—";
}

/* 4. Renderiza fila ------------------------------------------- */
function addRow(r, res){
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${r}</td>
    <td>${res}</td>
    <td><button class="del">⨯</button></td>`;
  tr.querySelector(".del").onclick = () => tr.remove();
  tbody.appendChild(tr);
}

/* 5. Alta de riesgo ------------------------------------------- */
frm.addEventListener("submit", e=>{
  e.preventDefault();
  const d = Object.fromEntries(new FormData(frm).entries());

  const riesgo       = calc(d.prob_pre , d.imp_pre );
  const riesgoResid  = calc(d.prob_post, d.imp_post);

  riesgos.push({riesgo,riesgoResid});
  addRow(riesgo, riesgoResid);
  frm.reset();
});

/* 6. Descargar JSON demo  (cambia por SheetJS si quieres Excel) */
document.getElementById("btn-excel").onclick = ()=>{
  const blob = new Blob(
    [JSON.stringify(riesgos,null,2)],
    {type:"application/json"}
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "matriz_riesgos.json";
  a.click();
};

/* 7. Limpiar tabla (si usas botones desktop/móvil) ------------- */
function limpiar(){
  if(confirm("¿Borrar toda la matriz?")){
    riesgos.length = 0;
    tbody.innerHTML = "";
  }
}
document.getElementById("btn-clear")    ?.addEventListener("click", limpiar);
document.getElementById("btn-clear-xs") ?.addEventListener("click", limpiar);

/* 8. Subida a SharePoint  (si ya tienes uploadExcel) ----------- */
document.getElementById("btn-upload")    ?.addEventListener("click", uploadExcel);
document.getElementById("btn-upload-xs") ?.addEventListener("click", uploadExcel);
