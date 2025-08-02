/**
 * Form.ColorPicker.js
 * CSR para formularios New y Edit.
 * Cambia el campo Color a input tipo color.
 * Al guardar, si el color es distinto a uno existente, actualiza todos los ítems para sincronizar el color.
 */

SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
  var overrideCtx = {};
  overrideCtx.Templates = {};

  // Solo aplicamos en formularios New y Edit
  overrideCtx.OnPreRender = function(ctx) {
    var formType = ctx.FormContext ? ctx.FormContext.formType : null;
    if (formType !== SPClientTemplates.ClientFormType.NewForm && formType !== SPClientTemplates.ClientFormType.EditForm) {
      SPClientTemplates.TemplateManager.RegisterTemplateOverrides({});
    }
  };

  overrideCtx.Templates.Fields = {
    // Cambiar "Color" por el InternalName de tu columna
    "Color": {
      "EditForm": function(ctx) {
        var fieldSchema = ctx.CurrentFieldSchema;
        var fieldValue = ctx.CurrentFieldValue || "#000000";

        // Creamos input tipo color
        var inputId = ctx.FormContext.fieldName + "_ColorPicker";
        var html = "<input type='color' id='" + inputId + "' name='" + inputId + "' value='" + fieldValue + "' style='width:100px;' />";

        // Guardamos el id en FormContext para recuperarlo luego
        ctx.FormContext.registerGetValueCallback(fieldSchema.Name, function() {
          var val = document.getElementById(inputId).value;
          return val;
        });

        return html;
      },

      "NewForm": function(ctx) {
        // Reutilizamos igual que en EditForm
        return overrideCtx.Templates.Fields.Color.EditForm(ctx);
      }
    }
  };

  // Capturamos el submit del formulario para ejecutar la lógica
  overrideCtx.OnPostRender = function(ctx) {
    var formCtx = ctx.FormContext;
    if (!formCtx) return;

    var formType = formCtx.formType;
    if (formType !== SPClientTemplates.ClientFormType.NewForm && formType !== SPClientTemplates.ClientFormType.EditForm) {
      return;
    }

    // Reemplazamos el submit para añadir lógica antes de guardar
    var saveButton = document.querySelector("input[type='button'][id$='diidIOSaveItem']");
    if (!saveButton) return;

    // Solo una vez
    if (saveButton._colorPickerAttached) return;
    saveButton._colorPickerAttached = true;

    saveButton.addEventListener("click", function(e) {
      e.preventDefault();

      var newColor = formCtx.fieldNameValues["Color"];
      if (!newColor) newColor = "#000000";

      // Validamos si el color nuevo es diferente a los existentes
      checkAndUpdateColors(newColor, ctx);
    });
  };

  // Función para chequear y actualizar colores
  function checkAndUpdateColors(newColor, ctx) {
    var listTitle = ctx.listName || _spPageContextInfo.listTitle;

    var clientContext = new SP.ClientContext.get_current();
    var oList = clientContext.get_web().get_lists().getByTitle(listTitle);

    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query></Query></View>');

    var collListItem = oList.getItems(camlQuery);
    clientContext.load(collListItem);
    clientContext.executeQueryAsync(
      function() {
        var enumerator = collListItem.getEnumerator();
        var needUpdate = false;

        // Recorremos para ver si hay algun elemento con el color nuevo
        while (enumerator.moveNext()) {
          var currentItem = enumerator.get_current();
          var colorVal = currentItem.get_item("Color");
          if (colorVal && colorVal.toLowerCase() === newColor.toLowerCase()) {
            needUpdate = false; // Ya existe el color, no hace falta actualizar todo
            break;
          } else {
            needUpdate = true;
          }
        }

        if (!needUpdate) {
          // Color ya existe, guardamos el formulario sin cambios globales
          ctx.FormContext.submit();
          return;
        }

        // Si hay que actualizar, recorremos otra vez y modificamos todos
        var itemsToUpdate = [];
        enumerator = collListItem.getEnumerator();
        while (enumerator.moveNext()) {
          var currentItem = enumerator.get_current();
          currentItem.set_item("Color", newColor);
          currentItem.update();
          itemsToUpdate.push(currentItem);
        }

        // Ejecutamos la actualización en lote
        clientContext.executeQueryAsync(
          function() {
            // Cuando termine la actualización global, guardamos el formulario
            ctx.FormContext.submit();
          },
          function(sender, args) {
            alert("Error actualizando colores globales: " + args.get_message());
            // Opcional: guardamos de todas formas el formulario
            ctx.FormContext.submit();
          }
        );

      },
      function(sender, args) {
        alert("Error obteniendo elementos: " + args.get_message());
        ctx.FormContext.submit();
      }
    );
  }

  // Registramos las overrides
  SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
});
