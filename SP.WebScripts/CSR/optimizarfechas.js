
// Asegúrate de cargar moment.js antes de usarlo
// Puedes incluirlo así en tu CSR o página:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/locale/es.min.js"></script>

// Convierte fecha en formato español de SharePoint a ISO
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