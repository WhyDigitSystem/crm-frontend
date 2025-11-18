import { Link } from 'react-router-dom';
import {
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import LogoImage from '../../../../assets/images/BIN_BEE.png';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthWrapper1 from '../AuthWrapper1';
import AuthLogin from '../auth-forms/AuthLogin';

const bevanRegularStyle = {
  fontFamily: "'Bevan', serif",
  fontWeight: 300,
  fontStyle: 'normal',
  fontSize: 25,
  color: '#673ab7',
};

const Login = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AuthWrapper1>
      <style>{`
        .login-background {
          // background: linear-gradient(to right, #3f51b5, #9c27b0);
          // background: linear-gradient(to right, #e0eafc, #cfdef3);
           background: linear-gradient(to right, #2980b9, #6dd5fa, #ffffff);
          overflow: hidden;
        }
        .bubble-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .bubble {
          position: absolute;
          bottom: -100px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          animation: rise 20s infinite ease-in;
        }
        @keyframes rise {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-110vh) scale(1.5);
            opacity: 0;
          }
        }
        .bubble-1 { left: 10%; width: 20px; height: 20px; animation-duration: 12s; }
        .bubble-2 { left: 20%; width: 25px; height: 25px; animation-duration: 15s; }
        .bubble-3 { left: 30%; width: 10px; height: 10px; animation-duration: 10s; }
        .bubble-4 { left: 40%; width: 18px; height: 18px; animation-duration: 14s; }
        .bubble-5 { left: 50%; width: 22px; height: 22px; animation-duration: 13s; }
        .bubble-6 { left: 60%; width: 16px; height: 16px; animation-duration: 11s; }
        .bubble-7 { left: 70%; width: 30px; height: 30px; animation-duration: 17s; }
        .bubble-8 { left: 80%; width: 14px; height: 14px; animation-duration: 16s; }
        .bubble-9 { left: 90%; width: 19px; height: 19px; animation-duration: 18s; }
        .bubble-10 { left: 95%; width: 24px; height: 24px; animation-duration: 20s; }
        .css-1q8wryf-MuiInputBase-input-MuiInput-input {
          color: #fff !important;
        }
      `}</style>

      <Box
        className="login-background"
        sx={{
          position: 'relative',
          minHeight: '100vh',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: matchDownSM ? 1 : 2,
        }}
      >
        {/* Bubble Container */}
        <Box className="bubble-container">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`bubble bubble-${i + 1}`} />
          ))}
        </Box>

        {/* Login Card with glassmorphism and transform color effect */}
        <AuthCardWrapper
          className="glass-card"
          sx={{
            zIndex: 1,
            width: '100%',
            maxWidth: 430,
            px: matchDownSM ? 0 : 0,
            py: matchDownSM ? 0: 0,
            // background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            '&:hover': {
              // background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
              transform: 'scale(1.02)',
              // boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)"
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), 0 15px 35px rgba(0, 0, 0, 0.25)'
            },
          }}
        >
          <Grid container direction="column" spacing={2} alignItems="center">
            <Grid item sx={{ mb: matchDownSM ? 1 : 2 }}>
              <Link to="#">
                <img
                  src={LogoImage}
                  alt="logo"
                  style={{
                    width: matchDownSM ? '120px' : '150px',
                    height: 'auto',
                  }}
                />
              </Link>
            </Grid>

            <Typography
              style={{
                ...bevanRegularStyle,
                fontSize: matchDownSM ? 20 : 25,
                // color: '#4286f4',
                // fontSize: matchDownSM ? 20 : 25,
               background: "linear-gradient(to right, #232526, #414345)", 
               WebkitBackgroundClip: "text",
               WebkitTextFillColor: "transparent",
              }}
              // gutterBottom
              variant={matchDownSM ? 'h6' : 'h4'}
            >
              CRM
            </Typography>

            <Grid item xs={12}>
              <AuthLogin />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ display: 'none' }} />
            </Grid>

            <Stack direction="row" justifyContent="center">
              <Chip
                label="© 2025 Why Digit System Private Limited."
                disabled
                size="small"
                sx={{
                  cursor: 'pointer',
                  color: 'black',
                  backgroundColor: 'transparent',
                  border: '1px solid black',
                  '& .MuiChip-label': {
                    color: 'black',
                    fontSize: matchDownSM ? '0.65rem' : '0.75rem',
                  },
                  opacity: 0,
                }}
              />
            </Stack>
          </Grid>
        </AuthCardWrapper>
      </Box>
    </AuthWrapper1>
  );
};

export default Login;
