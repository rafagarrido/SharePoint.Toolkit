SP.SOD.executeFunc('clienttemplates.js', 'SPClientTemplates', function () {
    var overrideCtx = {};
    overrideCtx.Templates = {};
    
    overrideCtx.OnPreRender = function (ctx) {
        if (ctx.viewTitle !== "Reuniones Global") {
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({});
        }
    };
    overrideCtx.OnPostRender = function (ctx) {
        if (!ctx || !ctx.ListData || !ctx.ListData.Row) return;

        // Usar una propiedad personalizada en el contexto para guardar el flag
        if (ctx.hasRenderedMyControl) return;

        ctx.hasRenderedMyControl = true;
       

    }
    overrideCtx.Templates.Header = "<div id='fc-container'></div>";
    overrideCtx.Templates.Footer = "";

    overrideCtx.Templates.Body = function (ctx) {
        if (ctx.viewTitle !== "Reuniones Global") {
            return ctx.RenderBody ? ctx.RenderBody(ctx) : "";
        }

        var items = ctx.ListData.Row || [];
        var fcEvents = items.map(function (item) {
            return {
                id: item.ID,
                title: item.Title,
                start: convertirFecha(item.EventDate) || convertirFecha(item.StartDate),
                end: convertirFecha(item.EndDate),
                backgroundColor: item.Color,
                color: item.Color || '#3788d8',
                location: item.Location || 'Sin reuniones',
                extendedProps: {
                    Ubicacion: item.Location
                }
            };
        });

        window._fcEvents = fcEvents;

      

        var legendHtml = buildLegend(fcEvents);

        var layoutHtml = `
      <div style="display: flex;">
        ${legendHtml}
        <div id="calendar" style="flex-grow: 1;"></div>
      </div>
    `;

        return layoutHtml;
    };

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

    var tryInit = setInterval(function () {
        const { listaGrupos } = window._fcEvents;
        var container = document.getElementById('calendar');
        var events = window._fcEvents;
        if (container && window.FullCalendar && Array.isArray(events)) {
            clearInterval(tryInit);

            const currentYear = new Date().getFullYear();
            const initialDateValue = `${currentYear}-01-01`;
            var calendar = new window.FullCalendar.Calendar(container, {
                initialDate: initialDateValue,
                initialView: 'multiMonthYear',
                contentHeight: 600,
                aspectRatio: 2,
                firstDay: 1,
                events: events,
                height: 'auto',
                locale: 'es',
                views: {
                    multiMonth: {
                        type: 'multiMonthYear',
                        duration: { months: 12 },
                        multiMonthMaxColumns: 3,
                        titleFormat: { year: 'numeric' }
                    }
                },
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'btnMes,btnSemana,btnDia,btnMultiCal'
                },
                customButtons: {
                    btnMes: {
                        text: '',
                        click: function () {
                            calendar.changeView('dayGridMonth');
                        }
                    },
                    btnSemana: {
                        text: '',
                        click: function () {
                            calendar.changeView('timeGridWeek');
                        }
                    },
                    btnDia: {
                        text: '',
                        click: function () {
                            calendar.changeView('timeGridDay');
                        }
                    },
                    btnMultiCal: {
                        text: '',
                        click: () => calendar.changeView('multiMonth')
                    }
                },
                dateClick: function (info) {
                    if (calendar.view.type === 'multiMonth' || calendar.view.type === 'multiMonthYear') {
                        if (info.date) {
                            calendar.changeView('dayGridMonth', info.date);
                        } else {
                            console.warn('No se recibió fecha válida en dateClick en vista multiMonth');
                        }
                    }
                },
                eventDidMount: function (info) {
                    const start = info.event.start;
                    const end = info.event.end;
                    // Formatear horas en formato HH:MM (puedes ajustar a tu gusto)
                    const formatHora = (fecha) => {
                        if (!fecha) return '';
                        return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    };

                    const tooltip = document.createElement('div');
                    tooltip.className = 'fc-tooltip';
                    tooltip.innerHTML = `
    <strong>${info.event.title}</strong><br>
     ${info.event.extendedProps.location || ''}<br>
    ${start.toLocaleDateString('es-ES')}<br>
    ${formatHora(start)} - ${formatHora(end)}
   
  `;

                    tooltip.style.backgroundColor = info.event.backgroundColor || info.event.extendedProps.color || '#3788d8';

                    document.body.appendChild(tooltip);

                    info.el.addEventListener('mouseenter', function (e) {
                        tooltip.style.display = 'block';
                        tooltip.style.left = e.pageX + 10 + 'px';
                        tooltip.style.top = e.pageY + 10 + 'px';
                    });

                    info.el.addEventListener('mousemove', function (e) {
                        tooltip.style.left = e.pageX + 10 + 'px';
                        tooltip.style.top = e.pageY + 10 + 'px';
                    });

                    info.el.addEventListener('mouseleave', function () {
                        tooltip.style.display = 'none';
                    });
                }

            });

            calendar.render();
            personalizarBotonesCalendario(); // 
            generarLeyendaGrupos(eventos);
            const mesBtn = document.querySelector('.fc-dayGridMonth-button');
            if (mesBtn) {
                mesBtn.innerHTML = '<span unselectable="on" class="ms-cui-ctl-largeIconContainer"><span unselectable="on" class=" ms-cui-img-32by32 ms-cui-img-cont-float"><img unselectable="on" alt="" src="/_layouts/15/3082/images/formatmap32x32.png?rev=43" style="top: -1px; left: -273px;"></span></span>';
            }
            const semanaBtn = document.querySelector('.fc-timeGridWeek-button');
            if (semanaBtn) {
                semanaBtn.innerHTML = '<span unselectable="on" class="ms-cui-ctl-largeIconContainer"><span unselectable="on" class=" ms-cui-img-32by32 ms-cui-img-cont-float"><img unselectable="on" alt="" src="/_layouts/15/3082/images/formatmap32x32.png?rev=43" style="top: -35px; left: -477px;"></span></span>';
            }
            const diarioBtn = document.querySelector('.fc-timeGridDay-button');
            if (diarioBtn) {
                diarioBtn.innerHTML = '<span unselectable="on" class="ms-cui-ctl-largeIconContainer"><span unselectable="on" class=" ms-cui-img-32by32 ms-cui-img-cont-float"><img unselectable="on" alt="" src="/_layouts/15/3082/images/formatmap32x32.png?rev=43" style="top: -239px; left: -239px;"></span></span>';
            }
        }
    }, 100);
    function personalizarBotonesCalendario() {
        const botones = [
            {
                selector: '.fc-btnMes-button',
                texto: 'Mes',
                icono: '/_layouts/15/3082/images/formatmap32x32.png?rev=43'
            },
            {
                selector: '.fc-btnSemana-button',
                texto: 'Semana',
                icono: ''
            },
            {
                selector: '.fc-btnDia-button',
                texto: 'Día',
                icono: ''
            },
            {
                selector: '.fc-prev-button',
                texto: 'Anterior',
                icono: ''
            },
            {
                selector: '.fc-next-button',
                texto: 'Siguiente',
                icono: ''
            },
            {
                selector: '.fc-today-button',
                texto: 'Hoy',
                icono: ''
            },
            {
                selector: '.fc-btnMultiCal-button',
                texto: 'Anual',
                icono: ''
            }
        ];

        botones.forEach(({ selector, texto, icono }) => {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.innerHTML = '';
                btn.classList.remove('fc-icon', 'fc-icon-chevron-left', 'fc-icon-chevron-right');
                btn.innerHTML = `<img src="${icono}" alt="${texto}" style="width: 16px; height: 16px; vertical-align: middle;"> <span>${texto}</span>`;

            }
        });
    }
    function convertirFecha(fechaStr) {
        var partesFechaHora = fechaStr.split(' ');
        if (partesFechaHora.length != 2) return null;
        var fecha = partesFechaHora[0];
        var hora = partesFechaHora[1] || '';

        var [dia, mes, anio] = fecha.split('/');
        if (!dia || !mes || !anio) return null;

        var fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        return hora ? `${fechaISO}T${hora}` : fechaISO;
    }
    function buildLegend(events) {
        var unique = new Map();

        events.forEach(function (evt) {
            if (evt.location && evt.color && !unique.has(evt.location)) {
                unique.set(evt.location, evt.color);
            }
        });

        var html = `<div id="fc-legend" style="min-width: 100px; margin-right: 20px;">`;
        html += `<h4 style="margin-bottom: 10px;">Calendarios</h4>`;

        unique.forEach(function (color, location) {
            html += `
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <span style="display: inline-block; width: 16px; height: 16px; background-color: ${color}; margin-right: 8px; border: 1px solid #ccc;"></span>
          <span>${location}</span>
        </div>`;
        });

        html += `</div>`;
        return html;
    }
    function crearContenedorLeyendaCalendario(idCalendario) {
        // Obtener el calendario original
        var calendarioDiv = document.getElementById(idCalendario);
        if (!calendarioDiv) {
            console.error('No se encontró el calendario con id:', idCalendario);
            return null;
        }

        var parentOriginal = calendarioDiv.parentNode;

        // Crear contenedor padre
        var contenedorPadre = document.createElement('div');
        contenedorPadre.style.display = 'flex';
        contenedorPadre.style.gap = '1.5rem';
        contenedorPadre.style.alignItems = 'flex-start';
        contenedorPadre.style.width = '100%';
        contenedorPadre.style.boxSizing = 'border-box';

        // Crear contenedor leyenda
        var contenedorLeyenda = document.createElement('div');
        contenedorLeyenda.id = 'leyenda-grupos';
        contenedorLeyenda.style.minWidth = '180px';
        contenedorLeyenda.style.borderRight = '2px solid #ccc';
        contenedorLeyenda.style.paddingRight = '1rem';
        contenedorLeyenda.style.boxSizing = 'border-box';

        // Título leyenda
        var tituloLeyenda = document.createElement('h3');
        tituloLeyenda.textContent = '👥 Grupos de trabajo';
        tituloLeyenda.style.marginBottom = '1rem';
        contenedorLeyenda.appendChild(tituloLeyenda);

        // Lista leyenda
        var listaGrupos = document.createElement('ul');
        listaGrupos.id = 'lista-grupos';
        listaGrupos.style.listStyle = 'none';
        listaGrupos.style.padding = '0';
        listaGrupos.style.margin = '0';
        contenedorLeyenda.appendChild(listaGrupos);

        // Insertar contenedor padre antes del calendario
        parentOriginal.insertBefore(contenedorPadre, calendarioDiv);

        // Añadir leyenda y calendario al contenedor padre
        contenedorPadre.appendChild(contenedorLeyenda);
        contenedorPadre.appendChild(calendarioDiv);

        // Estilos para el calendario
        calendarioDiv.style.flex = '1 1 auto';
        calendarioDiv.style.minWidth = '600px';
        calendarioDiv.style.boxSizing = 'border-box';
        calendarioDiv.style.overflow = 'hidden';

        return { contenedorPadre, contenedorLeyenda, calendarioDiv, listaGrupos };
    }
    

});
