import { useEffect, useState, useCallback } from "react";
import { startOfMonth, endOfMonth,eachDayOfInterval, differenceInDays, parseISO } from "date-fns";
import CustomButton from "../../../components/inputs/CustomButton";
import Swal from "sweetalert2";
import axios from "../../../config/axiosConfig";
import { Table, message, Checkbox } from 'antd';
import { useAuth } from "../../../context/AuthContext";
import { es } from "date-fns/locale";
import { formatInTimeZone } from 'date-fns-tz'; // Cambiamos la importación


const NuevaAsistencia = () => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const timeZone = 'America/Lima'; // O tu zona horaria específica

  // Usar formatInTimeZone para las fechas iniciales
  const [startDate, setStartDate] = useState(() => {
    const firstDay = startOfMonth(new Date());
    return formatInTimeZone(firstDay, timeZone, 'yyyy-MM-dd');
  });

  const [endDate, setEndDate] = useState(() => {
    const lastDay = endOfMonth(new Date());
    return formatInTimeZone(lastDay, timeZone, 'yyyy-MM-dd');
  });
  const { sesionEmpId, userCode } = useAuth();

  const fetchData = useCallback(async (paginationParams = pagination, sorter = {}) => {
    const daysDiff = differenceInDays(parseISO(endDate), parseISO(startDate));
    
    if (daysDiff > 31) {
      Swal.fire({
        title: 'Rango inválido',
        text: 'El rango de fechas no puede exceder 30 días.',
        icon: 'error',
      });
      return;
    }

    if (daysDiff < 0) {
      Swal.fire({
        title: 'Rango inválido',
        text: 'La fecha de inicio debe ser anterior a la fecha final.',
        icon: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:8080/api/empresas/entidades/findAsistenciaAndTrabajadores/${sesionEmpId}`,
        {
          params: {
            page: paginationParams.current - 1,
            size: paginationParams.pageSize,
            startDate,
            endDate,
            sort: sorter.field ? `${sorter.field},${sorter.order === 'ascend' ? 'asc' : 'desc'}` : null,
          },
        }
      );

      const transformedData = transformData(data.content);
      setTrabajadores(transformedData);
      setPagination(prev => ({
        ...prev,
        total: data.totalElements,
      }));
    } catch (error) {
      message.error('Error al cargar los datos');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [sesionEmpId, startDate, endDate]);

  const transformData = useCallback((workers) => {
    const rangeDates = getAllDatesInRange(startDate, endDate);

    return workers.map(worker => {
      // Inicializar las fechas del rango con `null` para las fechas sin datos
      const asistenciaData = rangeDates.reduce((acc, date) => {
        acc[date] = null; // Por defecto, no asistió
        return acc;
      }, {});
  
      // Actualizar con los datos reales de asistencia
      worker.asistencias.forEach(asistencia => {
        asistenciaData[asistencia.fechaAsistencia] = asistencia.asistio;
      });
  
      return {
        key: worker.id,
        nombre: `${worker.nombre} ${worker.apellidoPaterno} ${worker.apellidoMaterno}`,
        ...asistenciaData,
      };
    });
  }, [startDate, endDate]);
  
  const getAllDatesInRange = useCallback((start, end) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);
    
    return eachDayOfInterval({ 
      start: startDate,
      end: endDate 
    }).map(date => formatInTimeZone(date, timeZone, 'yyyy-MM-dd'));
  }, [timeZone]);

  const generateColumns = useCallback(() => {
    const baseColumns = [
      {
        title: 'Nombres',
        dataIndex: 'nombre',
        key: 'nombre',
        fixed: 'left',
        width: 90,
      },
    ];
    const handleCheckboxChange = async (workerId, date, checked, name) => {
      const confirmation = await Swal.fire({
        title: checked ? 'Marcar asistencia' : 'Desmarcar asistencia',
        text: `¿Estás seguro de que quieres ${checked ? 'marcar' : 'desmarcar'} la asistencia para el trabajador  ${name} en la fecha ${date}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
      });
  
      if (confirmation.isConfirmed) {
        try {
          // Realizar la petición al servidor
          await axios.post('http://localhost:8080/api/empresas/entidades/trabajadores/marcarAsistencia', {
            idEntidad: workerId,
            fechaAsistencia: date,
            asistio: checked,
            usuarioCreacion: userCode,
          });
          Swal.fire({
            title: 'Éxito',
            text: 'La asistencia se actualizó correctamente.',
            icon: 'success',
          });
          // Actualiza los datos si es necesario
          fetchData();
        } catch (error) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la asistencia.',
            icon: 'error',
          });
        }
      }
    };
  
    // Generar todas las fechas del rango
    const rangeDates = getAllDatesInRange(startDate, endDate);
  
    const dateColumns = rangeDates.map(date => ({
      title: (
        <div>
          <div>{formatInTimeZone(parseISO(date), timeZone, 'dd/MM/yyyy')}</div>
          <div>{formatInTimeZone(parseISO(date), timeZone, 'EEEE', { locale: es })}</div>
        </div>
      ),
      dataIndex: date,
      key: date,
      width: 100,
      align: 'center',
      render: (value, record) => (
        <Checkbox
          checked={!!value}
          onChange={(e) =>
            handleCheckboxChange(record.key, date, e.target.checked, record.nombre)
          }
        />
      ),
      //render: value => (value ? '✔️' : '❌'), // Valor presente o no
    }));
  
    return [...baseColumns, ...dateColumns];
  }, [startDate, endDate]);
  

  // Carga inicial de datos
  useEffect(() => {
    fetchData(pagination);
  }, []); // Solo se ejecuta una vez al montar el componente

  return (
    <div className="rounded-lg dark:bg-transparent bg-transparent border shadow-md p-0 z-10 h-full relative">
      <div className="mb-2 flex justify-between border rounded-lg dark:bg-gray-800 bg-white text-gray-500 dark:text-gray-300 p-2">
        <h3 className="text-2xl font-bold">Asistencia</h3>

        <div className="flex items-center space-x-4 mb-4">
          <label>
            Fecha Inicio:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              className="ml-2 p-2 border rounded"
            />
          </label>
          <label>
            Fecha Fin:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="ml-2 p-2 border rounded"
            />
          </label>
          <CustomButton 
            onClick={() => fetchData(pagination)} 
            className="bg-blue-500 hover:bg-blue-600 text-white p-2"
            placeholder="Buscar"
          >
          </CustomButton>
        </div>
      </div>

      <Table
        columns={generateColumns()}
        dataSource={trabajadores}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            setPagination(prev => ({
              ...prev,
              current: page,
              pageSize: pageSize,
            }));
          },
        }}
        loading={loading}
        scroll={{
          x: 'max-content',
          y: 400,
        }}
        className="w-full text-sm text-left rtl:text-right text-gray-600 dark:text-gray-400"
        onChange={(pagination, _, sorter) => fetchData(pagination, sorter)}
        sticky
      />
    </div>
  );
};

export default NuevaAsistencia;