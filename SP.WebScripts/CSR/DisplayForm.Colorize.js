
(function () {
    // Definimos una variable para almacenar la plantilla CSR
    var overrideCtx = {};
    
    // Sobrescribimos el campo 'Color'
    overrideCtx.Templates = {};
    overrideCtx.Templates.Fields = {
        // 'Color' es el nombre interno de la columna
        "Color": {
            // Esta función se ejecutará cuando se renderice el campo en la vista
            "View": function (ctx) {
                var colorValue = ctx.CurrentItem.Color || "#ffffff";
                var itemId = ctx.CurrentItem.ID;
                var fieldName = ctx.CurrentFieldSchema.Name;
                
                // Creamos un input de tipo 'color' y le añadimos un evento 'onchange'
                var html = "<input type='color' value='" + colorValue + "' onchange='updateListItemColor(" + itemId + ", \"" + fieldName + "\", this.value);'>";
                
                return html;
            }
        }
    };
    
    // Registramos la plantilla
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

})();

// --- Función para actualizar el elemento de la lista usando JSOM ---

function updateListItemColor(itemId, fieldName, colorValue) {
    // Reemplaza 'NombreDeTuLista' por el nombre exacto de tu lista de SharePoint
    var listTitle = 'NombreDeTuLista';
    
    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listTitle);
    
    // Obtenemos el elemento por su ID
    var oListItem = oList.getItemById(itemId);
    
    // Establecemos el nuevo valor en el campo
    oListItem.set_item(fieldName, colorValue);
    
    oListItem.update();
    
    // Ejecutamos la consulta para guardar los cambios
    clientContext.executeQueryAsync(
        Function.createDelegate(this, successHandler), 
        Function.createDelegate(this, errorHandler)
    );

    function successHandler() {
        console.log("El color del elemento " + itemId + " se ha actualizado correctamente.");
    }
    
    function errorHandler(sender, args) {
        console.log('Error al actualizar el elemento: ' + args.get_message());
    }
}

