/*  ========================  main.js  ========================  */

/* Si estoy dentro de un iframe (Power Apps) fuerzo un viewport ancho */
if (window !== window.parent) {
  const vp = document.getElementById('vp');
  // 1280px hace que Bootstrap active breakpoint lg (≥992 px)
  vp.setAttribute('content', 'width=1280, initial-scale=1');
}

/* ---------- 1.  Catálogos y utilidades ---------- */
const NIVELES_PROB = [
  ["Raro/Incierto", 1], ["Poco probable", 2], ["Medianamente", 3],
  ["Probable", 4], ["Casi certeza", 5],
];
const NIVELES_IMP  = [
  ["Muy Bajo", 1], ["Bajo", 2], ["Medio", 3],
  ["Alto", 4], ["Muy Alto", 5],
];
const RIESGO_MAP = {
  "1-1":"Bajo","1-2":"Bajo","1-3":"Bajo","1-4":"Medio","1-5":"Alto",
  "2-1":"Bajo","2-2":"Bajo","2-3":"Medio","2-4":"Alto","2-5":"Alto",
  "3-1":"Medio","3-2":"Medio","3-3":"Alto","3-4":"Alto","3-5":"Crítico",
  "4-1":"Alto","4-2":"Alto","4-3":"Alto","4-4":"Crítico","4-5":"Crítico",
  "5-1":"Alto","5-2":"Alto","5-3":"Crítico","5-4":"Crítico","5-5":"Crítico",
};
const calcRiesgo = (prob, imp) => {
  const p = NIVELES_PROB.find(([t]) => t === prob)?.[1];
  const i = NIVELES_IMP .find(([t]) => t === imp )?.[1];
  return RIESGO_MAP[`${i}-${p}`] ?? "—";
};

/* ---------- 2.  Estado (localStorage) ---------- */
const COLS = [
  "ID Riesgo","Macroproyecto","Descripción","Tipo Proyecto","Grupo CAPEX",
  "Probabilidad","Impacto","Riesgo",
  "Probabilidad Post","Impacto Post","Riesgo Residual"
];
let rows = JSON.parse(localStorage.getItem("matriz_riesgos") || "[]");
const persist = () => localStorage.setItem("matriz_riesgos", JSON.stringify(rows));

/* ---------- 3.  Referencias DOM ---------- */
const form        = document.getElementById("form-riesgo");
const tbody       = document.getElementById("tabla-body");
const btnClear    = document.getElementById("btn-clear");
const btnDownload = document.getElementById("dl-btn");

/* ---------- 4.  Render de la tabla ---------- */
function renderTable(){
  tbody.innerHTML = "";
  rows.forEach(r => {
    const tr = document.createElement("tr");

    COLS.forEach((c,i) => {
      const td = document.createElement("td");
      td.textContent = r[c] ?? "";
      if(i === 6 || i === 9){              // Impacto / Impacto Post
        td.dataset.impact = (r[c] || "").toLowerCase().replace(/\s+/g,"-");
      }
      tr.appendChild(td);
    });

    /* botón eliminar */
    const tdAcc = document.createElement("td");
    tdAcc.innerHTML = `<button class="btn btn-sm btn-danger">Eliminar</button>`;
    tdAcc.firstElementChild.onclick = () => {
      rows = rows.filter(x => x["ID Riesgo"] !== r["ID Riesgo"]);
      persist(); renderTable();
    };
    tr.appendChild(tdAcc);

    tbody.appendChild(tr);
  });
}

/* ---------- 5.  Alta / edición ---------- */
function addRisk(evt){
  evt.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());

  const riesgoIn  = calcRiesgo(data.prob_in,  data.imp_in);
  const riesgoOut = calcRiesgo(data.prob_post,data.imp_post);

  const obj = {
    "ID Riesgo"        : data.id_riesgo.trim(),
    "Macroproyecto"    : data.macroproy.trim(),
    "Descripción"      : data.descripcion.trim(),
    "Tipo Proyecto"    : data.tipo_pry,
    "Grupo CAPEX"      : data.grupo_capex,
    "Probabilidad"     : data.prob_in,
    "Impacto"          : data.imp_in,
    "Riesgo"           : riesgoIn,
    "Probabilidad Post": data.prob_post,
    "Impacto Post"     : data.imp_post,
    "Riesgo Residual"  : riesgoOut,
  };

  const idx = rows.findIndex(r => r["ID Riesgo"] === obj["ID Riesgo"]);
  idx >= 0 ? rows[idx] = obj : rows.push(obj);

  persist();
  form.reset();
  renderTable();
}

/* ---------- 6.  Exportar Excel ---------- */
function downloadExcel(){
  if(!rows.length){ alert("No hay datos que exportar"); return; }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Matriz_Riesgos");
  const wbout = XLSX.write(wb, { bookType:"xlsx", type:"array" });
  saveAs(new Blob([wbout], {type:"application/octet-stream"}), "Matriz_Riesgos.xlsx");
}

/* ---------- 7.  Eventos ---------- */
form.addEventListener("submit", addRisk);
btnClear.addEventListener("click", () => {
  if(confirm("¿Borrar toda la matriz?")){
    rows = []; persist(); renderTable();
  }
});
btnDownload.addEventListener("click", downloadExcel);

/* ---------- 8.  Pintar al cargar ---------- */
renderTable();

/* ---------- 9.  DEBUG opcional ---------- */
// console.log("JS cargado – filas:", rows);
