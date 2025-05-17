// Constructor Function para Movimiento
function Movimiento(nombre, tipo, monto, fecha = new Date()) {
    // Validaciones
    if (!nombre || nombre.trim() === '') {
        throw new Error('El nombre del movimiento no puede estar vacío.');
    }
    
    if (tipo !== 'ingreso' && tipo !== 'egreso') {
        throw new Error('El tipo debe ser "ingreso" o "egreso".');
    }
    
    if (isNaN(monto) || monto <= 0) {
        throw new Error('El monto debe ser un número mayor que cero.');
    }
    
    // Propiedades del objeto
    this.nombre = nombre;
    this.tipo = tipo;
    this.monto = monto;
    this.fecha = fecha;
}

// Método para renderizar un movimiento en la tabla
Movimiento.prototype.render = function() {
    const fila = document.createElement('tr');
    
    // Estilo según tipo
    if (this.tipo === 'ingreso') {
        fila.style.color = '#155724';
    } else {
        fila.style.color = '#721c24';
    }
    
    const fechaFormateada = this.fecha.toLocaleDateString();
    
    fila.innerHTML = `
        <td>${this.nombre}</td>
        <td>${this.tipo.charAt(0).toUpperCase() + this.tipo.slice(1)}</td>
        <td>$${this.monto.toFixed(2)}</td>
        <td>${fechaFormateada}</td>
    `;
    
    return fila;
};

// Constructor Function para RegistroPresupuesto
function RegistroPresupuesto() {
    this.movimientos = [];
}

// Método para agregar un movimiento
RegistroPresupuesto.prototype.agregarMovimiento = function(movimiento) {
    this.movimientos.push(movimiento);
};

// Método para obtener el saldo total
RegistroPresupuesto.prototype.calcularSaldoTotal = function() {
    return this.movimientos.reduce((saldo, movimiento) => {
        return movimiento.tipo === 'ingreso' 
            ? saldo + movimiento.monto 
            : saldo - movimiento.monto;
    }, 0);
};

// Método para calcular total de ingresos
RegistroPresupuesto.prototype.calcularTotalIngresos = function() {
    return this.movimientos
        .filter(m => m.tipo === 'ingreso')
        .reduce((total, m) => total + m.monto, 0);
};

// Método para calcular total de egresos
RegistroPresupuesto.prototype.calcularTotalEgresos = function() {
    return this.movimientos
        .filter(m => m.tipo === 'egreso')
        .reduce((total, m) => total + m.monto, 0);
};

// Método para calcular totales por tipo
RegistroPresupuesto.prototype.calcularTotalesPorTipo = function() {
    const totalesPorTipo = {};
    
    for (let i = 0; i < this.movimientos.length; i++) {
        const tipo = this.movimientos[i].tipo;
        
        if (!totalesPorTipo[tipo]) {
            totalesPorTipo[tipo] = 0;
        }
        
        totalesPorTipo[tipo] += this.movimientos[i].monto;
    }
    
    return totalesPorTipo;
};

// Método para actualizar la tabla de movimientos en el DOM
RegistroPresupuesto.prototype.actualizarTablaMovimientos = function() {
    const tbody = document.querySelector('#tablaMovimientos tbody');
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    // Verificar si hay movimientos
    if (this.movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay movimientos registrados</td></tr>';
        return;
    }
    
    // Agregar cada movimiento a la tabla usando el método render()
    for (let i = 0; i < this.movimientos.length; i++) {
        tbody.appendChild(this.movimientos[i].render());
    }
};

// Método para actualizar el resumen general
RegistroPresupuesto.prototype.actualizarResumenGeneral = function() {
    const resumenDiv = document.getElementById('resumenGeneral');
    
    // Verificar si hay movimientos
    if (this.movimientos.length === 0) {
        resumenDiv.innerHTML = '<p>No hay movimientos registrados todavía.</p>';
        return;
    }
    
    // Calcular totales
    const totalIngresos = this.calcularTotalIngresos();
    const totalEgresos = this.calcularTotalEgresos();
    const saldoTotal = totalIngresos - totalEgresos;
    
    // Crear HTML del resumen
    resumenDiv.innerHTML = `
        <p><strong>Total de movimientos:</strong> ${this.movimientos.length}</p>
        <p><strong>Total ingresos:</strong> $${totalIngresos.toFixed(2)}</p>
        <p><strong>Total egresos:</strong> $${totalEgresos.toFixed(2)}</p>
        <p><strong>Saldo actual:</strong> 
            <span style="color: ${saldoTotal >= 0 ? '#155724' : '#721c24'}; font-weight: bold;">
                $${saldoTotal.toFixed(2)}
            </span>
        </p>
    `;
};

// Método para actualizar el resumen por tipo
RegistroPresupuesto.prototype.actualizarResumenPorTipo = function() {
    const resumenDiv = document.getElementById('resumenPorTipo');
    
    // Verificar si hay movimientos
    if (this.movimientos.length === 0) {
        resumenDiv.innerHTML = '<p>No hay movimientos registrados todavía.</p>';
        return;
    }
    
    // Calcular totales por tipo
    const totalesPorTipo = this.calcularTotalesPorTipo();
    
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
};

// Crear instancia global del registro de presupuesto
const registro = new RegistroPresupuesto();

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
        registro.actualizarResumenGeneral();
    } else if (tabId === 'resumenTipo') {
        registro.actualizarResumenPorTipo();
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
    try {
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const tipo = document.getElementById('tipo').value;
        const montoInput = document.getElementById('monto').value;
        const monto = parseFloat(montoInput);
        
        // Crear una nueva instancia de Movimiento
        const movimiento = new Movimiento(nombre, tipo, monto);
        
        // Agregar al registro
        registro.agregarMovimiento(movimiento);
        
        // Mostrar mensaje de éxito
        mostrarMensaje(`Movimiento "${nombre}" registrado correctamente.`, 'exito');
        
        // Actualizar la interfaz
        registro.actualizarTablaMovimientos();
        registro.actualizarResumenGeneral();
        registro.actualizarResumenPorTipo();
        
        // Limpiar formulario
        limpiarFormulario();
    } catch (error) {
        // Mostrar mensaje de error
        mostrarMensaje(error.message, 'error');
    }
}

// Inicializar la aplicación cuando se cargue la página
window.onload = function() {
    // Mostrar tabla de movimientos vacía
    registro.actualizarTablaMovimientos();
    
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