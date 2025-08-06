// OPTIMIZACIÓN FULLCALENDAR EN SHAREPOINT 2019
(function () {
    var overrideCtx = {};
    overrideCtx.Templates = {};

    overrideCtx.OnPreRender = function (ctx) {
        if (ctx.viewTitle !== "Reuniones Global") return;
    };

    overrideCtx.OnPostRender = function (ctx) {
        if (!ctx || !ctx.ListData || !ctx.ListData.Row || ctx._calendarInitialized) return;
        ctx._calendarInitialized = true;
    };

    overrideCtx.Templates.Header = "<div id='fc-container'></div>";
    overrideCtx.Templates.Footer = "";

    overrideCtx.Templates.Body = function (ctx) {
        if (ctx.viewTitle !== "Reuniones Global") return ctx.RenderBody(ctx);

        var events = (ctx.ListData.Row || []).map(function (item) {
            return {
                id: item.ID,
                title: item.Title,
                start: convertirFecha(item.EventDate || item.StartDate),
                end: convertirFecha(item.EndDate),
                backgroundColor: item.Color,
                color: item.Color || '#3788d8',
                location: item.Location || 'Sin reuniones',
                extendedProps: {
                    location: item.Location
                }
            };
        });

        window._fcEvents = events;
        return `<div id="calendar" style="width:100%"></div>`;
    };

    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);

    if (!window._fcInitialized) {
        window._fcInitialized = true;
        var initCalendar = setInterval(function () {
            var container = document.getElementById('calendar');
            if (container && window.FullCalendar && Array.isArray(window._fcEvents)) {
                clearInterval(initCalendar);

                const { contenedorLeyenda, listaGrupos } = crearContenedorLeyendaCalendario('calendar');
                generarLeyendaGrupos(window._fcEvents, listaGrupos);

                var calendar = new window.FullCalendar.Calendar(container, {
                    initialDate: new Date().getFullYear() + '-01-01',
                    initialView: 'multiMonthYear',
                    contentHeight: 600,
                    aspectRatio: 2,
                    firstDay: 1,
                    events: window._fcEvents,
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
                        btnMes: { text: '', click: () => calendar.changeView('dayGridMonth') },
                        btnSemana: { text: '', click: () => calendar.changeView('timeGridWeek') },
                        btnDia: { text: '', click: () => calendar.changeView('timeGridDay') },
                        btnMultiCal: { text: '', click: () => calendar.changeView('multiMonth') }
                    },
                    dateClick: function (info) {
                        if (['multiMonth', 'multiMonthYear'].includes(calendar.view.type)) {
                            calendar.changeView('dayGridMonth', info.date);
                        }
                    },
                    eventDidMount: function (info) {
                        var tooltip = document.createElement('div');
                        tooltip.className = 'fc-tooltip';
                        tooltip.innerHTML = `
                            <strong>${info.event.title}</strong><br>
                            ${info.event.extendedProps.location || ''}<br>
                            ${info.event.start.toLocaleDateString('es-ES')}<br>
                            ${formatHora(info.event.start)} - ${formatHora(info.event.end)}
                        `;
                        tooltip.style.position = 'absolute';
                        tooltip.style.padding = '5px 10px';
                        tooltip.style.borderRadius = '4px';
                        tooltip.style.color = '#fff';
                        tooltip.style.backgroundColor = info.event.backgroundColor || '#3788d8';
                        tooltip.style.display = 'none';
                        tooltip.style.zIndex = 1000;
                        document.body.appendChild(tooltip);

                        info.el.addEventListener('mouseenter', e => {
                            tooltip.style.display = 'block';
                            tooltip.style.left = e.pageX + 10 + 'px';
                            tooltip.style.top = e.pageY + 10 + 'px';
                        });
                        info.el.addEventListener('mousemove', e => {
                            tooltip.style.left = e.pageX + 10 + 'px';
                            tooltip.style.top = e.pageY + 10 + 'px';
                        });
                        info.el.addEventListener('mouseleave', () => {
                            tooltip.style.display = 'none';
                        });
                    }
                });

                calendar.render();

                // Guardar instancia para personalizar botones
                window.miCalendario = calendar;

                personalizarBotonesCalendario();
            }
        }, 150);
    }

    function convertirFecha(fechaStr) {
        if (!fechaStr) return null;
        var partes = fechaStr.split(' ');
        var fecha = partes[0], hora = partes[1] || '';
        var [d, m, y] = fecha.split('/');
        if (!d || !m || !y) return null;
        return hora ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T${hora}` : `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    function formatHora(fecha) {
        return fecha ? fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';
    }

    function personalizarBotonesCalendario() {
        const calendar = window.miCalendario;
        const calendarWrapper = document.getElementById('calendar');

        if (!calendarWrapper) {
            console.warn('No se encontró el contenedor del calendario para personalizar botones.');
            return;
        }

        const customControls = document.createElement('div');
        customControls.className = 'custom-controls';
        customControls.style.display = 'flex';
        customControls.style.justifyContent = 'space-between';
        customControls.style.alignItems = 'center';
        customControls.style.marginBottom = '1rem';
        customControls.style.gap = '0.5rem';

        // Botón Mes Anterior
        const btnPrev = document.createElement('button');
        btnPrev.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:4px;" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Anterior
        `;
        btnPrev.onclick = () => calendar.prev();
        customControls.appendChild(btnPrev);

        // Botón Hoy
        const btnToday = document.createElement('button');
        btnToday.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:4px;" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V3M16 7V3M4 11h16M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Hoy
        `;
        btnToday.onclick = () => calendar.today();
        customControls.appendChild(btnToday);

        // Botón Mes Siguiente
        const btnNext = document.createElement('button');
        btnNext.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:4px;" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6l6 6-6 6" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Siguiente
        `;
        btnNext.onclick = () => calendar.next();
        customControls.appendChild(btnNext);

        // Botón Vista Mensual
        const btnMonth = document.createElement('button');
        btnMonth.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:4px;" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="black" stroke-width="2" fill="none"/>
                <path d="M3 10h18" stroke="black" stroke-width="2" fill="none"/>
            </svg>
            Vista mensual
        `;
        btnMonth.onclick = () => calendar.changeView('dayGridMonth');
        customControls.appendChild(btnMonth);

        // Botón Multimes
        const btnMultiMonth = document.createElement('button');
        btnMultiMonth.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:4px;" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="black" stroke-width="2" fill="none"/>
                <path d="M7 10h3M14 10h3M7 17h3M14 17h3" stroke="black" stroke-width="2" fill="none"/>
            </svg>
            Multimes
        `;
        btnMultiMonth.onclick = () => calendar.changeView('multiMonth');
        customControls.appendChild(btnMultiMonth);

        // Insertar controles personalizados antes del calendario
        calendarWrapper.parentNode.insertBefore(customControls, calendarWrapper);
    }

    // Crear contenedor para la leyenda del calendario y lista de grupos
    function crearContenedorLeyendaCalendario(idCalendario) {
        let contenedor = document.createElement('div');
        contenedor.id = 'contenedor-leyenda-calendario';
        contenedor.style.marginTop = '10px';
        contenedor.style.display = 'flex';
        contenedor.style.flexWrap = 'wrap';
        contenedor.style.gap = '10px';

        let listaGrupos = document.createElement('ul');
        listaGrupos.id = 'lista-grupos';
        listaGrupos.style.listStyle = 'none';
        listaGrupos.style.padding = '0';
        listaGrupos.style.display = 'flex';
        listaGrupos.style.flexWrap = 'wrap';
        listaGrupos.style.gap = '10px';

        contenedor.appendChild(listaGrupos);

        let calendarContainer = document.getElementById(idCalendario);
        if (calendarContainer && calendarContainer.parentNode) {
            calendarContainer.parentNode.appendChild(contenedor);
        }

        return { contenedorLeyenda: contenedor, listaGrupos: listaGrupos };
    }

    // Generar leyenda de colores para los grupos
    function generarLeyendaGrupos(eventos, listaGrupos) {
        const gruposUnicos = Array.from(new Set(eventos.map(e => e.color).filter(Boolean)));

        gruposUnicos.forEach(color => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '5px';

            const colorBox = document.createElement('span');
            colorBox.style.backgroundColor = color;
            colorBox.style.width = '15px';
            colorBox.style.height = '15px';
            colorBox.style.display = 'inline-block';
            colorBox.style.borderRadius = '3px';

            const texto = document.createElement('span');
            texto.textContent = color; // Puedes mapear a nombres si tienes

            li.appendChild(colorBox);
            li.appendChild(texto);
            listaGrupos.appendChild(li);
        });
    }
})();
