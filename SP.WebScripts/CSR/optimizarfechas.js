
function normalizarFechaSharePoint(fechaSP) {
    if (!fechaSP) return null;

    // Asegurar que las horas y minutos tienen siempre dos dígitos
    fechaSP = fechaSP.replace(
        /(\s)(\d):(\d{2})/, // Ej: " 8:00"
        function(_, espacio, hora, minutos) {
            return espacio + hora.padStart(2, '0') + ':' + minutos;
        }
    );

    var fechaISO = moment(
        fechaSP.trim(),
        [
            "DD/MM/YYYY HH:mm",
            "DD-MM-YYYY HH:mm",
            "DD/MM/YYYY",
            "DD-MM-YYYY"
        ],
        true
    ).toISOString();

    return fechaISO;
}

// Ejemplo:
console.log(normalizarFechaSharePoint("26/06/2025 8:00"));
// → 2025-06-26T08:00:00.000Z