import { Box, TextField, Button } from "@mui/material";
import React, { useState } from "react";

export default function CreateData({ onSubmit, type }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [userName, setUserName] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title,
      category,
      description,
      user_name: userName,
      is_global: type === "admin" ? false : true,
    };

    onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />

      <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth />

      <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />

      <TextField label="User Name" value={userName} onChange={(e) => setUserName(e.target.value)} fullWidth />

      <Button type="submit" variant="contained">Save</Button>
    </Box>
  );
}
