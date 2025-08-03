// Importante: Asegúrate de que estos scripts estén cargados desde tu página o masterpage
// <link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.css" rel="stylesheet" />
// <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/main.min.js"></script>

SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
  const overrideCtx: any = {};
  overrideCtx.Templates = {};

  overrideCtx.OnPreRender = function (ctx: any) {
    if (ctx.viewTitle !== "Reuniones Global") {
      SPClientTemplates.TemplateManager.RegisterTemplateOverrides({});
    }
  };

  overrideCtx.Templates.Header = "<div id='fc-container'></div>";
  overrideCtx.Templates.Footer = "";

  overrideCtx.Templates.Body = function (ctx: any): string {
    if (ctx.viewTitle !== "Reuniones Global") {
      return ctx.RenderBody ? ctx.RenderBody(ctx) : "";
    }

    const items = ctx.ListData.Row || [];
    const fcEvents = items.map((item: any) => ({
      id: item.ID,
      title: item.Title,
      start: item.EventDate || item.StartDate,
      end: item.EndDate,
      color: item.Color || '#3788d8',
      category: item.Categoria || 'Sin categoría'
    }));

    // Guardamos los eventos globalmente
    (window as any)._fcEvents = fcEvents;

    // HTML de las tabs y contenedor principal
    const tabsHtml = `
      <div id="fc-tabs" style="margin-bottom: 10px;">
        <button data-view="dayGridMonth" class="fc-tab-btn selected">Mensual</button>
        <button data-view="timeGridWeek" class="fc-tab-btn">Semanal</button>
        <button data-view="timeGridDay" class="fc-tab-btn">Diaria</button>
      </div>
    `;

    const legendHtml = buildLegend(fcEvents);

    const layoutHtml = `
      ${tabsHtml}
      <div style="display: flex;">
        ${legendHtml}
        <div id="calendar" style="flex-grow: 1;"></div>
      </div>
    `;

    return layoutHtml;
  };

  SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

  // Inicialización de FullCalendar + lógica de tabs
  const tryInit = setInterval(() => {
    const container = document.getElementById('calendar');
    const events = (window as any)._fcEvents;

    if (container && (window as any).FullCalendar && Array.isArray(events)) {
      clearInterval(tryInit);

      let calendar = new (window as any).FullCalendar.Calendar(container, {
        initialView: 'dayGridMonth',
        locale: 'es',
        events: events,
        height: 'auto',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }
      });

      calendar.render();

      // Lógica para tabs
      const tabs = document.querySelectorAll<HTMLButtonElement>('.fc-tab-btn');
      tabs.forEach(btn => {
        btn.addEventListener('click', () => {
          tabs.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          const view = btn.getAttribute('data-view');
          if (view) calendar.changeView(view);
        });
      });
    }
  }, 100);

  // Utilidad para crear la leyenda
  function buildLegend(events: { category: string, color: string }[]): string {
    const unique = new Map<string, string>();

    events.forEach(evt => {
      if (evt.category && evt.color && !unique.has(evt.category)) {
        unique.set(evt.category, evt.color);
      }
    });

    let html = `<div id="fc-legend" style="min-width: 200px; margin-right: 20px;">`;
    html += `<h4 style="margin-bottom: 10px;">Leyenda</h4>`;

    unique.forEach((color, category) => {
      html += `
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <span style="display: inline-block; width: 16px; height: 16px; background-color: ${color}; margin-right: 8px; border: 1px solid #ccc;"></span>
          <span>${category}</span>
        </div>`;
    });

    html += `</div>`;
    return html;
  }
});
