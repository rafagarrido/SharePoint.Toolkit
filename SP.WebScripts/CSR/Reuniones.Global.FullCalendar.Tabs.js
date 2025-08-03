(function () {
    // Registrar plantilla personalizada para la vista "Reuniones Global"
    SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {

        var overrideCtx = {};
        overrideCtx.Templates = {};

        overrideCtx.Templates.Header = "<div id='fc-tabs' style='margin-bottom:10px;'>" +
            "<button class='fc-tab' data-view='dayGridMonth'>Vista mensual</button>" +
            "<button class='fc-tab' data-view='timeGridWeek'>Vista semanal</button>" +
            "<button class='fc-tab' data-view='timeGridDay'>Vista diaria</button>" +
            "</div><div id='calendar'></div>";

        overrideCtx.Templates.Body = function (ctx) {
            if (ctx.viewTitle !== "Reuniones Global") return "";

            var items = ctx.ListData.Row;

            var events = items.map(function (item) {
                return {
                    title: item.Title,
                    start: item.EventDate,
                    end: item.EndDate,
                    color: item.Color || "#3788d8" // fallback
                };
            });

            setTimeout(function () {
                if (!window.fullCalendarInstance) {
                    var calendarEl = document.getElementById('calendar');
                    window.fullCalendarInstance = new FullCalendar.Calendar(calendarEl, {
                        initialView: 'dayGridMonth',
                        height: 'auto',
                        headerToolbar: false,
                        events: events
                    });
                    window.fullCalendarInstance.render();

                    document.querySelectorAll('.fc-tab').forEach(function (btn) {
                        btn.addEventListener('click', function () {
                            var view = btn.getAttribute('data-view');
                            window.fullCalendarInstance.changeView(view);
                        });
                    });
                }
            }, 100);

            return "";
        };

        overrideCtx.Templates.Footer = "";

        SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
    });
})();
