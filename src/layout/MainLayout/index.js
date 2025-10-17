import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import { AppBar, Box, CssBaseline, Toolbar, useMediaQuery } from '@mui/material';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import Header from './Header';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import navigation from 'menu-items';
import { drawerWidth } from 'store/constant';
import { SET_MENU } from 'store/actions';
import { IconChevronRight } from '@tabler/icons-react';

// Main content styled
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'theme' })(({ theme, open }) => ({
  ...theme.typography.mainContent,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen
  }),
  [theme.breakpoints.up('md')]: {
    marginLeft: open ? 0 : -(drawerWidth - 20),
    width: `calc(100% - ${drawerWidth}px)`
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: '0px',
    width: `100%`,
    padding: '12px'
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: '0px',
    width: `100%`,
    padding: '8px'
  },
  backgroundColor: '#f9fafb'
}));

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));

  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Header */}
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          bgcolor: 'linear-gradient(90deg, #0f172a, #1e293b)',
          color: '#fff',
          zIndex: theme.zIndex.drawer + 1,
          height: 65,
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar disableGutters sx={{ px: 0, minHeight: '65px !important' }}>
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

      {/* Main Content */}
      <Main theme={theme} open={leftDrawerOpened}>
        <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
        <Outlet />
      </Main>

      <Customization />
    </Box>
  );
};

export default MainLayout;
