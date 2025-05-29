import { Link } from 'react-router-dom';

// material-ui
import { Chip, Divider, Grid, Stack, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project imports
import LogoImage from '../../../../assets/images/BIN_BEE.png';
import AuthCardWrapper from '../AuthCardWrapper';
import AuthWrapper1 from '../AuthWrapper1';
import AuthLogin from '../auth-forms/AuthLogin';

// assets

// ================================|| AUTH3 - LOGIN ||================================ //

const bevanRegularStyle = {
  fontFamily: "'Bevan', serif",
  fontWeight: 300,
  fontStyle: 'normal',
  fontSize: 35,
  color: '#673ab7'
};

const Login = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AuthWrapper1>
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
            <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                  <Grid item>
                    <Link to="#">
                      {/* <Logo /> */}
                      <img
                        src={LogoImage}
                        alt="logo"
                        style={{
                          width: '150px',
                          height: 'auto'
                        }}
                      ></img>
                    </Link>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container direction={matchDownSM ? 'column-reverse' : 'row'} alignItems="center" justifyContent="center">
                      <Grid item>
                        <Stack alignItems="center" justifyContent="center" spacing={1}>
                          {/* <div style={bevanRegularStyle} className="my-2 mt-3">
                            Finance
                          </div> */}
                          <div style={bevanRegularStyle} className="my-2 mt-3">
                            EFIT-SaaS
                          </div>
                          <Stack alignItems="center" justifyContent="center" spacing={1}>
                            <Typography color={theme.palette.secondary.main} gutterBottom variant={matchDownSM ? 'h5' : 'h4'}>
                              Hi, Welcome Back
                            </Typography>
                            <Typography variant="caption" fontSize="14px" textAlign={matchDownSM ? 'center' : 'inherit'}>
                              Enter your credentials to continue
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <AuthLogin />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid item container direction="column" alignItems="center" xs={12}>
                      <Typography component={Link} to="/pages/register/register3" variant="subtitle1" sx={{ textDecoration: 'none' }}>
                        Don&apos;t have an account?
                      </Typography>
                    </Grid>
                  </Grid>
                  <Stack direction="row" justifyContent="center" sx={{ mb: 1, mt: 1 }}>
                    <Chip label={process.env.REACT_APP_VERSION} disabled chipcolor="secondary" size="small" sx={{ cursor: 'pointer' }} />
                  </Stack>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid item xs={12} sx={{ m: 1 }}>
          <AuthFooter />
        </Grid> */}
      </Grid>
    </AuthWrapper1>
  );
};

export default Login;
