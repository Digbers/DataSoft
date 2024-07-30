import { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import { 
   useReactTable,
   getCoreRowModel,
   flexRender,
} from '@tanstack/react-table';
import axios from "../../config/axiosConfig";

const CustomTable = ({ apiEndpoint, columns, defaultPageSize = 20 }) => {
    const [data, setData] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const fetchData = useCallback(async (pageIndex, pageSize) => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiEndpoint}?page=${pageIndex}&size=${pageSize}`);
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
        fetchData(pageIndex, pageSize);
    }, [pageIndex, pageSize, fetchData]);

    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
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
        }
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
                                        : flexRender(header.column.columnDef.header, header.getContext())}
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
