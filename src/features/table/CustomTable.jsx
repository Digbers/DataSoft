import { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { 
   useReactTable,
   getCoreRowModel,
   flexRender,
   getExpandedRowModel,
} from '@tanstack/react-table';
import axios from "../../config/axiosConfig";   
import {getMenusById} from "../../features/menu/menuService";

const CustomTable = ({ apiEndpoint, columns, defaultPageSize = 20 }) => {
    const [data, setData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [filters, setFilters] = useState({});
    const [expanded, setExpanded] = useState({});
    const [subRowData, setSubRowData] = useState({});

    const fetchData = useCallback(async (pageIndex, pageSize, filters) => {
        setLoading(true);
        try {
            const response = await axios.get(apiEndpoint, {
                params: {
                    page: pageIndex,
                    size: pageSize,
                    ...filters,
                },
            });
            setData(response.data.content || []);
            setPageCount(response.data.totalPages || 0);
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
            setPageCount(0);
        }
        setLoading(false);
    }, [apiEndpoint]);

    const fetchDataCallback = useCallback(() => {
        fetchData(pageIndex, pageSize, filters);
    }, [pageIndex, pageSize, filters, fetchData]);

    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);

    const fetchMenus = async (userId) => {
        getMenusById(userId)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error('Error fetching menus:', error);
            return [];
        });

    };

    const handleFilterChange = (columnId, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [columnId]: value,
        }));
        setPageIndex(0); // Reset to first page whenever filters change
    };

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: {
                pageIndex,
                pageSize,
            },
            columnFilters: filters,
            expanded,
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: (newExpanded) => {
            setExpanded(newExpanded);
            // Buscar datos para filas expandidas
            console.log(newExpanded)
            Object.keys(newExpanded).forEach((rowIndex) => {
                const row = table.getRowModel().rows[rowIndex];
                const rowId = row.original.id;
                if (newExpanded[rowIndex] && !subRowData[rowId]) {
                    fetchMenus(rowId).then(subRows => {
                        setSubRowData((prev) => ({ ...prev, [rowId]: subRows }));
                        console.log("subRows: ", subRows);
                    });
                }
            });
        },
        onPaginationChange: updater => {
            if (typeof updater === 'function') {
                const newPagination = updater({
                    pageIndex,
                    pageSize,
                });
                setPageIndex(newPagination.pageIndex);
                setPageSize(newPagination.pageSize);
            } else {
                setPageIndex(updater.pageIndex);
                setPageSize(updater.pageSize);
            }
        },
        onColumnFiltersChange: setFilters,
    });


    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-6 py-3">
                                    {header.isPlaceholder
                                        ? null
                                        : (
                                            <>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                <div>
                                                    <input
                                                        value={filters[header.id] || ''}
                                                        onChange={e => handleFilterChange(header.id, e.target.value)}
                                                        placeholder={`Filtrar ${typeof header.column.columnDef.header === 'string' ? header.column.columnDef.header : ''}`}
                                                        className="mt-2 p-1 border border-gray-300 rounded-md"
                                                    />
                                                </div>
                                            </>
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: "center" }}>Cargando...</td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (

                                <tr key={row.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div>
                <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                    {"<<"}
                </button>
                <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    {"<"}
                </button>
                <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    {">"}
                </button>
                <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                    {">>"}
                </button>
                <span>
                    Page{" "}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </strong>{" "}
                </span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => {
                        const newSize = Number(e.target.value);
                        setPageSize(newSize);
                        table.setPageSize(newSize);
                    }}
                >
                    {[10, 20, 30, 40, 50].map((size) => (
                        <option key={size} value={size}>
                            Show {size}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

CustomTable.propTypes = {
    apiEndpoint: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    defaultPageSize: PropTypes.number,
};

export default CustomTable;
