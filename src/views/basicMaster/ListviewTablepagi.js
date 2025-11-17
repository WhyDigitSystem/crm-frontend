import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShareIcon from '@mui/icons-material/Share';
import { Box, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MaterialReactTable } from 'material-react-table';
import { useEffect, useState } from 'react';
import ActionButton from 'utils/ActionButton';
import dayjs from 'dayjs';

const ListviewTablepagi = ({
  data = [],
  columns = [],
  pagination,
  setPagination,
  toEdit,
  disableEditIcon,
  isPdf,
  GeneratePdf,
  onShare,
  isShare
}) => {

  const [tableData, setTableData] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    setTableData(data || []);
  }, [data]);

  /* STYLISH CHIP STYLES */
  const chipSuccessSX = {
    height: 26,
    color: "#0f5132",
    fontWeight: 600,
    backgroundColor: "#d1e7dd",
    borderRadius: "6px",
  };

  const chipErrorSX = {
    height: 26,
    color: "#842029",
    fontWeight: 600,
    backgroundColor: "#f8d7da",
    borderRadius: "6px",
  };

  /* COLUMN CUSTOMIZATION */
  const customColumns = columns.map((col) => {
    if (col.accessorKey?.toLowerCase().includes("date")) {
      return {
        ...col,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          return (
            <span style={{ fontWeight: 500 }}>
              {v ? dayjs(v).format("DD-MM-YYYY") : "-"}
            </span>
          );
        }
      };
    }

    if (col.accessorKey === "active") {
      return {
        ...col,
        Cell: ({ cell }) => {
          const value = String(cell.getValue()).toLowerCase();
          const active = ["active", "true", "1", "yes"].includes(value);
          return (
            <Chip
              label={active ? "Active" : "Inactive"}
              sx={active ? chipSuccessSX : chipErrorSX}
            />
          );
        }
      };
    }

    return col;
  });

  /* ACTION BUTTON STYLING */
  const renderRowActions = ({ row }) => (
    <Box sx={{ display: "flex", gap: "12px", justifyContent: "center" }}>
      {isPdf && (
        <ActionButton title="PDF" icon={PictureAsPdfIcon} onClick={() => GeneratePdf(row)} />
      )}

      {!disableEditIcon && (
        <ActionButton title="Edit" icon={EditIcon} onClick={() => toEdit(row)} />
      )}

      {isShare && (
        <ActionButton title="Share" icon={ShareIcon} onClick={() => onShare(row.original)} />
      )}
    </Box>
  );

  return (
    <MaterialReactTable
      columns={customColumns}
      data={tableData}

      manualPagination
      enablePagination
      state={{ pagination }}

      rowCount={pagination.totalCount}
      onPaginationChange={setPagination}

      enableEditing
      renderRowActions={renderRowActions}

      initialState={{
        density: "compact",
        pagination: { pageSize: 5, pageIndex: 0 },
      }}

      /* ⭐ BEAUTIFUL TABLE HEADER STYLING */
      muiTableHeadCellProps={{
        sx: {
          backgroundColor: "#3b82f6",   // dark-blue header
          color: "#ffffff",
          fontWeight: "bold",
          fontSize: "14px",
          // borderBottom: "2px solid rgba(24, 38, 68, 1)",
          padding: "10px",
        },
      }}

      /* ⭐ TABLE CONTAINER STYLING */
      muiTableContainerProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }
      }}

      /* ⭐ ROW STYLING WITH ANIMATION */
      muiTableBodyRowProps={{
        sx: {
          height: "46px",
          transition: "0.25s ease",
          "&:hover": {
            backgroundColor: "#f1f5f9",
            transform: "scale(1.005)",
            boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
          },
          "&:nth-of-type(even)": {
            backgroundColor: "#f8fafc",
          }
        }
      }}

      /* ⭐ PAGINATION BAR EXTRA STYLE */
      muiPaginationProps={{
        shape: "rounded",
        variant: "outlined",
      }}
    />
  );
};

export default ListviewTablepagi;
