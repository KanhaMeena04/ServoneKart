import * as React from "react";
import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import SideMenu from "../components/SideMenu";
import AppNavbar from "../components/AppNavbar";
import Header from "../components/Header";

export default function AppLayout() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8faff" }}>
      <SideMenu />
      <AppNavbar open={open} toggleDrawer={toggleDrawer} />

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, overflowX: "hidden" }}>
        <Stack sx={{ mx: { xs: 1, sm: 2, md: 3 }, mt: { xs: 7, md: 0 } }}>
          <Header onToggleDashboard={toggleDrawer(true)} />

          {/* 👇 PAGE CONTENT COMES HERE */}
          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
}
