<html>
  <div id="calendar"></div>
  </html>
<style>
  .fc .fc-button img {
      height: 16px;
      width: 16px;
      margin-right: 4px;
      vertical-align: middle;
    }

    .fc .fc-button span {
      vertical-align: middle;
      font-size: 13px;
    }
/* 🎯 Estilo para ocultar y mostrar el multicalendario */
    #multiCalendario {
      display: none;
      margin-top: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
    }

    .mini-cal {
      border: 1px solid #ccc;
      padding: 10px;
    }
.fc-prev-button .fc-icon,
.fc-next-button .fc-icon {
  display: none;
}

  </style>
// 🔧 Función que personaliza los botones
    function personalizarBotonesCalendario() {
      const botones = [
        {
          selector: '.fc-btnMes-button',
          texto: 'Mes',
          icono: 'https://cdn-icons-png.flaticon.com/512/847/847969.png'
        },
        {
          selector: '.fc-btnSemana-button',
          texto: 'Semana',
          icono: 'https://cdn-icons-png.flaticon.com/512/2920/2920244.png'
        },
        {
          selector: '.fc-btnDia-button',
          texto: 'Día',
          icono: 'https://cdn-icons-png.flaticon.com/512/1828/1828911.png'
        },
        {
          selector: '.fc-prev-button',
          texto: 'Anterior',
          icono: 'https://static2.sharepointonline.com/files/fabric/assets/icons/svg/chevronLeft_16x1.svg'
        },
        {
          selector: '.fc-next-button',
          texto: 'Siguiente',
          icono: 'https://static2.sharepointonline.com/files/fabric/assets/icons/svg/chevronRight_16x1.svg'
        },
        {
          selector: '.fc-today-button',
          texto: 'Hoy',
          icono: 'https://cdn-icons-png.flaticon.com/512/1827/1827370.png'
        },
        {
          selector: '.fc-btnMultiCal-button',
          texto: 'Anualv',
          icono: 'https://cdn-icons-png.flaticon.com/512/755/755556.png'
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
function generarLeyendaGrupos(eventos, contenedorLista) {
  // Limpiar la lista por si acaso
  contenedorLista.innerHTML = '';

  // Obtener grupos únicos por color y location
  const grupos = {};

  eventos.forEach(evento => {
    const color = evento.color;
    const location = evento.location || 'Sin ubicación'; // En caso de que no tenga location

    // Usamos color como clave para que no haya duplicados, 
    // y almacenamos location como valor (se asume que mismo color = mismo location)
    if (!grupos[color]) {
      grupos[color] = location;
    }
  });

  // Crear elementos <li> para cada grupo
  Object.entries(grupos).forEach(([color, location]) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.marginBottom = '0.5rem';

    const colorBox = document.createElement('span');
    colorBox.style.backgroundColor = color;
    colorBox.style.width = '20px';
    colorBox.style.height = '20px';
    colorBox.style.borderRadius = '4px';
    colorBox.style.display = 'inline-block';
    colorBox.style.marginRight = '0.5rem';

    li.appendChild(colorBox);
    li.appendChild(document.createTextNode(location));
    contenedorLista.appendChild(li);
  });
}



    // 🗓️ Inicializar el calendario
    document.addEventListener('DOMContentLoaded', function () {
       const elementos = crearContenedorLeyendaCalendario('calendar');
  if (!elementos) return;

  const { listaGrupos } = elementos;
      const calendarEl = document.getElementById('calendar');
const eventos = [
  { title: 'Reunión equipo A3', start: '2025-08-08', location: 'Sala Norte', color: '#1e90ff' },
  { title: 'Revisión equipo B', start: '2025-08-10', location: 'Sala Este', color: '#e67e22' },
  { title: 'Brainstorming equipo A', start: '2025-08-15', location: 'Sala Norte', color: '#1e90ff' }
];
      generarLeyendaGrupos(eventos, listaGrupos);

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'multiMonthYear',
        locale:'es',
        views: {
    multiMonth: {
      type: 'multiMonthYear',
      duration: { months: 24 },
      multiMonthMaxColumns: 4,
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
dateClick: function(info) {
  if (calendar.view.type === 'multiMonth' || calendar.view.type === 'multiMonthYear') {
    if (info.date) {
      calendar.changeView('dayGridMonth', info.date);
    } else {
      console.warn('No se recibió fecha válida en dateClick en vista multiMonth');
    }
  }
},
        events: eventos
      });

      calendar.render();
      personalizarBotonesCalendario(); // ✅ Aplicar personalización visual
      generarLeyendaGrupos(eventos);

    });
