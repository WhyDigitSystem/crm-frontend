import PropTypes from 'prop-types';
import { Avatar, Box, Chip, ButtonBase } from '@mui/material';
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
import { IconMenu2 } from '@tabler/icons-react';

const Header = ({ handleLeftDrawerToggle }) => {
  const [logo, setLogo] = useState(null);
  const [orgId] = useState(localStorage.getItem('orgId'));
  const theme = useTheme();

  useEffect(() => {
    getCompanyDetails();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setLogo(file);
    } else {
      showToast('error', 'Please upload a valid image (PNG or JPEG).');
    }
  };

  const getCompanyDetails = async () => {
    try {
      const response = await apiCalls('get', `commonmaster/company/${orgId}`);
      if (response.status) setLogo(response.paramObjectsMap.companyVO);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '5px 20px',
        // background: 'linear-gradient(90deg, #0f172a, #1e293b)',
        background: 'linear-gradient(to right, #F0F7FF, #1E3A8A)',
        // background: 'linear-gradient(to right, #FFFDF8, #3E2723)',
        // background: 'linear-gradient(to right, #F8FAFC, #1E293B)',
        // borderBottom: '1px solid #374151',
        color: '#fff',
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 65 }}>
        <LogoSection />
      </Box>
      {/* <ButtonBase sx={{ borderRadius: '12px'}}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            // background: theme.palette.secondary.light,
            backgroundColor:'#3B82F6',
            // color: theme.palette.secondary.dark,
            color:'white',
            '&:hover': {
              // background: theme.palette.secondary.dark,
              backgroundColor:"#1D4ED8",
              color: theme.palette.secondary.light
             
            }
          }}
          onClick={handleLeftDrawerToggle}
          color="inherit"
        >
          <IconMenu2 stroke={1.5} size="1.3rem" />
        </Avatar>
      </ButtonBase> */}
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
        backgroundColor: "#1D4ED8",
      },

      // rotate the icon on hover
      '&:hover .menu-icon': {
        transform: 'rotate(360deg)',
      }
    }}
    onClick={handleLeftDrawerToggle}
  >
    <IconMenu2
      className="menu-icon"
      stroke={1.5}
      size="1.3rem"
      style={{
        transition: 'transform 0.3s ease'
      }}
    />
  </Avatar>
</ButtonBase>

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <SearchSection />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* <Avatar
          sx={{
            fontSize: '16px',
            width: 60,
            height: 60,
            // backgroundColor: 'transparent'
            backgroundColor: 'white',
            margin:'2px',
          }}
        >
          {logo && logo[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: '120%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
            />
          ) : (
            'Upload Logo'
          )}
        </Avatar> */}
        <Avatar
     sx={{
    fontSize: '16px',
    width: 60,
    height: 60,
    // backgroundColor: 'white',
       backgroundColor: 'transparent', 
    margin: '2px',
    overflow: 'hidden',
    // border: '3px solid #6366F1', 
    // Hover: rotate image
    '&:hover .rotate-img': {
      transform: 'rotate(360deg)',
    }
  }}
>
  {logo && logo[0]?.companyLogo ? (
    <img
      src={`data:image/png;base64,${logo[0].companyLogo}`}
      alt="Company Logo"
      className="rotate-img"
      style={{
        width: '120%',
        height: '100%',
        objectFit: 'contain',
        // borderRadius: '50%',
     
        transition: 'transform 0.8s ease',   // smooth rotation
      }}
    />
  ) : (
    'Upload Logo'
  )}
</Avatar>


        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
          <Box sx={{ fontWeight: 700, fontSize: 13, color: '#fff', wordSpacing: '2px' }}>{localStorage.getItem('companyName')}</Box>
          <Chip
            label={`${localStorage.getItem('finYear')} | ${localStorage.getItem('branch')}`}
            size="small"
            sx={{
              fontSize: 11,
              height: 22,
              // backgroundColor: '#00bfa6',
              // color: '#fff'
              backgroundColor:'white',
              color:'black',
              fontWeight: 'bold',
              border: '3px solid #6366F1',  
            }}
          />
        </Box>

        <NotificationSection />
        <GlobalSection />
        <MenuBar />
        <ProfileSection />
      </Box>
    </Box>
  );
};

Header.propTypes = { handleLeftDrawerToggle: PropTypes.func };
export default Header;
