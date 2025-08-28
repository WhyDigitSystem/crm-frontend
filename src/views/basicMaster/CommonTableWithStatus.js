import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Chip, Grid, Stack, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import ActionButton from 'utils/ActionButton';
import dayjs from 'dayjs';

const CommonTableWithStatus = ({
    data = [],
    columns = [],
    blockEdit,
    toEdit,
    disableEditIcon,
    viewIcon,
    isPdf,
    GeneratePdf,
    enableEditing,
    summaryCounts = { New: 0, Qualified: 0, Unqualified: 0, InProgress: 0 }
}) => {
    const [tableData, setTableData] = useState(data);
    const theme = useTheme();

    const chipSX = { height: 24, padding: '0 6px' };
    const chipSuccessSX = { ...chipSX, color: theme.palette.success.dark, backgroundColor: theme.palette.success.light, height: 28 };
    const chipErrorSX = { ...chipSX, color: theme.palette.orange.dark, backgroundColor: theme.palette.orange.light, marginRight: '5px' };

    const handleButtonClick = (row) => toEdit?.(row);

    useEffect(() => {
        console.log('BlockEdit', blockEdit);
    }, [blockEdit]);

    const customColumns = columns.map((column) => {
        if (column.accessorKey?.toLowerCase().includes('date')) {
            return {
                ...column,
                Cell: ({ cell }) => {
                    const value = cell.getValue();
                    return value ? dayjs(value).format('DD-MM-YYYY') : '-';
                }
            };
        }
        if (column.accessorKey === 'active') {
            return {
                ...column,
                Cell: ({ cell }) => (
                    <Chip
                        label={cell.getValue() === 'Active' ? 'Active' : 'In-Active'}
                        sx={cell.getValue() === 'Active' ? chipSuccessSX : chipErrorSX}
                    />
                )
            };
        }
        if (column.accessorKey === 'closed') {
            return {
                ...column,
                Cell: ({ cell }) => (
                    <Chip label={cell.getValue() === 'Yes' ? 'Yes' : 'No'} sx={cell.getValue() === 'Yes' ? chipSuccessSX : chipErrorSX} />
                )
            };
        }
        return column;
    });

    const renderRowActions = ({ row }) => (
        <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {isPdf && <ActionButton title="Pdf" icon={PictureAsPdfIcon} onClick={() => GeneratePdf?.(row)} />}
            {!disableEditIcon && <ActionButton title="Edit" icon={EditIcon} onClick={() => handleButtonClick(row)} />}
        </Box>
    );

    return (
        <>
            {/* Summary Cards */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    {[
                        { label: 'New', count: summaryCounts.New, color: '#1e88e5', icon: '🆕' },
                        { label: 'Won', count: summaryCounts.Qualified, color: '#43a047', icon: '✅' },
                        { label: 'Lost', count: summaryCounts.Unqualified, color: '#e53935', icon: '❌' },
                        { label: 'In Progress', count: summaryCounts.InProgress, color: '#fb8c00', icon: '⏳' }
                    ].map(({ label, count, color, icon }) => (
                        <Grid item xs={12} sm={6} md={3} key={label}>
                            <Paper
                                elevation={3}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    backgroundColor: '#ffffff',
                                    color: '#111827',
                                    borderLeft: `6px solid ${color}`,
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 2,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: `0 4px 20px ${color}33`
                                    }
                                }}
                            >
                                <Box>
                                    <Box sx={{ fontSize: 18, fontWeight: 500 }}>{label}</Box>
                                    <Box sx={{ fontSize: 24, fontWeight: 'bold', mt: 0.5 }}>{count}</Box>
                                </Box>
                                <Box sx={{ fontSize: 32 }}>{icon}</Box>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Table */}
            <MaterialReactTable
                displayColumnDefOptions={{
                    'mrt-row-actions': {
                        muiTableHeadCellProps: {
                            sx: {
                                backgroundColor: '#f3f4f6',
                                color: '#111827',
                                fontWeight: 'bold',
                                fontSize: '13px',
                                textAlign: 'left',
                                borderBottom: '2px solid #e5e7eb',
                                padding: '10px 12px'
                            }
                        },
                        muiTableBodyCellProps: {
                            sx: { borderBottom: 'none', padding: '10px 12px' }
                        },
                        size: 40
                    }
                }}
                columns={customColumns.map((col) => ({
                    ...col,
                    muiTableHeadCellProps: {
                        sx: {
                            backgroundColor: '#f3f4f6',
                            color: '#111827',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            textAlign: 'left',
                            borderBottom: '2px solid #e5e7eb',
                            padding: '10px 12px'
                        }
                    },
                    muiTableBodyCellProps: {
                        sx: {
                            fontSize: '14px',
                            color: '#111827',
                            padding: '10px 12px',
                            textAlign: 'left',
                            borderBottom: '1px solid #e5e7eb'
                        }
                    }
                }))}
                data={tableData}
                enableColumnOrdering={false}
                enableColumnActions={false}
                enableEditing
                renderRowActions={renderRowActions}
                initialState={{ density: 'compact' }}
                muiTableContainerProps={{
                    sx: {
                        background: '#ffffff',
                        borderRadius: '5px',
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #e5e7eb'
                    }
                }}
                muiTableProps={{
                    sx: {
                        backgroundColor: '#ffffff',
                        borderRadius: '5px',
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb'
                    }
                }}
                muiTableBodyRowProps={{
                    sx: {
                        height: '50px',
                        '&:nth-of-type(even)': { backgroundColor: '#f9fafb' },
                        '&:hover': {
                            backgroundColor: '#f3f4f6',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            transition: '0.2s ease-in-out'
                        }
                    }
                }}
            />
        </>
    );
};

export default CommonTableWithStatus;
