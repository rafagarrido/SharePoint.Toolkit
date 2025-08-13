function actualizarColorPorLocation(locationObjetivo, nuevoColor) {
    Calendar.getEvents().forEach(function(evento) {
        if (evento.extendedProps.location === locationObjetivo) {
            evento.setProp('color', nuevoColor); // Cambia el color
        }
    });
}