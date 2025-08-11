
(function () {
    // Definimos una variable para almacenar la plantilla CSR
    var overrideCtx = {};

    // Sobrescribimos el campo 'Color'
    overrideCtx.Templates = {};
    overrideCtx.Templates.Fields = {
        // 'Color' es el nombre interno de la columna
        "Color": {
            // Esta función se ejecutará cuando se renderice el campo en el modo de vista (display)
            "View": function (ctx) {
                // Obtenemos el valor del campo
                var colorValue = ctx.CurrentItem.Color;
                // Si el valor no es nulo o vacío, lo mostramos
                if (colorValue) {
                    // Creamos un elemento span con el color de fondo
                    return "<span style='display:inline-block;width:20px;height:20px;background-color:" + colorValue + ";border:1px solid #ccc;'></span> " + colorValue;
                }
                // Si el valor es nulo, devolvemos una cadena vacía
                return "";
            },
            // Esta función se ejecutará cuando se renderice el campo en el modo de edición o nuevo elemento (edit/new)
            "EditForm": function (ctx) {
                // Obtenemos el valor actual del campo
                var colorValue = ctx.CurrentItem.Color || "#000000";
                // Devolvemos el HTML para un input de tipo 'color'
                return "<input type='color' id='" + ctx.CurrentFieldSchema.Name + "' name='" + ctx.CurrentFieldSchema.Name + "' value='" + colorValue + "'>";
            },
            "NewForm": function (ctx) {
                // Para el formulario de nuevo elemento, establecemos un valor por defecto
                var colorValue = "#000000";
                return "<input type='color' id='" + ctx.CurrentFieldSchema.Name + "' name='" + ctx.CurrentFieldSchema.Name + "' value='" + colorValue + "'>";
            }
        }
    };

    // Registramos la plantilla
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
})();
