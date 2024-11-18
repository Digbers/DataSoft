import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import SelectInput from "../../../components/inputs/SelectInput";
import TextInput from "../../../components/inputs/TextInput";
import { useAddEntidad } from "../../../hooks/useAddEntidad";
import Swal from "sweetalert2";

const ClienteModal = ({ isOpen, onClose, tipoDocumento, setEntidad, sesionEmpId }) => {
    const [formData, setFormData] = useState({
        idEmpresa: sesionEmpId,
        tipoDocumento: "",
        numeroDocumento: "",
        nombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        direccion: "",
        email: "",
        telefono: "",
    });
    useEffect(() => {
        setFormData(prev => ({ ...prev, tipoDocumento: tipoDocumento.find(td => td.value === "DNI").value }));
    }, [tipoDocumento]);
    

    const numeroDocumentoRef = useRef();
    const nombreRef = useRef();
    const apellidoPaternoRef = useRef();
    const apellidoMaternoRef = useRef();
    const direccionRef = useRef();
    const emailRef = useRef();
    const telefonoRef = useRef();
    
    const [errors, setErrors] = useState({});
    
    const handleInputChange = (value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const { addEntidad } = useAddEntidad();

    const validateForm = () => {
        const newErrors = {};
        if (formData.tipoDocumento === "DNI") {
            if (!/^\d{8}$/.test(formData.numeroDocumento)) {
                newErrors.numeroDocumento = "El DNI debe tener exactamente 8 dígitos numéricos.";
            }
            if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio.";
            if (!formData.apellidoPaterno) newErrors.apellidoPaterno = "El apellido paterno es obligatorio.";
            if (!formData.apellidoMaterno) newErrors.apellidoMaterno = "El apellido materno es obligatorio.";
        } else if (formData.tipoDocumento === "RUC") {
            if (!/^\d{11}$/.test(formData.numeroDocumento)) {
                newErrors.numeroDocumento = "El RUC debe tener exactamente 11 dígitos numéricos.";
            }
            if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio.";
        }
        setErrors(newErrors);

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await addEntidad(formData);
                if (response) {
                    setEntidad(response);
                    onClose();
                }
            } catch (error) {
                console.error("Error al agregar la entidad:", error);
            }
        } else {
            // Mostrar el primer error y enfocar el campo correspondiente
            const firstErrorKey = Object.keys(validationErrors)[0];
            const firstErrorMessage = validationErrors[firstErrorKey];

            // Mostrar alerta con el primer mensaje de error
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: firstErrorMessage,
            });

            // Enfocar el campo correspondiente al primer error
            switch (firstErrorKey) {
                case 'numeroDocumento':
                    numeroDocumentoRef.current?.focus();
                    break;
                case 'nombre':
                    nombreRef.current?.focus();
                    break;
                case 'apellidoPaterno':
                    apellidoPaternoRef.current?.focus();
                    break;
                case 'apellidoMaterno':
                    apellidoMaternoRef.current?.focus();
                    break;
                case 'direccion':
                    direccionRef.current?.focus();
                    break;
                case 'email':
                    emailRef.current?.focus();
                    break;
                case 'telefono':
                    telefonoRef.current?.focus();
                    break;
                default:
                    break;
            }
        }
    };


    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                <h2 className="text-2xl font-semibold mb-4">Agregar Cliente</h2>
                <form>
                    <div className="mb-4">
                        <SelectInput
                            value={formData.tipoDocumento}
                            setValue={(value) => handleInputChange(value, "tipoDocumento")}
                            options={tipoDocumento}
                            placeholder="Tipo de Documento"
                        />
                    </div>

                    <div className="mb-4">
                        <TextInput
                            ref={numeroDocumentoRef}
                            text={formData.numeroDocumento}
                            setText={(value) => handleInputChange(value, "numeroDocumento")}
                            placeholder="Número de Documento"
                            error={errors.numeroDocumento}
                            typeInput="text"
                        />
                    </div>
                    <div className="mb-4">
                        <TextInput
                            ref={nombreRef}
                            text={formData.nombre}
                            setText={(value) => handleInputChange(value, "nombre")}
                            placeholder="Nombre"
                            error={errors.nombre}
                            typeInput="text"
                        />
                    </div>
                    {formData.tipoDocumento === "DNI" && (
                        <>
                            <div className="mb-4">
                                <TextInput
                                    ref={apellidoPaternoRef}
                                    text={formData.apellidoPaterno}
                                    setText={(value) => handleInputChange(value, "apellidoPaterno")}
                                    placeholder="Apellido Paterno"
                                    error={errors.apellidoPaterno}
                                    typeInput="text"
                                />
                            </div>
                            <div className="mb-4">
                                <TextInput
                                    ref={apellidoMaternoRef}
                                    text={formData.apellidoMaterno}
                                    setText={(value) => handleInputChange(value, "apellidoMaterno")}
                                    placeholder="Apellido Materno"
                                    error={errors.apellidoMaterno}
                                    typeInput="text"
                                />
                            </div>
                        </>
                    )}
                    <div className="mb-4">
                        <TextInput
                            ref={direccionRef}
                            text={formData.direccion}
                            setText={(value) => handleInputChange(value, "direccion")}
                            placeholder="Dirección"
                            typeInput="text"
                        />
                    </div>
                    <div className="mb-4">
                        <TextInput
                            ref={emailRef}
                            text={formData.email}
                            setText={(value) => handleInputChange(value, "email")}
                            placeholder="Email"
                            typeInput="text"
                        />
                    </div>
                    <div className="mb-4">
                        <TextInput
                            ref={telefonoRef}
                            text={formData.telefono}
                            setText={(value) => handleInputChange(value, "telefono")}
                            placeholder="Teléfono"
                            typeInput="text"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            onClick={handleSubmit}
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ClienteModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    tipoDocumento: PropTypes.array.isRequired,
    setEntidad: PropTypes.func.isRequired,
    sesionEmpId: PropTypes.number.isRequired,
};

export default ClienteModal;
