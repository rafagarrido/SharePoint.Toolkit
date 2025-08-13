function UpdateColor(){
// Configuración
var listTitle = "NombreDeLaLista";
var tituloBuscado = "Mi Título Único";
var nuevoColor = "Rojo";

// Obtener contexto y lista
var context = SP.ClientContext.get_current();
var list = context.get_web().get_lists().getByTitle(listTitle);

// Crear query CAML para filtrar por el título
var camlQuery = new SP.CamlQuery();
camlQuery.set_viewXml(
    "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>" + tituloBuscado + "</Value></Eq></Where></Query></View>"
);

var items = list.getItems(camlQuery);
context.load(items);

context.executeQueryAsync(
    function() {
        if (items.get_count() === 0) {
            console.log("No se encontró ningún elemento con ese título.");
            return;
        }

        // Como el título es único, tomamos el primer item
        var item = items.getItemAtIndex(0);

        // Actualizar columna Color
        item.set_item('Color', nuevoColor); // Nombre interno de la columna
        item.update();

        context.executeQueryAsync(
            function() {
                console.log("Elemento actualizado correctamente.");
            },
            function(sender, args) {
                console.error("Error al actualizar el elemento: " + args.get_message());
            }
        );

    },
    function(sender, args) {
        console.error("Error al obtener el item: " + args.get_message());
    }
);
}
function loadSharePointEvents(successCallback) {
    $.ajax({
        url: "/_api/web/lists/getbytitle('MiLista')/items?$select=Title,Start,End",
        type: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function(data) {
            var events = data.d.results.map(function(item) {
                return {
                    title: item.Title,
                    start: item.Start,
                    end: item.End
                };
            });
            successCallback(events);
        }
    });
}
function loadSharePointEvents(info, successCallback, failureCallback) {
    var context = SP.ClientContext.get_current();
    var lista = context.get_web().get_lists().getByTitle('MiLista');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<View><Query></Query></View>"); // Ajusta la query si quieres filtrar
    var items = lista.getItems(camlQuery);

    context.load(items);
    context.executeQueryAsync(
        function() {
            var events = [];
            var enumerator = items.getEnumerator();
            while (enumerator.moveNext()) {
                var item = enumerator.get_current();
                events.push({
                    title: item.get_item('Title'),
                    start: item.get_item('Start'),
                    end: item.get_item('End')
                });
            }
            successCallback(events);
        },
        function(sender, args) {
            console.error('Error cargando eventos:', args.get_message());
            failureCallback(args.get_message());
        }
    );
}