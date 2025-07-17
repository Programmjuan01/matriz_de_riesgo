/* ========================  main.js  ======================== */
/* ---------- 0.  MSAL + Graph config ---------- */
const CLIENT_ID = "TU_CLIENT_ID";
const TENANT_ID = "common";          // o tu tenant GUID
const SITE_ID   = "TU_SITE_ID";      // /sites/OPI …
const FOLDER_PATH = "/Herramienta de Shark Tank/Informacion Proyectos  Herramienta";

/* … MSAL helpers igual que antes … */

/* ---------- 1.  Catálogos y utilidades ---------- */
const NIVELES_PROB = [
  ["Raro/Incierto",1],["Poco probable",2],["Medianamente",3],
  ["Probable",4],["Casi certeza",5]
];
const NIVELES_IMP  = [
  ["Muy Bajo",1],["Bajo",2],["Medio",3],["Alto",4],["Muy Alto",5]
];

/* 👉  Mapa completo (impacto‑probabilidad)  */
const RIESGO_MAP = {
  "1-1":"Bajo","1-2":"Bajo","1-3":"Bajo","1-4":"Medio","1-5":"Alto",
  "2-1":"Bajo","2-2":"Bajo","2-3":"Medio","2-4":"Alto","2-5":"Alto",
  "3-1":"Medio","3-2":"Medio","3-3":"Alto","3-4":"Alto","3-5":"Crítico",
  "4-1":"Alto","4-2":"Alto","4-3":"Alto","4-4":"Crítico","4-5":"Crítico",
  "5-1":"Alto","5-2":"Alto","5-3":"Crítico","5-4":"Crítico","5-5":"Crítico"
};
const calcRiesgo = (pTxt,iTxt)=>{
  const p = NIVELES_PROB.find(([t])=>t===pTxt)?.[1];   // 1‑5
  const i = NIVELES_IMP .find(([t])=>t===iTxt)?.[1];   // 1‑5
  return (p && i) ? RIESGO_MAP[`${i}-${p}`] : "—";
};

/* ---------- 2.  Estado / localStorage ---------- */
const COLS_ALL = [
  "ID Riesgo","Macroproyecto","Descripción","Tipo Proyecto","Grupo CAPEX",
  "Probabilidad","Impacto","Riesgo",
  "Probabilidad Post","Impacto Post","Riesgo Residual"
];
let rows = JSON.parse(localStorage.getItem("matriz_riesgos")||"[]");
const persist = ()=>localStorage.setItem("matriz_riesgos",JSON.stringify(rows));

/* ---------- 3.  DOM ---------- */
const form      = document.getElementById("form-riesgo");
const tbody     = document.getElementById("tabla-body");
const btnClear  = document.getElementById("btn-clear");
const btnUpload = document.getElementById("dl-btn");

/* ---------- 4.  Render (solo 2 columnas) ---------- */
function renderTable(){
  tbody.innerHTML="";
  rows.forEach(r=>{
    const tr=document.createElement("tr");
    ["Riesgo","Riesgo Residual"].forEach(c=>{
      const td=document.createElement("td");
      td.textContent=r[c]??"—";
      tr.appendChild(td);
    });
    const tdAcc=document.createElement("td");
    tdAcc.innerHTML=`<button class="btn btn-sm btn-danger">Eliminar</button>`;
    tdAcc.firstElementChild.onclick=()=>{
      rows=rows.filter(x=>x["ID Riesgo"]!==r["ID Riesgo"]);
      persist();renderTable();
    };
    tr.appendChild(tdAcc);
    tbody.appendChild(tr);
  });
}

/* ---------- 5.  Alta / edición ---------- */
form.addEventListener("submit",e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(form).entries());
  const obj={
    "ID Riesgo":d.id_riesgo.trim(),
    "Macroproyecto":d.macroproy.trim(),
    "Descripción":d.descripcion.trim(),
    "Tipo Proyecto":d.tipo_pry,
    "Grupo CAPEX":d.grupo_capex,
    "Probabilidad":d.prob_in,
    "Impacto":d.imp_in,
    "Riesgo":calcRiesgo(d.prob_in,d.imp_in),
    "Probabilidad Post":d.prob_post,
    "Impacto Post":d.imp_post,
    "Riesgo Residual":calcRiesgo(d.prob_post,d.imp_post)
  };
  const i=rows.findIndex(r=>r["ID Riesgo"]===obj["ID Riesgo"]);
  i>=0?rows[i]=obj:rows.push(obj);
  persist();
  form.reset();renderTable();
});

/* ---------- 6.  Subir Excel a SharePoint ---------- */
/* … idéntico al que ya tienes … */

/* ---------- 7.  Botones ---------- */
btnClear.onclick = ()=>{ if(confirm("¿Borrar toda la matriz?")){rows=[];persist();renderTable();}};
btnUpload.onclick = uploadExcel;

/* ---------- 8.  Init ---------- */
renderTable();
