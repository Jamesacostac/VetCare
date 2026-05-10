// --- CONFIGURACIÓN DE DATOS MAESTROS ---
const MEDICAMENTOS_REALES = [
    { n: "Apoquel 5.4mg", p: 125000 }, { n: "Bravecto (Antipulgas)", p: 148000 },
    { n: "Simparica Trio", p: 112000 }, { n: "Meloxicam Gotas", p: 38000 },
    { n: "Amoxicilina + Clav", p: 45000 }, { n: "Nexgard Spectra", p: 138000 },
    { n: "Prednisolona 5mg", p: 18000 }, { n: "Enrofloxacina Vet", p: 31000 }
];

const DIAGNOSTICOS_BASE = [
    "Otitis externa bacteriana. Se realizó limpieza.",
    "Control anual de vacunas y desparasitación.",
    "Dermatitis alérgica. Se receta tratamiento oral.",
    "Gastroenteritis por ingesta de cuerpo extraño.",
    "Chequeo preventivo: constante vital óptima."
];

let DB = {
    pacientes: JSON.parse(localStorage.getItem('vpro_pac')) || [],
    consultas: JSON.parse(localStorage.getItem('vpro_con')) || [],
    facturas: JSON.parse(localStorage.getItem('vpro_fac')) || []
};

// --- GENERADOR MASIVO (45 Pacientes | 675 Consultas) ---
(function seed() {
    if (DB.pacientes.length === 0) {
        for (let i = 1; i <= 45; i++) {
            const idM = i.toString();
            const email = `correo${i}@vet.com`;
            
            DB.pacientes.push({
                id: idM,
                nombre: (i % 2 === 0 ? "Thor" : "Luna") + " " + i,
                especie: i % 2 === 0 ? "Canino" : "Felino",
                raza: i % 2 === 0 ? "Golden Retriever" : "Siamés",
                peso: (4 + (i % 12)) + " kg",
                edad: (1 + (i % 8)) + " años",
                emailDueno: email
            });

            for (let j = 1; j <= 15; j++) {
                const idC = `C-${i}-${j}`;
                const med = MEDICAMENTOS_REALES[j % 8];
                DB.consultas.push({
                    id: idC, idMascota: idM, fecha: `2026-0${(j % 5) + 1}-12`,
                    motivo: "Consulta de Control #" + j,
                    diag: DIAGNOSTICOS_BASE[j % 5],
                    med: med.n, costo: 60000 + med.p
                });
                DB.facturas.push({ idC: idC, email: email, valor: 60000 + med.p, estado: "PAGADA" });
            }
        }
        save();
    }
})();

function save() {
    localStorage.setItem('vpro_pac', JSON.stringify(DB.pacientes));
    localStorage.setItem('vpro_con', JSON.stringify(DB.consultas));
    localStorage.setItem('vpro_fac', JSON.stringify(DB.facturas));
}

// --- NAVEGACIÓN ---
function navegar(vista) {
    const cont = document.getElementById('dynamic-content');
    const mail = sessionStorage.getItem('u_email');
    cont.innerHTML = "";

    if (vista === 'Panel Doctor') {
        cont.innerHTML = `<div class="card col-span-full bg-blue-600 text-white flex justify-between items-center">
            <div><h2 class="text-2xl font-bold">Gestión de Pacientes</h2><p>45 Registros Activos</p></div>
            <button onclick="abrirNuevaConsulta()" class="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition">+ Nueva Consulta</button>
        </div>` + 
        DB.pacientes.map(p => `
            <div class="card">
                <div class="flex justify-between"><span class="text-[10px] font-bold text-slate-400">#${p.id}</span><span class="badge-status bg-blue-50 text-blue-600">${p.edad}</span></div>
                <h4 class="font-bold text-lg">${p.nombre}</h4>
                <p class="text-xs text-slate-500">${p.especie} • ${p.raza} • ${p.peso}</p>
                <p class="text-[9px] mt-4 text-blue-400 font-bold uppercase italic">${p.emailDueno}</p>
            </div>
        `).join('');
    }

    if (vista === 'Mis Mascotas') {
        const misP = DB.pacientes.filter(p => p.emailDueno === mail);
        cont.innerHTML = misP.map(p => `
            <div class="card border-b-8 border-blue-500">
                <div class="text-4xl mb-4">🐾</div>
                <h4 class="font-bold text-2xl">${p.nombre}</h4>
                <div class="text-sm space-y-1 mt-4">
                    <p><b>Especie:</b> ${p.especie}</p><p><b>Edad:</b> ${p.edad}</p>
                    <p><b>Peso:</b> ${p.peso}</p><p><b>Raza:</b> ${p.raza}</p>
                </div>
            </div>
        `).join('');
    }

    if (vista === 'Historial Médico') {
        const miP = DB.pacientes.find(p => p.emailDueno === mail);
        const misC = DB.consultas.filter(c => c.idMascota === miP.id);
        cont.innerHTML = `<h2 class="col-span-full font-bold text-xl mb-4">Historial de ${miP.nombre} (${misC.length} Registros)</h2>
            <div class="col-span-full scroll-area space-y-4">
                ${misC.map(c => `<div class="card flex justify-between items-center cursor-pointer hover:bg-slate-50" onclick="verDetalle('${c.id}')">
                    <div><p class="text-[10px] text-blue-500 font-bold">${c.fecha}</p><p class="font-bold">${c.motivo}</p></div>
                    <span class="text-[10px] font-bold text-slate-400">VER DETALLE →</span>
                </div>`).join('')}
            </div>`;
    }

    if (vista === 'Facturas') {
        const misF = DB.facturas.filter(f => f.email === mail);
        cont.innerHTML = misF.reverse().map(f => `
            <div class="card flex justify-between items-center ${f.estado === 'PENDIENTE' ? 'border-l-8 border-orange-400' : 'border-l-8 border-emerald-400'}">
                <div><p class="text-[10px] text-slate-400 font-bold">FACTURA ${f.idC}</p><p class="font-bold text-lg">${f.valor.toLocaleString('es-CO', {style:'currency', currency:'COP', minimumFractionDigits:0})}</p></div>
                <span class="badge-status ${f.estado === 'PENDIENTE' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}">${f.estado}</span>
            </div>
        `).join('');
    }
}

