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
        background: 'linear-gradient(90deg, #0f172a, #1e293b)',
        borderBottom: '1px solid #374151',
        color: '#fff',
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 65 }}>
        <LogoSection />
      </Box>
      <ButtonBase sx={{ borderRadius: '12px', overflow: 'hidden' }}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            background: theme.palette.secondary.light,
            color: theme.palette.secondary.dark,
            '&:hover': {
              background: theme.palette.secondary.dark,
              color: theme.palette.secondary.light
            }
          }}
          onClick={handleLeftDrawerToggle}
          color="inherit"
        >
          <IconMenu2 stroke={1.5} size="1.3rem" />
        </Avatar>
      </ButtonBase>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
        <SearchSection />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          sx={{
            fontSize: '16px',
            width: 60,
            height: 60,
            backgroundColor: 'transparent'
          }}
        >
          {logo && logo[0]?.companyLogo ? (
            <img
              src={`data:image/png;base64,${logo[0].companyLogo}`}
              alt="Company Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
            />
          ) : (
            'Upload Logo'
          )}
        </Avatar>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
          <Box sx={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{localStorage.getItem('companyName')}</Box>
          <Chip
            label={`${localStorage.getItem('finYear')} | ${localStorage.getItem('branch')}`}
            size="small"
            sx={{
              fontSize: 11,
              height: 22,
              backgroundColor: '#00bfa6',
              color: '#fff'
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
