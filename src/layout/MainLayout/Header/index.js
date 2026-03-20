import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Chip,
  ButtonBase,
  Typography,
  Button,
  Modal,
  IconButton,
  Fade,
  Backdrop
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import LogoSection from '../LogoSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import SearchSection from './SearchSection';
import GlobalSection from './GlobalSection';
import MenuBar from './GlobalSection/MenuBar';
import { showToast } from 'utils/toast-component';
import apiCalls from 'apicall';
import { IconMenu2, IconX } from '@tabler/icons-react';

const Header = ({ handleLeftDrawerToggle }) => {
  const [logo, setLogo] = useState(null);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const [openLogoFullscreen, setOpenLogoFullscreen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    getCompanyDetails();
  }, []);

  const handleOpenFullscreen = () => setOpenLogoFullscreen(true);
  const handleCloseFullscreen = () => setOpenLogoFullscreen(false);

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      if (response.status) {
        setLogo(response.paramObjectsMap.companyVO);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '5px 20px',
          background: 'linear-gradient(to right, #F0F7FF, #1E3A8A)',
          color: '#fff',
          gap: 2
        }}
      >
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 65 }}>
          <LogoSection />
        </Box>

        {/* Menu Button */}
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              backgroundColor: '#3B82F6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1D4ED8'
              },
              '&:hover .menu-icon': {
                transform: 'rotate(360deg)'
              }
            }}
            onClick={handleLeftDrawerToggle}
          >
            <IconMenu2
              className="menu-icon"
              stroke={1.5}
              size="1.3rem"
              style={{ transition: 'transform 0.3s ease' }}
            />
          </Avatar>
        </ButtonBase>

        {/* Search */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <SearchSection />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Company Logo Avatar */}
          <Avatar
            onClick={handleOpenFullscreen}
            sx={{
              width: 60,
              height: 60,
              backgroundColor: 'transparent',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
          >
            {logo && logo[0]?.companyLogo ? (
              <img
                src={`data:image/png;base64,${logo[0].companyLogo}`}
                alt="Company Logo"
                style={{
                  width: '120%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              'Logo'
            )}
          </Avatar>

          {/* Company Info */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
            <Box sx={{ fontWeight: 700, fontSize: 13 }}>
              {localStorage.getItem('companyName')}
            </Box>
            <Chip
              label={`${localStorage.getItem('finYear')} | ${localStorage.getItem('branch')}`}
              size="small"
              sx={{
                fontSize: 11,
                height: 22,
                backgroundColor: 'white',
                color: 'black',
                fontWeight: 'bold',
                border: '3px solid #6366F1'
              }}
            />
          </Box>

          <NotificationSection />
          <GlobalSection />
          <MenuBar />
          <ProfileSection />
        </Box>
      </Box>

      {/* Fullscreen Modal with Blur Background */}
      <Modal
        open={openLogoFullscreen}
        onClose={handleCloseFullscreen}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)'
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={openLogoFullscreen}>
          <Box
            sx={{
              position: 'relative',
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={handleCloseFullscreen}
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
                zIndex: 1,
                backdropFilter: 'blur(4px)'
              }}
            >
              <IconX size={24} />
            </IconButton>

            {/* Logo Image */}
            {logo && logo[0]?.companyLogo ? (
              <img
                src={`data:image/png;base64,${logo[0].companyLogo}`}
                alt="Company Logo"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  borderRadius: '8px'
                }}
              />
            ) : (
              <Typography variant="h4" sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                No Logo Available
              </Typography>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

Header.propTypes = { handleLeftDrawerToggle: PropTypes.func };

export default Header;