import { AccountCircle, SupervisorAccount } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography, AppBar, Toolbar, Switch } from "@mui/material"
import { useNavigate, useLocation } from "react-router-dom";
import { useThemeMode } from "../context/ThemeContext";

const drawerWidth = 240;

const DrawerItems = [{
  title: "Admin",
  icon: <SupervisorAccount />,
  path: '/'
},
{
  title: "User",
  icon: <AccountCircle />,
  path: '/user'
}
]


const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { sm: drawerWidth },
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h5" sx={{ fontWeight: 'bold', width: '100%', textAlign: 'center', color: 'primary.main' }}>
            DashBoard
          </Typography>
        </Toolbar>

        <List sx={{ flexGrow: 1 }}>
          {DrawerItems.map((menu) => (
            <ListItem
              button
              key={menu.title}
              onClick={() => navigate(menu.path)}
              sx={{
                backgroundColor: location.pathname === menu.path
                  ? (mode === 'light' ? '#e3f2fd' : '#1e3a5f')
                  : 'transparent',
                '&:hover': {
                  backgroundColor: mode === 'light' ? '#e3f2fd' : '#1e3a5f',
                },
                borderLeft: location.pathname === menu.path ? '4px solid' : '4px solid transparent',
                borderColor: location.pathname === menu.path ? 'primary.main' : 'transparent',
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === menu.path ? 'primary.main' : 'inherit' }}>
                {menu.icon}
              </ListItemIcon>
              <ListItemText
                primary={menu.title}
                sx={{ color: location.pathname === menu.path ? 'primary.main' : 'inherit' }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <ListItem>
            <ListItemText primary="Switch Mode" sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              color="primary"
            />
          </ListItem>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky">
          <Toolbar />
        </AppBar>
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
