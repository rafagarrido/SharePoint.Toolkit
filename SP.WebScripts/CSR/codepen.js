document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  function convertirFecha(fechaStr) {
    var partes = fechaStr.split('T');
    var fecha = partes[0];
    var hora = partes[1] || '';

    var [dia, mes, anio] = fecha.split('/');
    if (!dia || !mes || !anio) return null;

    var fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    return hora ? `${fechaISO}T${hora}` : fechaISO;
  }

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    initialDate: '2025-06-07',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [
      {
        title: 'All Day Event',
        start: '2025-06-01'
      },
      {
        title: 'Evento en español',
        start: convertirFecha('03/08/2025T16:00:00'),
        end: convertirFecha('03/08/2025T18:00:00')
      },
      {
        title: 'Long Event',
        start: '2025-06-07',
        end: '2025-06-10'
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        start: '2025-06-09T16:00:00'
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        start: '2025-06-16T16:00:00'
      },
      {
        title: 'Conference',
        start: '2025-06-11',
        end: '2025-06-13'
      },
      {
        title: 'Meeting',
        start: '2025-06-12T10:30:00',
        end: '2025-06-12T12:30:00'
      },
      {
        title: 'Lunch',
        start: '2025-06-12T12:00:00'
      },
      {
        title: 'Meeting',
        start: '2025-06-12T14:30:00'
      },
      {
        title: 'Birthday Party',
        start: '2025-06-13T07:00:00'
      },
      {
        title: 'Click for Google',
        url: 'https://google.com/',
        start: '2025-06-28'
      }
    ],
    eventDidMount: function(info) {
      const evento = info.event;
      const tooltip = `
Título: ${evento.title}
Inicio: ${evento.start.toLocaleString()}
${evento.end ? 'Fin: ' + evento.end.toLocaleString() : ''}
`;
      info.el.setAttribute('title', tooltip);
    }
  });

  calendar.render();
});
