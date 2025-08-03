/// <reference types="sharepoint" />
/// <reference types="fullcalendar" />

interface FCEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
}

// Extendemos el objeto global para almacenar eventos
declare global {
  interface Window {
    _fcEvents?: FCEvent[];
    FullCalendar?: typeof FullCalendar;
    fullCalendarInstance?: FullCalendar.Calendar;
  }
}

(function () {
  SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", () => {
    const overrideCtx: SPClientTemplates.TemplateOverridesOptions = {
      OnPreRender: (ctx) => {
        if (ctx.viewTitle !== "Reuniones Global") {
          // Limpiar override si no es la vista específica
          SPClientTemplates.TemplateManager.RegisterTemplateOverrides({});
        }
      },
      Templates: {
        Header: `
          <div id="fc-tabs" style="margin-bottom:10px;">
            <button class="fc-tab" data-view="dayGridMonth">Vista mensual</button>
            <button class="fc-tab" data-view="timeGridWeek">Vista semanal</button>
            <button class="fc-tab" data-view="timeGridDay">Vista diaria</button>
          </div>
          <div id="calendar"></div>
        `,
        Footer: "",
        Body: (ctx) => {
          if (ctx.viewTitle !== "Reuniones Global") {
            return ctx.RenderBody ? ctx.RenderBody(ctx) : "";
          }

          const items = (ctx.ListData.Row || []) as any[];
          const fcEvents: FCEvent[] = items.map((item) => ({
            id: item.ID,
            title: item.Title,
            start: item.EventDate || item.StartDate,
            end: item.EndDate,
            color: item.Color || "#3788d8"
          }));

          window._fcEvents = fcEvents;

          // El div ya está en el Header
          return "";
        }
      }
    };

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

    const tryInit = setInterval(() => {
      const container = document.getElementById("calendar");
      if (!container || !window.FullCalendar || !window._fcEvents || window.fullCalendarInstance) return;

      clearInterval(tryInit);

      const calendar = new FullCalendar.Calendar(container, {
        initialView: "dayGridMonth",
        locale: "es",
        events: window._fcEvents,
        height: "auto",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: ""
        }
      });

      calendar.render();
      window.fullCalendarInstance = calendar;

      // Activar los tabs
      const tabButtons = document.querySelectorAll(".fc-tab");
      tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const view = (btn as HTMLElement).getAttribute("data-view")!;
          calendar.changeView(view);
        });
      });
    }, 100);
  });
})();