// --- LOGICA MODAL ---
function verDetalle(idC) {
    const c = DB.consultas.find(x => x.id === idC);
    const p = DB.pacientes.find(x => x.id === c.idMascota);
    const modal = document.getElementById('modal-container');
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-2 text-slate-800">Detalle de Consulta</h2>
        <p class="text-blue-500 font-bold mb-6">${p.nombre} • ${c.fecha}</p>
        <div class="space-y-4 border-t pt-6 text-sm">
            <p><b>Motivo:</b> ${c.motivo}</p>
            <div class="bg-slate-50 p-4 rounded-2xl italic text-slate-600 border border-slate-100">" ${c.diag} "</div>
            <div class="flex justify-between items-center bg-blue-600 text-white p-6 rounded-3xl">
                <div><p class="text-[10px] opacity-70 uppercase font-bold">Recetado</p><p class="font-bold text-lg">${c.med}</p></div>
                <div class="text-right"><p class="text-[10px] opacity-70 uppercase font-bold">Valor</p><p class="font-bold text-lg">$${c.costo.toLocaleString()}</p></div>
            </div>
        </div>
        <button onclick="cerrarModal()" class="w-full mt-8 p-4 bg-slate-900 text-white rounded-2xl font-bold">Cerrar Detalle</button>
    `;
}

function abrirNuevaConsulta() {
    const modal = document.getElementById('modal-container');
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-6">Nueva Orden Médica</h2>
        <div class="space-y-3 text-left">
            <label class="text-[10px] font-bold text-slate-400 ml-2">PACIENTE</label>
            <select id="f-pet" class="input-field">${DB.pacientes.map(p => `<option value="${p.id}">${p.nombre} (${p.emailDueno})</option>`).join('')}</select>
            <label class="text-[10px] font-bold text-slate-400 ml-2">MOTIVO</label>
            <input id="f-mot" placeholder="Ej: Control de Otitis" class="input-field">
            <label class="text-[10px] font-bold text-slate-400 ml-2">MEDICAMENTO</label>
            <select id="f-med" class="input-field">${MEDICAMENTOS_REALES.map(m => `<option value="${m.n}|${m.p}">${m.n} - $${m.p.toLocaleString()}</option>`).join('')}</select>
            <button onclick="guardarNuevaConsulta()" class="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold mt-4">Guardar y Generar Factura Pendiente</button>
            <button onclick="cerrarModal()" class="w-full p-2 text-slate-400 text-xs">Cancelar</button>
        </div>
    `;
}

function guardarNuevaConsulta() {
    const idPet = document.getElementById('f-pet').value;
    const pet = DB.pacientes.find(x => x.id === idPet);
    const idC = `CONS-${Date.now()}`;
    const medData = document.getElementById('f-med').value.split('|');
    const valorTotal = 60000 + parseInt(medData[1]);

    DB.consultas.push({
        id: idC, idMascota: idPet, fecha: new Date().toLocaleDateString(),
        motivo: document.getElementById('f-mot').value, diag: "Consulta generada por el doctor hoy.",
        med: medData[0], costo: valorTotal
    });
    DB.facturas.push({ idC: idC, email: pet.emailDueno, valor: valorTotal, estado: "PENDIENTE" });
    
    save();
    alert("Consulta Guardada. Se generó factura PENDIENTE para el dueño.");
    cerrarModal();
    navegar('Panel Doctor');
}

function cerrarModal() { document.getElementById('modal-container').classList.add('hidden'); }

// --- LOGIN ---
function handleLogin() {
    const e = document.getElementById('login-email').value;
    const r = document.getElementById('login-role').value;
    if(!e.includes('@')) return alert("Correo no válido");
    sessionStorage.setItem('u_email', e);
    sessionStorage.setItem('u_role', r);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
}

function initApp() {
    const r = sessionStorage.getItem('u_role');
    const e = sessionStorage.getItem('u_email');
    document.getElementById('welcome-msg').innerText = `Bienvenido, ${e.split('@')[0]}`;
    document.getElementById('role-badge').innerText = r === 'doctor' ? 'Médico Veterinario' : 'Portal Propietario';
    
    const menu = document.getElementById('nav-menu');
    const items = r === 'doctor' ? ['Panel Doctor'] : ['Mis Mascotas', 'Historial Médico', 'Facturas'];
    menu.innerHTML = items.map(i => `<button onclick="navegar('${i}')" class="w-full text-left p-4 rounded-2xl hover:bg-blue-50 font-medium text-slate-500 hover:text-blue-600 transition">${i}</button>`).join('');
    
    navegar(items[0]);
}