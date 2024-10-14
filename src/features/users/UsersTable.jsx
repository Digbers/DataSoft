import { useMemo} from "react";
import CustomTable from "../table/CustomTable";
const UsersTable = () => {
    const userColumns = useMemo(
        () => [
            {
                accessorFn: row => row.id,
                id: 'id',  
                header: () => <span>ID</span>,
            },
            {
                accessorFn: row => row.username,
                id: 'username',  
                header: () => <span>Nombre</span>,
            },
            {
                accessorFn: row => row.isEnabled,
                id: 'isEnabled',  
                header: () => <span>Estado</span>,
            },
            {
                accessorKey: "roles",
                id: 'roles',  
                header: () => <span>Roles</span>,
                cell: info => info.getValue().map(role => role.roleEnum).join(", ")
            },
            {
                id: 'expander',  // Identificador único para la columna de expansión
                header: () => null,  // Sin encabezado para la columna de expansión
                cell: ({ row }) => (
                    row.getCanExpand() ? (
                        <span {...row.getToggleExpandedProps()}>
                            {row.getIsExpanded() ? "▼" : "▶"}
                        </span>
                    ) : "no expandible"
                ),
            },
        ],
        []
    );

    return (
        <div className="">
            <h1>Mantenimiento Usuarios</h1>
            <CustomTable apiEndpoint="http://localhost:8080/auth/list" columns={userColumns} />
        </div>
    );
};

export default UsersTable;
