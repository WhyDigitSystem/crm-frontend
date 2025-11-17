// import PropTypes from 'prop-types';
// import { Box, Drawer, useMediaQuery } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import { BrowserView, MobileView } from 'react-device-detect';
// import PerfectScrollbar from 'react-perfect-scrollbar';
// import { drawerWidth } from 'store/constant';
// import LogoSection from '../LogoSection';
// import MenuCard from './MenuCard';
// import MenuList from './MenuList';

// const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
//   const theme = useTheme();
//   const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

//   const drawer = (
//     <>
//       <Box sx={{ display: { xs: 'block', md: 'none' } }}>
//         <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
//           <LogoSection />
//         </Box>
//       </Box>

//       <BrowserView>
//         <PerfectScrollbar
//           component="div"
//           style={{
//             height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
//             paddingLeft: '5px',
//             paddingRight: '5px'
//           }}
//         >
//           <MenuList />
//           <MenuCard />
//         </PerfectScrollbar>
//       </BrowserView>

//       <MobileView>
//         <Box sx={{ px: 1 }}>
//           <MenuList />
//           <MenuCard />
//         </Box>
//       </MobileView>
//     </>
//   );

//   const container = window !== undefined ? () => window.document.body : undefined;

//   return (
//     <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : 'auto' }} aria-label="mailbox folders">
//       <Drawer
//         container={container}
//         variant={matchUpMd ? 'persistent' : 'temporary'}
//         anchor="left"
//         open={drawerOpen}
//         onClose={drawerToggle}
//         sx={{
//           '& .MuiDrawer-paper': {
//             width: drawerWidth,
//             background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
//             color: '#fff',
//             borderRight: 'none',
//             [theme.breakpoints.up('md')]: { top: '69px' },
//             '& .MuiListItem-root': { padding: '12px 20px', borderRadius: '8px', margin: '4px 0' },
//             '& .MuiListItem-root:hover': { backgroundColor: '#00bfa6', color: '#111827' },
//             '& .Mui-selected': {
//               backgroundColor: '#00bfa6',
//               color: '#ffffffff',
//               borderLeft: '4px solid #00bfa6',
//               boxShadow: '2px 0 8px rgba(0,191,166,0.3)'
//             },
//             '& .MuiListItemIcon-root': { minWidth: '40px', fontSize: '1.3rem' }
//           }
//         }}
//         ModalProps={{ keepMounted: true }}
//       >
//         {drawer}
//       </Drawer>
//     </Box>
//   );
// };

// Sidebar.propTypes = {
//   drawerOpen: PropTypes.bool,
//   drawerToggle: PropTypes.func,
//   window: PropTypes.object
// };

// export default Sidebar;

import PropTypes from 'prop-types';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { BrowserView, MobileView } from 'react-device-detect';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { drawerWidth } from 'store/constant';
import LogoSection from '../LogoSection';
import MenuCard from './MenuCard';
import MenuList from './MenuList';

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));

  // Width when collapsed (icons only)
  // const collapsedWidth = 80;
  const collapsedWidth = 70;


  const drawer = (
    <>
      {/* Logo visible only on mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
          <LogoSection />
        </Box>
      </Box>

      {/* Desktop view with smooth scrollbar */}
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
            paddingLeft: '5px',
            paddingRight: '5px'
          }}
        >
          <MenuList drawerOpen={drawerOpen} />
          {drawerOpen && <MenuCard />}
        </PerfectScrollbar>
      </BrowserView>

      {/* Mobile view */}
      <MobileView>
        <Box sx={{ px: 1 }}>
          <MenuList drawerOpen={!drawerOpen} />
          {drawerOpen && <MenuCard />}
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { md: 0 },
        width: matchUpMd ? drawerWidth : 'auto'
      }}
      aria-label="sidebar navigation"
    >
      <Drawer
        container={container}
        variant={matchUpMd ? 'permanent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : collapsedWidth,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            }),
            overflowX: 'hidden',
          //background: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',
          //background:' linear-gradient(to bottom, #F0F7FF, #1E3A8A)',
          // background: 'linear-gradient(180deg, #F0F7FF 0%, #1E3A8A 100%)',
         background: 'linear-gradient(180deg, #F0F7FF 0%, #93C5FD 100%)',
            color: '#fff',
            borderRight: 'none',
            boxShadow: '2px 0 10px rgba(0,0,0,0.2)',
            [theme.breakpoints.up('md')]: { top: '69px' },

            // List item styling
            '& .MuiListItem-root': {
              padding: drawerOpen ? '12px 20px' : '12px 0',
              borderRadius: '8px',
              margin: '6px 8px',
              justifyContent: drawerOpen ? 'flex-start' : 'center',
              transition: 'all 0.2s ease-in-out',
              
            },

            '& .MuiListItem-root:hover': {
              // backgroundColor: '#00bfa6',
                color: 'black',
                backgroundColor: "#1D4ED8",
            },
            
        
// 
            // '& .Mui-selected': {            
            //   // backgroundColor: '#00bfa6',
            //   // color: '#ffffffff',  
            //    backgroundColor: '#3B82F6',
            //    color:'black'          
            // },

            '& .Mui-selected': {
            backgroundColor: '#3B82F6',
            color: 'black !important',
           '& .MuiListItemIcon-root': {
            color: 'black !important'
           },
          '& svg': {
           color: 'black !important',
           fill: 'black !important',
           strokeWidth: 2.5,      // << BOLD EFFECT
           transform: 'scale(1.1)',
  }
},


            // Icon size & alignment
            '& .MuiListItemIcon-root': {
              minWidth: drawerOpen ? '40px' : '0px',
              justifyContent: 'center',
              // color: 'inherit'
              color:'black'
            },

            // Text hide/show
            '& .MuiListItemText-root': {
              display: drawerOpen ? 'block' : 'none'
            }
          }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;


