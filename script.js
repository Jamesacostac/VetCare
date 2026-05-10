// --- DATOS MAESTROS (MEDICAMENTOS REALES) ---
const MEDICAMENTOS_DB = [
    { n: "Apoquel 5.4mg (20 tab)", s: 15, p: 145000 },
    { n: "Bravecto Perros 10-20kg", s: 8, p: 138000 },
    { n: "Simparica Trio (3 tab)", s: 12, p: 115000 },
    { n: "Nexgard Spectra (3 tab)", s: 20, p: 142000 },
    { n: "Meloxicam Oral 10ml", s: 25, p: 35000 },
    { n: "Amoxicilina + Clav 250mg", s: 30, p: 48000 },
    { n: "Enrofloxacina 150mg", s: 18, p: 42000 },
    { n: "Doxiciclina 100mg", s: 22, p: 38000 }
];

let DB = {
    pacientes: JSON.parse(localStorage.getItem('vpro_pac')) || [],
    consultas: JSON.parse(localStorage.getItem('vpro_con')) || [],
    facturas: JSON.parse(localStorage.getItem('vpro_fac')) || []
};

// --- AUTO-GENERADOR (45 PACIENTES) ---
(function seed() {
    if (DB.pacientes.length === 0) {
        for (let i = 1; i <= 45; i++) {
            DB.pacientes.push({
                id: i,
                nombre: (i % 2 === 0 ? "Thor" : "Luna") + ` ${i}`,
                especie: i % 2 === 0 ? "Canino" : "Felino",
                raza: i % 2 === 0 ? "Golden Retriever" : "Persa",
                peso: (4 + (i % 12)) + " kg",
                edad: (1 + (i % 8)) + " AÑOS",
                emailDueno: `correo${i}@vet.com`
            });
            // Una consulta inicial por defecto para cada uno
            const idC = `C-${i}-0`;
            DB.consultas.push({
                id: idC, idMascota: i, fecha: "2024-01-10",
                motivo: "Control Preventivo", diag: "Estado general óptimo.",
                med: "Multivitamínico Pet", costo: 60000
            });
            DB.facturas.push({ idC: idC, email: `correo${i}@vet.com`, valor: 60000, estado: "PAGADA" });
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
        cont.innerHTML = `
            <div class="card col-span-full bg-blue-600 text-white flex justify-between items-center p-8 mb-4">
                <div><h2 class="text-2xl font-bold">Gestión de Pacientes</h2><p>45 Registros Activos</p></div>
                <button onclick="abrirNuevaConsulta()" class="bg-white text-blue-600 px-6 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition">+ Nueva Consulta</button>
            </div>` + 
        DB.pacientes.map(p => `
            <div class="card cursor-pointer hover:border-blue-300 transition-all" onclick="verFichaPaciente(${p.id})">
                <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold text-slate-400">#${p.id}</span>
                    <span class="badge-status bg-blue-50 text-blue-600">${p.edad}</span>
                </div>
                <h4 class="font-bold text-xl mt-2">${p.nombre}</h4>
                <p class="text-xs text-slate-500">${p.especie} • ${p.raza} • ${p.peso}</p>
                <div class="mt-4 pt-4 border-t flex justify-between items-center">
                    <p class="text-[10px] text-blue-400 font-bold uppercase">${p.emailDueno}</p>
                    <span class="text-slate-300 text-[10px]">VER FICHA →</span>
                </div>
            </div>
        `).join('');
    }

    if (vista === 'Inventario') {
        cont.innerHTML = `
            <div class="card col-span-full">
                <h2 class="text-xl font-bold mb-6">Stock de Medicamentos Reales</h2>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="text-slate-400 uppercase text-[10px] border-b">
                            <tr><th class="py-3">Medicina</th><th class="py-3">Stock</th><th class="py-3">Precio Unit.</th></tr>
                        </thead>
                        <tbody>
                            ${MEDICAMENTOS_DB.map(m => `
                                <tr class="border-b hover:bg-slate-50 transition">
                                    <td class="py-4 font-bold">${m.n}</td>
                                    <td class="py-4 ${m.s < 10 ? 'text-red-500 font-bold' : 'text-slate-500'}">${m.s} und</td>
                                    <td class="py-4 text-emerald-600 font-bold">$ ${m.p.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
    }

    if (vista === 'Mis Mascotas') {
        const misP = DB.pacientes.filter(p => p.emailDueno === mail);
        cont.innerHTML = misP.map(p => `
            <div class="card border-b-8 border-blue-500">
                <div class="text-4xl mb-4">🐾</div>
                <h4 class="font-bold text-2xl">${p.nombre}</h4>
                <p class="text-sm mt-2"><b>Especie:</b> ${p.especie} | <b>Edad:</b> ${p.edad}</p>
                <p class="text-xs text-slate-400 mt-4">Raza: ${p.raza} | Peso: ${p.peso}</p>
            </div>
        `).join('');
    }

    if (vista === 'Historial') {
        const miP = DB.pacientes.find(p => p.emailDueno === mail);
        if(!miP) return cont.innerHTML = "<p>No hay datos disponibles.</p>";
        const misC = DB.consultas.filter(c => c.idMascota == miP.id);
        cont.innerHTML = `<h2 class="col-span-full font-bold text-xl mb-4">Historial Clínico</h2>` + 
        misC.reverse().map(c => `
            <div class="card cursor-pointer hover:bg-slate-50" onclick="verReceta('${c.id}')">
                <p class="text-[10px] font-bold text-blue-500">${c.fecha}</p>
                <h4 class="font-bold text-lg">${c.motivo}</h4>
                <p class="text-xs text-slate-500 mt-1 truncate">${c.diag}</p>
                <p class="text-[10px] mt-4 text-blue-400 font-bold italic">VER RECETA →</p>
            </div>
        `).join('');
    }

    if (vista === 'Facturas') {
        const misF = DB.facturas.filter(f => f.email === mail);
        cont.innerHTML = misF.reverse().map(f => `
            <div class="card flex justify-between items-center ${f.estado === 'PENDIENTE' ? 'border-l-8 border-orange-400' : 'border-l-8 border-emerald-400'}">
                <div><p class="text-[10px] text-slate-400 uppercase font-bold">Ref: ${f.idC}</p><p class="font-bold text-xl">$ ${f.valor.toLocaleString()}</p></div>
                <span class="badge-status ${f.estado === 'PENDIENTE' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}">${f.estado}</span>
            </div>
        `).join('');
    }
}

// --- FUNCIONES DE MODAL ---
function verFichaPaciente(id) {
    const p = DB.pacientes.find(x => x.id == id);
    const modal = document.getElementById('modal-container');
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <div class="text-center mb-6">
            <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🐾</div>
            <h2 class="text-3xl font-bold">${p.nombre}</h2>
            <p class="text-slate-400 font-medium uppercase text-[10px] tracking-widest">Ficha Técnica Veterinaria</p>
        </div>
        <div class="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-[2rem] border mb-6">
            <div><p class="text-[10px] font-bold text-slate-400 uppercase">Especie</p><p class="font-bold">${p.especie}</p></div>
            <div><p class="text-[10px] font-bold text-slate-400 uppercase">Raza</p><p class="font-bold">${p.raza}</p></div>
            <div><p class="text-[10px] font-bold text-slate-400 uppercase">Peso Actual</p><p class="font-bold">${p.peso}</p></div>
            <div><p class="text-[10px] font-bold text-slate-400 uppercase">Edad</p><p class="font-bold">${p.edad}</p></div>
        </div>
        <div class="p-4 border-l-4 border-blue-500 bg-blue-50 mb-6 rounded-r-xl">
            <p class="text-[10px] font-bold text-blue-600">PROPIETARIO VINCULADO</p>
            <p class="font-bold text-slate-700">${p.emailDueno}</p>
        </div>
        <button onclick="cerrarModal()" class="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold">Cerrar Ficha</button>
    `;
}

function verReceta(idC) {
    const c = DB.consultas.find(x => x.id === idC);
    const modal = document.getElementById('modal-container');
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Receta y Detalle Médico</h2>
        <div class="p-6 bg-blue-50 rounded-3xl border-l-8 border-blue-600 mb-6">
            <p class="text-[10px] font-bold text-blue-600 uppercase mb-2">Diagnóstico</p>
            <p class="font-bold text-lg mb-4">"${c.diag}"</p>
            <p class="text-[10px] font-bold text-blue-600 uppercase mb-2">Tratamiento Sugerido</p>
            <p class="text-xl font-bold italic">💊 ${c.med}</p>
        </div>
        <div class="flex justify-between items-center text-sm px-2">
            <span class="text-slate-400">Fecha: ${c.fecha}</span>
            <span class="font-bold text-blue-600">Ref: ${c.id}</span>
        </div>
        <button onclick="cerrarModal()" class="w-full mt-8 p-4 bg-slate-900 text-white rounded-2xl font-bold">Cerrar Detalle</button>
    `;
}

function abrirNuevaConsulta() {
    const modal = document.getElementById('modal-container');
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-6 text-slate-800">Nueva Orden Médica</h2>
        <div class="space-y-4">
            <label class="text-[10px] font-bold text-slate-400 px-2 uppercase">Seleccionar Paciente</label>
            <select id="f-pet" class="input-field">
                ${DB.pacientes.map(p => `<option value="${p.id}">${p.nombre} (${p.emailDueno})</option>`).join('')}
            </select>
            <label class="text-[10px] font-bold text-slate-400 px-2 uppercase">Diagnóstico Clínico</label>
            <input id="f-diag" placeholder="Ej: Otitis bacteriana leve" class="input-field">
            <label class="text-[10px] font-bold text-slate-400 px-2 uppercase">Medicamento Recetado</label>
            <select id="f-med" class="input-field">
                ${MEDICAMENTOS_DB.map(m => `<option value="${m.n}|${m.p}">${m.n} - $${m.p.toLocaleString()}</option>`).join('')}
            </select>
            <button onclick="guardarConsulta()" class="w-full p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">Guardar y Facturar</button>
            <button onclick="cerrarModal()" class="w-full p-2 text-slate-400 text-xs">Cancelar Operación</button>
        </div>
    `;
}

function guardarConsulta() {
    const idPet = document.getElementById('f-pet').value;
    const pet = DB.pacientes.find(x => x.id == idPet);
    const diag = document.getElementById('f-diag').value;
    const medData = document.getElementById('f-med').value.split('|');
    const idC = `ORD-${Date.now()}`;
    const valorTotal = parseInt(medData[1]) + 60000; // Medicamento + base consulta

    if(!diag) return alert("Por favor ingresa un diagnóstico.");

    DB.consultas.push({
        id: idC, idMascota: idPet, fecha: new Date().toLocaleDateString(),
        motivo: "Consulta Médica", diag: diag,
        med: medData[0], costo: valorTotal
    });
    DB.facturas.push({ idC: idC, email: pet.emailDueno, valor: valorTotal, estado: "PENDIENTE" });
    
    save();
    alert("Consulta Guardada. Factura pendiente enviada al perfil del dueño.");
    cerrarModal();
    navegar('Panel Doctor');
}

// --- CORE ---
function handleLogin() {
    const e = document.getElementById('login-email').value;
    const r = document.getElementById('login-role').value;
    if(!e.includes('@')) return alert("Introduce un correo válido.");
    sessionStorage.setItem('u_email', e);
    sessionStorage.setItem('u_role', r);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initApp();
}

function initApp() {
    const r = sessionStorage.getItem('u_role');
    const e = sessionStorage.getItem('u_email');
    document.getElementById('welcome-msg').innerText = `Hola, ${e.split('@')[0]}`;
    document.getElementById('role-badge').innerText = r === 'doctor' ? 'MÉDICO VETERINARIO ADMIN' : 'PORTAL DE PROPIETARIO';
    
    const menu = document.getElementById('nav-menu');
    const items = r === 'doctor' ? ['Panel Doctor', 'Inventario'] : ['Mis Mascotas', 'Historial', 'Facturas'];
    menu.innerHTML = items.map(i => `<button onclick="navegar('${i}')" class="w-full text-left p-4 rounded-2xl hover:bg-blue-50 font-medium text-slate-500 hover:text-blue-600 transition">${i}</button>`).join('');
    
    navegar(items[0]);
}

function cerrarModal() { document.getElementById('modal-container').classList.add('hidden'); }