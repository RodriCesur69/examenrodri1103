document.addEventListener('DOMContentLoaded', async function() {
    const mapa = L.map('mapa').setView([36.72, -4.42], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(mapa);

    setTimeout(() => {
        mapa.invalidateSize();
    }, 200);

    const contenedorLista = document.getElementById('listaLateral');
    
    let favoritos = localStorage.getItem('mis_favoritos');
    let listaFavoritos = favoritos ? JSON.parse(favoritos) : [];

    const respuesta = await fetch('/api/monumentos');
    const datos = await respuesta.json();

    datos.features.forEach(function(monumento) {
        const prop = monumento.properties;
        const latitud = monumento.geometry.coordinates[1];
        const longitud = monumento.geometry.coordinates[0];

        const marcador = L.marker([latitud, longitud]).addTo(mapa);

        const caja = document.createElement('div');
        caja.className = 'p-3 border-bottom';
        caja.style.cursor = 'pointer';
        
        let htmlContenido = '<div class="fw-bold">' + prop.NOMBRE + '</div>';
        htmlContenido += '<div class="small text-muted">' + prop.DIRECCION + '</div>';
        
        if (usuarioLogueado) {
            let colorCorazon = listaFavoritos.includes(prop.ID) ? 'text-danger' : 'text-secondary';
            htmlContenido += '<div class="mt-2 text-end"><i class="bi bi-heart-fill icono-favorito ' + colorCorazon + '" style="font-size: 1.2rem;"></i></div>';
        }
        
        caja.innerHTML = htmlContenido;

        function refrescarIcono() {
            if (usuarioLogueado) {
                const icono = caja.querySelector('.icono-favorito');
                if (listaFavoritos.includes(prop.ID)) {
                    icono.classList.replace('text-secondary', 'text-danger');
                } else {
                    icono.classList.replace('text-danger', 'text-secondary');
                }
            }
        }

        function gestionarFavorito() {
            if (listaFavoritos.includes(prop.ID)) {
                listaFavoritos = listaFavoritos.filter(f => f !== prop.ID);
            } else {
                listaFavoritos.push(prop.ID);
            }
            localStorage.setItem('mis_favoritos', JSON.stringify(listaFavoritos));
            refrescarIcono();
        }

        function abrirInfo() {
            mapa.panTo([latitud, longitud]);
            
            Swal.fire({
                title: prop.NOMBRE,
                html: '<div class="text-start small"><b>Dirección:</b> ' + prop.DIRECCION + '<br><br>' + prop.DESCRIPCION + '</div>',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#0d6efd'
            });
        }

        caja.addEventListener('click', abrirInfo);
        marcador.addEventListener('click', abrirInfo);
        
        if (usuarioLogueado) {
            caja.querySelector('.icono-favorito').addEventListener('click', function(e) {
                e.stopPropagation();
                gestionarFavorito();
            });
        }

        contenedorLista.appendChild(caja);
    });
});