/**
 * DisplayForm.FullCalendar.js
 * CSR override para renderizar FullCalendar en la vista "Reuniones Global" de una lista de SharePoint 2019.
 * Debe cargarse via JSLink en la vista específica o en la lista completa (filtrándose por viewTitle).
 *
 *   <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.css" rel="stylesheet" />
 *   <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.js"></script>
 */

SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
  // Definimos el override context
  var overrideCtx = {};
  overrideCtx.Templates = {};

  // Solo aplicamos el override si la vista es "Reuniones Global"
  overrideCtx.OnPreRender = function(ctx) {
    if (ctx.viewTitle !== "Reuniones Global") {
      // Desregistramos cualquier override existente para no afectar otras vistas
      SPClientTemplates.TemplateManager.RegisterTemplateOverrides({});
    }
  };

  // Header: contenedor para el calendario
  overrideCtx.Templates.Header = "<div id='fc-container'></div>";
  // Footer: nada
  overrideCtx.Templates.Footer = "";

  // Body: construimos el div donde FullCalendar montará el calendario y almacenamos datos
  overrideCtx.Templates.Body = function (ctx) {
    if (ctx.viewTitle !== "Reuniones Global") {
      // Renderizado por defecto (puedes dejar vacío o devolver ctx.RenderBody(ctx))
      return ctx.RenderBody ? ctx.RenderBody(ctx) : "";
    }

    var items = ctx.ListData.Row || [];
    var fcEvents = items.map(function (item) {
      return {
        id: item.ID,
        title: item.Title,
        start: item.EventDate || item.StartDate,
        end:   item.EndDate,
        color: item.Color || '#3788d8'
      };
    });

    // Guardamos los eventos para el posterior render de FullCalendar
    window._fcEvents = fcEvents;

    // Devolvemos solo el contenedor donde se renderizará FullCalendar
    return "<div id='calendar'></div>";
  };

  // Registramos las plantillas CSR
  SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

  // Esperamos a que el DOM y FullCalendar estén listos
  var tryInit = setInterval(function () {
    var container = document.getElementById('calendar');
    if (container && window.FullCalendar && Array.isArray(window._fcEvents)) {
      clearInterval(tryInit);

      // Montamos el calendario
      var calendar = new FullCalendar.Calendar(container, {
        initialView: 'dayGridMonth',
        locale: 'es',
        events: window._fcEvents,
        height: 'auto',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }
      });
      calendar.render();
    }
  }, 100);
});
