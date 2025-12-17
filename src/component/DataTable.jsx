import {
  TableCell, TableContainer, TableHead, TableRow, Button, TableBody, Card,
  Table, Checkbox, IconButton, TextField, Box, Dialog, DialogTitle, DialogContent, Snackbar, Alert, DialogActions, DialogContentText, MenuItem
} from "@mui/material";

import { Add, Delete, Edit, Public, ArrowUpward, ArrowDownward, ArrowForward, ArrowBack } from "@mui/icons-material";

import { useEffect, useState, } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import CreateData from "./CreateData";

export default function DataTable({ type }) {
  const theme = useTheme();
  const [tabledata, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [params, setParams] = useSearchParams();
  const limit = Number(params.get("limit")) || 5;
  const offset = Number(params.get("offset")) || 0;
  const search = params.get("search") || "";
  const ordering = params.get("ordering") || "";
  const isGlobal = params.get("is_global") || "";
  const [totalCount, setTotalCount] = useState(0);

  async function loadData() {
    try {
      const url = new URL("http://127.0.0.1:8000/api/items/");
      url.searchParams.set("limit", limit);
      url.searchParams.set("offset", offset);
      if (search) url.searchParams.set("search", search);
      if (ordering) url.searchParams.set("ordering", ordering);
      if (isGlobal) url.searchParams.set("is_global", isGlobal);

      if (search.length == 0 || search.length >= 3) {  // lamin updated
        const res = await fetch(url);
        const data = await res.json();

        setTableData(data.results || []);
        setTotalCount(data.count || 0);
        setSelectedIds([]);
      }
    } catch (err) {
      console.log("Error fetching:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, [limit, offset, search, ordering, isGlobal]);

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  useEffect(() => {
    if (isGlobal && tabledata.length > 0) {
      const selectableIds = tabledata.filter(item => {
        if (type === "admin") return item.is_global === true;
        if (type === "user") return item.is_global === false;
        return false;
      }).map(item => item.id);
      setSelectedIds(selectableIds);
    }
  }, [isGlobal, tabledata, type]);

  function SearchEvent(e) {
    const value = e.target.value;
    setSearchQuery(value);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== search) {  // lamin updated
        params.set("search", searchQuery);
        params.set("offset", 0);
        setParams(params);
        console.log(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);


  }, [searchQuery, params, setParams]);

  const canModify = (item) => {
    if (type === "admin") return item.is_global === true;
    if (type === "user") return item.is_global === false;
    return false;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = tabledata.filter(item => canModify(item)).map(item => item.id);
      setSelectedIds(selectableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isAllSelected = tabledata.length > 0 &&
    selectedIds.length === tabledata.filter(item => canModify(item)).length;

  // const CSVUrl = () => {
  //   const url = new URL(`http://127.0.0.1:8000/api/items/export-csv/`);

  //   if (selectedIds.length > 0) {
  //     url.searchParams.set("ids", selectedIds.join(","));
  //     if (ordering) url.searchParams.set("ordering", ordering);
  //     return url.toString();
  //   }
  //   if (search) url.searchParams.set("search", search);
  //   if (ordering) url.searchParams.set("ordering", ordering);
  //   if (isGlobal) url.searchParams.set("is_global", isGlobal);
  //   if (limit) url.searchParams.set("limit", limit);
  //   if (offset) url.searchParams.set("offset", offset);

  //   return url.toString();
  // };


  const handleCreateSubmit = async (form) => {
    try {
      await fetch("http://127.0.0.1:8000/api/items/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setOpenCreate(false);
      setSnackbar({ open: true, message: 'Item created successfully!', severity: 'success' });
      loadData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create item', severity: 'error' });
      console.log("Create failed:", err);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/items/${editItem.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItem),
      });

      setOpenEdit(false);
      setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'info' });
      loadData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update item', severity: 'error' });
      console.log("Edit failed:", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/items/${deleteItemId}/`, {
        method: "DELETE",
      });
      setOpenDeleteDialog(false);
      setSnackbar({ open: true, message: 'Item deleted', severity: 'error' });
      loadData();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete item', severity: 'error' });
      console.log("Delete failed:", err);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSort = (column) => {
    let newOrder = "";

    if (ordering === column) newOrder = "-" + column;
    else if (ordering === "-" + column) newOrder = "";
    else newOrder = column;

    params.set("ordering", newOrder);
    params.set("offset", 0);
    setParams(params);
  };

  const sortIcon = (column) => {
    if (ordering === column) return <ArrowUpward fontSize="small" sx={{ color: 'primary.main' }} />;
    if (ordering === "-" + column) return <ArrowDownward fontSize="small" sx={{ color: 'primary.main' }} />;
    return <ArrowUpward fontSize="small" sx={{ opacity: 0.3 }} />;
  };

  const globalChange = async (type) => {
    try {
      await fetch("http://127.0.0.1:8000/api/items/bulk-update-global/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ids: selectedIds,
            is_global: type === "admin" ? false : true
          }),

        });
      setSnackbar({ open: true, message: 'State changed successfully!', severity: 'success' });
      loadData();
    }
    catch (err) {
      console.log(err);
    }

  }

  return (
    <>
      <Card sx={{ padding: { xs: "10px", sm: "20px" } }} elevation={3}>
        {/* TOP BAR */}
        <Box sx={{
          display: "flex",
          marginBottom: "10px",
          flexWrap: "wrap",
          gap: "10px",
          width: "100%",
          alignItems: "center"
        }}>
          <TextField
            variant="outlined"
            placeholder="Search by name..."
            label="Search"
            value={searchQuery}
            onChange={SearchEvent}
            sx={{
              flexGrow: 1,
              minWidth: { xs: "100%", sm: "200px", md: "300px" }
            }}
            size="small"
          />

          <Button
            startIcon={<Public />}
            variant={isGlobal ? "contained" : "outlined"}
            onClick={() => globalChange(type)}
            sx={{
              flexShrink: 0,
              minWidth: { xs: "100%", sm: "auto" }
            }}
          >
            {type === "admin" ? "Move To User" : "Move To Admin"}
          </Button>

          <Button
            startIcon={<Add />}
            variant="contained"
            onClick={() => setOpenCreate(true, isGlobal)}
            sx={{
              flexShrink: 0,
              minWidth: { xs: "100%", sm: "auto" }
            }}
          >
            Create
          </Button>

          <a href={`http://127.0.0.1:8000/api/items/export-csv/${window.location.search}`} // lamin updated
            download style={{ textDecoration: "none", flexShrink: 0, minWidth: "auto" }}>
            <Button
              variant="outlined"
              sx={{
                minWidth: { xs: "100%", sm: "auto" },
                whiteSpace: "nowrap"
              }}
            >
              Export CSV {selectedIds.length > 0 && `(${selectedIds.length})`}
            </Button>
          </a>
        </Box>

        {/* TABLE */}
        <TableContainer sx={{ overflowX: "auto", overflowY: "visible" }}>
          <Table sx={{ minWidth: { xs: "100%", sm: 650 } }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={selectedIds.length > 0 && !isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell
                  onClick={() => handleSort("id")}
                  sx={{
                    cursor: "pointer",
                    userSelect: 'none',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>
                    Id
                    <Box component="span" sx={{ ml: 0.5, display: 'inline-flex', alignItems: 'center', minWidth: '20px' }}>
                      {sortIcon("id")}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell
                  onClick={() => handleSort("title")}
                  sx={{
                    cursor: "pointer",
                    userSelect: 'none',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>
                    Title
                    <Box component="span" sx={{ ml: 0.5, display: 'inline-flex', alignItems: 'center', minWidth: '20px' }}>
                      {sortIcon("title")}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell
                  onClick={() => handleSort("category")}
                  sx={{
                    cursor: "pointer",
                    userSelect: 'none',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>
                    Category
                    <Box component="span" sx={{ ml: 0.5, display: 'inline-flex', alignItems: 'center', minWidth: '20px' }}>
                      {sortIcon("category")}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>Description</TableCell>

                <TableCell
                  onClick={() => handleSort("user_name")}
                  sx={{
                    cursor: "pointer",
                    userSelect: 'none',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}>
                    UserName
                    <Box component="span" sx={{ ml: 0.5, display: 'inline-flex', alignItems: 'center', minWidth: '20px' }}>
                      {sortIcon("user_name")}
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tabledata.map((item) => (
                <TableRow key={item.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      disabled={!canModify(item)}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectOne(item.id)}
                    />
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.description}</TableCell>

                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        color: item.is_global
                          ? (theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2')
                          : 'inherit',
                        fontWeight: item.is_global ? 'bold' : 'normal',
                        textShadow: item.is_global && theme.palette.mode === 'dark'
                          ? ' rgba(144, 202, 249, 0.5)'
                          : 'none'
                      }}
                    >
                      {item.user_name}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <IconButton
                      disabled={!canModify(item)}
                      size="small"
                      onClick={() => {
                        setEditItem(item);
                        setOpenEdit(true);
                      }}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      disabled={!canModify(item)}
                      size="small"
                      onClick={() => handleDeleteClick(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        <Box sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 2,
          alignItems: "center",
          flexDirection: "row",
          gap: 2
        }}>
          {/* Rows per page */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <span>Rows per page:</span>
            <TextField
              select
              size="small"
              value={limit}
              onChange={(e) => {
                params.set("limit", e.target.value);
                params.set("offset", 0);
                setParams(params);
              }}
              sx={{ width: 80 }}
            >
              {[5, 10, 20, 50].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Pagination arrows */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              disabled={offset === 0}
              onClick={() => {
                params.set("offset", Math.max(offset - limit, 0));
                setParams(params);
              }}
            >
              <ArrowBack />
            </Button>

            <strong>{offset / limit + 1}</strong>

            <Button
              disabled={offset + limit >= totalCount}
              onClick={() => {
                params.set("offset", offset + limit);
                setParams(params);
                console.log()
              }}
            >
              <ArrowForward />
            </Button>
          </Box>
        </Box>

        {/* CREATE Dialog */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create Item</DialogTitle>
          <DialogContent>
            <CreateData onSubmit={handleCreateSubmit} />
          </DialogContent>
        </Dialog>

        {/* EDIT DIALOG */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Item</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {editItem && (
              <>
                <TextField
                  label="Title"
                  value={editItem.title}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                  sx={{ mt: 1 }}
                />
                <TextField
                  label="Category"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                />
                <TextField
                  label="Description"
                  value={editItem.description}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                />
                <Button variant="contained" onClick={handleEditSubmit}>
                  Save Changes
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* DELETE DIALOG */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this item? This item will deleted permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar notifycation */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant={theme.palette.mode === 'dark' ? 'standard' : 'filled'}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Card>
    </>
  );
}
