function openColorModal(eventData) {
    // eventData = array u objeto con la info de eventos y colores actuales
    // Ejemplo: [{ GT: "Evento1", Color: "#ff0000" }, { GT: "Evento2", Color: "#00ff00" }]

    // Generar HTML dinámicamente
    var html = '<div style="padding:16px;max-width:500px;font-family:Segoe UI,Arial,sans-serif;">';
    html += '<h3 style="margin-top:0;">Editar colores de eventos</h3>';

    eventData.forEach(function(ev, index) {
        var gt = ev.GT || '';
        var color = ev.Color || '#ffffff';
        if (color.charAt(0) !== '#') color = '#' + color;

        html += '<div style="margin-bottom:12px;">';
        html += '<label style="display:block;margin-bottom:4px;"><strong>' + gt + '</strong></label>';
        html += '<input type="color" value="' + color + '" ' +
                'onchange="window._modalColorChanges[' + index + ']=this.value" ' +
                'style="width:60px;height:34px;border:1px solid #ccc;" />';
        html += '</div>';
    });

    html += '<div style="margin-top:20px;text-align:right;">';
    html += '<button type="button" onclick="SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.cancel, null);">Cancelar</button> ';
    html += '<button type="button" onclick="window._saveModalColors();">Guardar</button>';
    html += '</div>';

    html += '</div>';

    // Guardamos datos y cambios en variables globales temporales
    window._modalColorData = eventData;
    window._modalColorChanges = [];

    // Función de guardado
    window._saveModalColors = function() {
        // Actualizar lista en SharePoint usando API REST o tu lógica actual
        // Recorremos los cambios y actualizamos solo los que se modificaron
        var updates = [];
        window._modalColorData.forEach(function(ev, index) {
            if (window._modalColorChanges[index]) {
                updates.push({
                    GT: ev.GT,
                    NewColor: window._modalColorChanges[index]
                });
            }
        });

        if (updates.length > 0) {
            console.log("Colores a actualizar:", updates);
            // Aquí llamas a tu función ya existente que actualiza en SharePoint
            actualizarColoresEnLista(updates).then(function() {
                // Cerrar modal
                SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.OK, null);
                // Refrescar fullCalendar
                if (typeof refreshFullCalendar === 'function') {
                    refreshFullCalendar();
                }
            });
        } else {
            SP.UI.ModalDialog.commonModalDialogClose(SP.UI.DialogResult.cancel, null);
        }
    };

    // Mostrar modal
    var options = {
        title: "Editar colores",
        html: html,
        width: 520,
        height: 400
    };
    SP.SOD.executeFunc('sp.ui.dialog.js', 'SP.UI.ModalDialog', function () {
        SP.UI.ModalDialog.showModalDialog(options);
    });
}
