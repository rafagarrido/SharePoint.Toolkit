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