/* ========================  main.js  ======================== */
/* ---------- 0.  MSAL + Graph config ---------- */
const CLIENT_ID = "TU_CLIENT_ID";
const TENANT_ID = "common";          // o tu tenant GUID
const SITE_ID   = "TU_SITE_ID";      // /sites/OPI …  (obtenlo con Graph Explorer)
const FOLDER_PATH = "/Herramienta de Shark Tank/Informacion Proyectos  Herramienta";

const msalInstance = new msal.PublicClientApplication({
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.href
  }
});
async function getToken(){
  const req = { scopes:["Files.ReadWrite.All","Sites.ReadWrite.All"] };
  try{ return (await msalInstance.acquireTokenSilent(req)).accessToken; }
  catch{ return (await msalInstance.loginPopup(req)).accessToken; }
}

/* ---------- 1.  Catálogos y utilidades ---------- */
const NIVELES_PROB = [
  ["Raro/Incierto",1],["Poco probable",2],["Medianamente",3],["Probable",4],["Casi certeza",5]
];
const NIVELES_IMP = [
  ["Muy Bajo",1],["Bajo",2],["Medio",3],["Alto",4],["Muy Alto",5]
];
const RIESGO_MAP = {/* … igual que antes … */};
const calcRiesgo = (prob,imp)=>{
  const p=NIVELES_PROB.find(([t])=>t===prob)?.[1];
  const i=NIVELES_IMP.find(([t])=>t===imp)?.[1];
  return RIESGO_MAP[`${i}-${p}`]??"—";
};

/* ---------- 2.  Estado ---------- */
const COLS_ALL = [
  "ID Riesgo","Macroproyecto","Descripción","Tipo Proyecto","Grupo CAPEX",
  "Probabilidad","Impacto","Riesgo",
  "Probabilidad Post","Impacto Post","Riesgo Residual"
];
let rows = JSON.parse(localStorage.getItem("matriz_riesgos")||"[]");
const persist = ()=>localStorage.setItem("matriz_riesgos",JSON.stringify(rows));

/* ---------- 3.  DOM ---------- */
const form=document.getElementById("form-riesgo");
const tbody=document.getElementById("tabla-body");
const btnClear=document.getElementById("btn-clear");
const btnUpload=document.getElementById("dl-btn");

/* ---------- 4.  Render (solo 2 columnas) ---------- */
function renderTable(){
  tbody.innerHTML="";
  rows.forEach(r=>{
    const tr=document.createElement("tr");

    ["Riesgo","Riesgo Residual"].forEach(c=>{
      const td=document.createElement("td");
      td.textContent=r[c]??"";
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
async function uploadExcel(){
  if(!rows.length){alert("No hay datos que exportar");return;}
  /* genera workbook */
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),"Matriz_Riesgos");
  const buf=XLSX.write(wb,{bookType:"xlsx",type:"array"});
  const blob=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  /* token */
  const token=await getToken();
  /* nombre archivo */
  const fileName=`Matriz_Riesgos_${new Date().toISOString().slice(0,10)}.xlsx`;
  const url=
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drive/root:`+
    `${encodeURI(FOLDER_PATH)}/${fileName}:/content`;
  /* subida */
  const res=await fetch(url,{method:"PUT",headers:{Authorization:`Bearer ${token}`},body:blob});
  if(res.ok){
    alert("✅ Excel subido a SharePoint");
  }else{
    console.error(await res.text());
    alert("❌ Error al subir archivo ("+res.status+")");
  }
}

/* ---------- 7.  Otros botones ---------- */
btnClear.onclick=()=>{
  if(confirm("¿Borrar toda la matriz?")){rows=[];persist();renderTable();}
};
btnUpload.onclick=uploadExcel;

/* ---------- 8.  Init ---------- */
renderTable();
