import { Button, DatePicker } from 'antd';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from "../../../config/axiosConfig";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
const ReporteIngresosEgresos = () => {
    const [fechaInicio, setFechaInicio] = useState(dayjs());
    const [fechaFin, setFechaFin] = useState(dayjs());
    const [reporteBase64, setReporteBase64] = useState(null); // Para almacenar el reporte en base64
    const { sesionEmpId} = useAuth();

    useEffect(() => {
        // Cargar la fecha actual al cargar el componente
        setFechaInicio(dayjs());
        setFechaFin(dayjs());
    }, []);

    const handleBuscar = async () => {
        try {
            // Hacer la petición al endpoint con la fecha como parámetro
            const response = await axios.get('http://localhost:8080/api/finanzas/reportes/ingresos-egresos-xfechas', {
                params: {
                    fechaInicio: fechaInicio.format('YYYY-MM-DD'),
                    fechaFin: fechaFin.format('YYYY-MM-DD'),
                    empresa: sesionEmpId,
                    formato: 'pdf'
                },
                responseType: 'text' // Ensures Base64 string is received as plain text
            });

            if (response.data) {
                // Guardar el reporte base64
                setReporteBase64(response.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se recibió reporte en la respuesta'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtener el reporte:' + error
            });
        }
    };

    return (
        <div className='rounded-lg flex flex-col dark:bg-transparent bg-transparent border shadow-md p-0 z-10 h-full relative'>
            {/* Encabezado con el DatePicker y botón Buscar */}
            <div className="mb-2 flex flex-row justify-between border rounded-lg dark:bg-gray-800 bg-white text-gray-500 dark:text-gray-300 p-2">
            <div className="mb-2 flex justify-between">
                    <h3 className="text-2xl font-bold">Reporte de Ingresos y Egresos</h3>
                </div>
                {/* Botones */}
                <div className="mb-2 flex flex-row justify-end items-center">
                    <div className="flex flex-row">
                        <h3>Fecha de inicio</h3>
                        <DatePicker
                            value={fechaInicio}
                            onChange={(value) => setFechaInicio(value)}
                            placeholder="Fecha de inicio"
                            format="YYYY-MM-DD"
                            className="mr-2"
                        />
                    </div>
                    <div className="flex flex-row">
                        <h3>Fecha de fin</h3>
                        <DatePicker
                            value={fechaFin}
                            onChange={(value) => setFechaFin(value)}
                            placeholder="Fecha de fin"
                            format="YYYY-MM-DD"
                            className="mr-2"
                        />
                    </div>
                    <Button type="primary" onClick={handleBuscar}>Buscar</Button>
                </div>
                
            </div>

            {/* Mostrar el iframe si hay reporte base64 */}
            {reporteBase64 && (
                <div className="mt-4 flex-grow border rounded-lg overflow-hidden min-h-0">
                    <iframe
                        src={`data:application/pdf;base64,${reporteBase64}`}
                        title="Reporte Kardex"
                        width="100%"
                        height="100%"
                        className="border-none"
                    ></iframe>
                </div>
            )}
        </div>
    );
};


export default ReporteIngresosEgresos;
