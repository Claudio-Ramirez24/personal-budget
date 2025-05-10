// Array global para almacenar todos los movimientos
let movimientos = [];

// Función para cambiar entre pestañas
function cambiarTab(tabId) {
    // Desactivar todas las pestañas
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar la pestaña seleccionada
    document.querySelector(`.tab[onclick="cambiarTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
    
    // Actualizar contenido según la pestaña
    if (tabId === 'resumen') {
        actualizarResumenGeneral();
    } else if (tabId === 'resumenTipo') {
        actualizarResumenPorTipo();
    }
}

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
    const mensajesDiv = document.getElementById('mensajes');
    mensajesDiv.innerHTML = `<div class="mensaje ${tipo}">${texto}</div>`;
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
        mensajesDiv.innerHTML = '';
    }, 3000);
}

// Función para limpiar el formulario
function limpiarFormulario() {
    document.getElementById('formMovimiento').reset();
}

// Función para registrar un nuevo movimiento
function registrarMovimiento() {
    // Obtener valores del formulario
    const nombre = document.getElementById('nombre').value.trim();
    const tipo = document.getElementById('tipo').value;
    const montoInput = document.getElementById('monto').value;
    const monto = parseFloat(montoInput);
    
    console.log("Valores capturados:", { nombre, tipo, montoInput, monto });
    
    // Validaciones
    if (!nombre) {
        mostrarMensaje('El nombre del movimiento no puede estar vacío.', 'error');
        return;
    }
    
    if (!tipo) {
        mostrarMensaje('Debe seleccionar un tipo de movimiento.', 'error');
        return;
    }
    
    if (isNaN(monto) || monto <= 0) {
        mostrarMensaje('El monto debe ser un número mayor que cero.', 'error');
        return;
    }
    
    // Crear el objeto movimiento
    const movimiento = {
        nombre: nombre,
        tipo: tipo,
        monto: monto,
        fecha: new Date()
    };
    
    console.log("Movimiento a registrar:", movimiento);
    
    // Agregar al array de movimientos
    movimientos.push(movimiento);
    console.log("Movimientos actuales:", movimientos);
    
    // Mostrar mensaje de éxito
    mostrarMensaje(`Movimiento "${nombre}" registrado correctamente.`, 'exito');
    
    // Actualizar la tabla de movimientos
    actualizarTablaMovimientos();
    
    // Actualizar los resúmenes
    actualizarResumenGeneral();
    actualizarResumenPorTipo();
    
    // Limpiar formulario
    limpiarFormulario();
}

// Función para actualizar la tabla de movimientos
function actualizarTablaMovimientos() {
    const tbody = document.querySelector('#tablaMovimientos tbody');
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    // Verificar si hay movimientos
    if (movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay movimientos registrados</td></tr>';
        return;
    }
    
    // Agregar cada movimiento a la tabla
    for (let i = 0; i < movimientos.length; i++) {
        const m = movimientos[i];
        const fechaFormateada = m.fecha.toLocaleDateString();
        
        const fila = document.createElement('tr');
        
        // Estilo según tipo
        if (m.tipo === 'ingreso') {
            fila.style.color = '#155724';
        } else {
            fila.style.color = '#721c24';
        }
        
        fila.innerHTML = `
            <td>${m.nombre}</td>
            <td>${m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}</td>
            <td>$${m.monto.toFixed(2)}</td>
            <td>${fechaFormateada}</td>
        `;
        
        tbody.appendChild(fila);
    }
}

// Función para calcular el saldo total
function calcularTotalSaldo() {
    let saldo = 0;
    
    for (let i = 0; i < movimientos.length; i++) {
        if (movimientos[i].tipo === 'ingreso') {
            saldo += movimientos[i].monto;
        } else if (movimientos[i].tipo === 'egreso') {
            saldo -= movimientos[i].monto;
        }
    }
    
    return saldo;
}

// Función para actualizar el resumen general
function actualizarResumenGeneral() {
    const resumenDiv = document.getElementById('resumenGeneral');
    
    // Verificar si hay movimientos
    if (movimientos.length === 0) {
        resumenDiv.innerHTML = '<p>No hay movimientos registrados todavía.</p>';
        return;
    }
    
    // Calcular totales
    let totalIngresos = 0;
    let totalEgresos = 0;
    
    for (let i = 0; i < movimientos.length; i++) {
        if (movimientos[i].tipo === 'ingreso') {
            totalIngresos += movimientos[i].monto;
        } else if (movimientos[i].tipo === 'egreso') {
            totalEgresos += movimientos[i].monto;
        }
    }
    
    const saldoTotal = totalIngresos - totalEgresos;
    
    // Crear HTML del resumen
    resumenDiv.innerHTML = `
        <p><strong>Total de movimientos:</strong> ${movimientos.length}</p>
        <p><strong>Total ingresos:</strong> $${totalIngresos.toFixed(2)}</p>
        <p><strong>Total egresos:</strong> $${totalEgresos.toFixed(2)}</p>
        <p><strong>Saldo actual:</strong> 
            <span style="color: ${saldoTotal >= 0 ? '#155724' : '#721c24'}; font-weight: bold;">
                $${saldoTotal.toFixed(2)}
            </span>
        </p>
    `;
}

// Función para actualizar el resumen por tipo
function actualizarResumenPorTipo() {
    const resumenDiv = document.getElementById('resumenPorTipo');
    
    // Verificar si hay movimientos
    if (movimientos.length === 0) {
        resumenDiv.innerHTML = '<p>No hay movimientos registrados todavía.</p>';
        return;
    }
    
    // Calcular totales por tipo
    const totalesPorTipo = {};
    
    for (let i = 0; i < movimientos.length; i++) {
        const tipo = movimientos[i].tipo;
        
        if (!totalesPorTipo[tipo]) {
            totalesPorTipo[tipo] = 0;
        }
        
        totalesPorTipo[tipo] += movimientos[i].monto;
    }
    
    // Crear HTML del resumen
    let html = '<h3>Totales por tipo:</h3>';
    
    for (const tipo in totalesPorTipo) {
        const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
        const colorTexto = tipo === 'ingreso' ? '#155724' : '#721c24';
        
        html += `
            <p>
                <strong>${tipoCapitalizado}:</strong> 
                <span style="color: ${colorTexto}; font-weight: bold;">
                    $${totalesPorTipo[tipo].toFixed(2)}
                </span>
            </p>
        `;
    }
    
    resumenDiv.innerHTML = html;
}

// Inicializar la aplicación cuando se cargue la página
window.onload = function() {
    // Mostrar tabla de movimientos vacía
    actualizarTablaMovimientos();
    
    // Configurar manejo de eventos para el formulario
    document.getElementById('formMovimiento').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevenir envío del formulario
        registrarMovimiento();
    });
    
    // También manejar el evento del botón directamente
    document.querySelector('button[onclick="registrarMovimiento()"]').addEventListener('click', function(e) {
        e.preventDefault();
        registrarMovimiento();
    });
};