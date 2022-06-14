const buttton = document.querySelector(".button");
const select = document.querySelector('#input_1');
const btn_buscar = document.querySelector('#btn-buscar');
const btn_crear = document.querySelector('#btn-crear');
const btn_eliminar = document.querySelector('#btn-eliminar');
const btn_actualizar = document.querySelector('#btn-actualizar');
const form_crear = document.querySelector("#form-crear");
const tabla = document.querySelector('#tabla');
let globalDatos = [];
const mensajesErroresInputs = {
    general: 'Todos los campos son obligatorios.',
    telefonoCelular: 'El campo teléfono Movil. Tiene que ser el que proporciono el cliente en twitter (10 dígitos sin espacios.)',
    numeroServicio: 'El campo Numero de servicio. Tiene que ser el numero de servicio (RPU) a 12 dígitos sin espacios.',
    alias: 'El campo Alias tiene que ser menor o igual a 10 caracteres.',
    alias_do2: 'El alias no puede contener estos caracteres: .!"#$%&/()=',
    seleccionar: 'Registro duplicado elige un valor de la tabla.',
    telefono: 'El campo Teléfono Celular no puede estar vació en la búsqueda'
}
let reg = /(\.|\!|\'|\"|\#|\$|\%|\&|\/|\=|\(|\))/g;
const URL = './crud.php';
eliminarLoading();
tabla.addEventListener('click', (e) => {
    const input_1 = document.querySelector('#input_1');
    const input_2 = document.querySelector('#input_2');
    const input_3 = document.querySelector('#input_3');
    const id_registro = document.querySelector('#id_registro');


    if (e.target.classList.contains('btn-select')) {
        const id = e.target.getAttribute('data-id-registro');
        const info = globalDatos.filter(e => e.ID === id)
        input_1.value = info[0]?.telCelular
        input_2.value = info[0]?.numServicio
        input_3.value = info[0]?.Alias
        id_registro.value = info[0]?.ID
    }
});

btn_buscar.addEventListener('click', async e => {
    e.preventDefault();
    deleteTable();
    const input_1 = document.querySelector('#input_1');
    const input_2 = document.querySelector('#input_2');
    const input_3 = document.querySelector('#input_3');
    const id_registro = document.querySelector('#id_registro');


    const formData = {};
    formData.action = '1';
    formData.termino = input_1.value;
    if (!formData.termino) {
        id_registro.value = '';
        mostarAlerta(mensajesErroresInputs.telefono, "info");
    } else {
        try {
            const request = await fetch(URL, { method: 'POST', body: JSON.stringify(formData) });
            const data = await request.json();
            if (data.msg === "1") {
                if (data?.ok) {
                    input_1.value = data.data?.telCelular
                    input_2.value = data.data?.numServicio
                    input_3.value = data.data?.Alias
                    id_registro.value = data.data?.ID

                } else if (data?.ok === false) {
                    id_registro.value = '';
                    mostarAlerta(data.msg, 'info');
                }
            } else if (data.msg === "1+") {
                if (data?.ok) {
                    input_1.value = "";
                    input_2.value = "";
                    input_3.value = "";
                    id_registro.value = "";
                    mostarAlerta(mensajesErroresInputs.seleccionar, "info");
                    mostrarTabla(data);
                } else if (data?.ok === false) {

                    id_registro.value = '';
                    mostarAlerta(data.msg, 'info');
                }
            }



        } catch (error) {
            id_registro.value = '';
            mostarAlerta('Algo salio mal al momento de buscar un registro', 'error');
        }

    }
});


btn_crear.addEventListener("click", async (e) => {
    deleteTable();
    const data = Object.fromEntries(new FormData(form_crear));
    const id_registro = document.querySelector('#id_registro');
    data.action = '2';
    if (data.input_1 === '' || data.input_2 === '' || data.input_3 === '') {
        mostarAlerta(mensajesErroresInputs.general);
        return;
    }

    if (!isNumber(data?.input_1)) {
        mostarAlerta(mensajesErroresInputs.telefonoCelular);
        return;
    }

    if (!validateLength(data.input_2, 12)) {
        mostarAlerta(mensajesErroresInputs.numeroServicio);
        return;
    }

    if (data.input_3.length > 10) {
        mostarAlerta(mensajesErroresInputs.alias);
        return;
    }


    if (reg.test(data.input_3)) {
        mostarAlerta(mensajesErroresInputs.alias_do2);
        return;
    }


    eliminarAlerta();
    loading();
    try {

        const request = await fetch(URL, { method: 'POST', body: JSON.stringify(data) });
        const info = await request.json();

        if (info.ok) {

            form_crear.reset();
            id_registro.value = '';
            eliminarLoading();
            mostarAlerta('Se creo el registró correctamente', 'success');

        } else {
            eliminarLoading();
            id_registro.value = '';
            mostarAlerta('No se pudo crear el registro', 'error');
        }


    } catch (error) {
        id_registro.value = '';
        eliminarLoading();
        mostarAlerta('Error! no se logro crear el registro.');
    }



});


btn_actualizar.addEventListener('click', async (e) => {


    deleteTable();
    const _id_registro = document.querySelector('#id_registro');
    const data = Object.fromEntries(new FormData(form_crear));


    data.action = '3';

    if (!data?.id_registro) {
        mostarAlerta('No puedes editar un registro si no has buscado uno.');
        return;
    }

    if (Object.values(data).includes('')) {
        mostarAlerta(mensajesErroresInputs.general);
        return;
    }

    if (!isNumber(data?.input_1)) {
        mostarAlerta(mensajesErroresInputs.telefonoCelular);
        return;
    }

    if (!validateLength(data.input_2, 12)) {
        mostarAlerta(mensajesErroresInputs.numeroServicio);
        return;
    }

    if (data.input_3.length > 10) {
        mostarAlerta(mensajesErroresInputs.alias);
        return;
    }

    if (reg.test(data.input_3)) {
        mostarAlerta(mensajesErroresInputs.alias_do2);
        return;
    }

    eliminarAlerta()
    loading();
    try {

        const request = await fetch(URL, { method: 'POST', body: JSON.stringify(data) });
        const info = await request.json();

        if (info.ok) {
            eliminarLoading();
            form_crear.reset();
            _id_registro.value = '';
            mostarAlerta('Se actualizo el resgitro correctamente', 'success');

        } else {
            eliminarLoading();
            form_crear.reset();
            _id_registro.value = '';
            mostarAlerta('No se logro actualizar el registro', 'error');
        }

    } catch (error) {
        eliminarLoading();
        form_crear.reset();
        _id_registro.value = '';
        mostarAlerta('Error! no se logro actualizar el registro.');
    }

});


btn_eliminar.addEventListener('click', async e => {

    deleteTable();

    const _id_registro = document.querySelector('#id_registro');
    const data = Object.fromEntries(new FormData(form_crear));

    data.action = '4';

    if (data.id_registro !== '') {

        loading();

        const _confirm = confirm('¿Seguro que deseas eliminar este registro?');

        if (_confirm) {

            eliminarAlerta();

            try {

                const request = await fetch(URL, { method: 'POST', body: JSON.stringify(data) });
                const info = await request.json();

                if (info.ok) {
                    eliminarLoading();
                    form_crear.reset();
                    _id_registro.value = '';
                    mostarAlerta('Se elimino el registro correctamente', 'success');

                } else {
                    eliminarLoading();
                    form_crear.reset();
                    _id_registro.value = '';
                    mostarAlerta('No se logro eliminar el registro.', 'error');
                }

            } catch (error) {
                eliminarLoading();
                form_crear.reset();
                _id_registro.value = '';
                mostarAlerta('Error! no se logro eliminar el registro.');
            }


        }

    } else {
        eliminarLoading();
        form_crear.reset();
        _id_registro.value = '';
        mostarAlerta('No puedes eliminar un registro si no has buscado uno.');
        return;
    }

})

function loading() {    
    const div = document.querySelector('#loading');
    console.log("Entro a la funcion",div);
    if (div) {
        let loader = document.createElement("div");
        loader.classList.add("lds-ring","loader");
        loader.id = "loader";
        for (let i = 0; i <= 3; i++) {
            let contenido = document.createElement("div");
            loader.appendChild(contenido);
            console.log("div",i);
        }
        div.appendChild(loader);
    }

}
function eliminarLoading() {
        const loaderAnterior = document.querySelector('#loader');
        if (loaderAnterior) { loaderAnterior.remove(); } 
}
function eliminarAlerta() {
    const alertaAnterior = document.querySelector('#msg_alert');
    if (alertaAnterior) { alertaAnterior.remove(); }
}

function mostarAlerta(contenido, clase = 'error') {

    const div = document.querySelector('#alerta');


    if (div) {

        const alertaAnterior = document.querySelector('#msg_alert');
        if (alertaAnterior) { alertaAnterior.remove(); }


        const parrafo = document.createElement('p');
        parrafo.id = 'msg_alert';
        parrafo.classList.add(clase);
        parrafo.textContent = contenido;

        div.appendChild(parrafo);


        setTimeout(() => {
            parrafo.remove();
        }, 10000);
    }

}

function isNumber(value) {
    let exr = /^[0-9]{10}$/;
    return exr.test(value);
}

function validateLength(value, limit) {

    if (/\s/.test(value)) {
        return false;
    }

    if (value.length !== limit) {
        return false;
    }

    return true;
}


function mostrarTabla(data) {
    const contenido = document.getElementById('contenido');
    const datos = data.data;
    globalDatos = [...datos];
    let myTableDiv = document.getElementById("tabla");
    let table = document.createElement('TABLE');
    let tablehead = document.createElement('THEAD');
    table.appendChild(tablehead);
    let tableBody = document.createElement('TBODY');
    table.appendChild(tableBody);
    const cabezales = ["ID", "Numero de Telefono", "Numero de Servicio", "Alias", "Seleccionar"]
    for (let i = 0; i < 1; i++) {
        let tr = document.createElement('TR');
        tablehead.appendChild(tr);
        for (let j = 0; j < (Object.keys(cabezales).length); j++) {
            let td = document.createElement('TD');
            td.width = '200';
            td.appendChild(document.createTextNode(cabezales[j]));
            tr.appendChild(td);
        }
    }
    for (let i = 0; i < (Object.keys(datos).length); i++) {
        const objeto = datos[i];
        let tr = document.createElement('TR');
        tableBody.appendChild(tr);
        let referencias = document.createElement('buttom');
        referencias.innerText = 'Seleccionar';
        const acciones = [document.createTextNode(id = objeto.ID), document.createTextNode(tel = objeto.telCelular), document.createTextNode(service = objeto.numServicio), document.createTextNode(alias = objeto.Alias), referencias];
        referencias.classList.add("btn-select", "btn", "pointer");
        for (let j = 0; j < (Object.keys(cabezales).length); j++) {
            referencias.dataset.idRegistro = id;
            let td = document.createElement('TD');
            td.width = '200';
            td.appendChild(acciones[j]);
            tr.appendChild(td);
        }
    }
    myTableDiv.appendChild(table);
}

function deleteTable() {
    const tabla = document.querySelector('#tabla table');
    if (tabla) {
        tabla.remove();
    }
}

