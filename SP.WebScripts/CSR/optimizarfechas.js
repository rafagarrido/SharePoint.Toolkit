function normalizarFechaSharePoint(fechaSP) {
    if (!fechaSP) return null;

    // Intenta parsear usando moment con formato español
    var fechaISO = moment(fechaSP, ["DD/MM/YYYY", "DD-MM-YYYY"], true).toISOString();

    return fechaISO; // Devuelve en formato ISO que FullCalendar entiende
}

// Ejemplo
var fechaOriginal = "11/08/2025"; // de la lista SharePoint
var fechaISO = normalizarFechaSharePoint(fechaOriginal);
console.log(fechaISO); // 2025-08-11T00:00:00.000Z
