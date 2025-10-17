import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

// material-ui
import { ButtonBase, Box, Typography } from "@mui/material";

// project imports
import { MENU_OPEN } from "store/actions";
import LogoImage from "../../../../src/assets/images/BIN_BEE.png";

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
  const defaultId = useSelector((state) => state.customization.defaultId);
  const dispatch = useDispatch();

  return (
    <ButtonBase
      disableRipple
      onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })}
      component={Link}
      sx={{
        display: "flex",
        flexDirection: "column", // Stack items vertically
        alignItems: "center", // Center items horizontally
        textDecoration: "none", // Remove default link styles
      }}
    >
      <img
        src={LogoImage}
        alt="logo"
        style={{
          width: "100px",
          // height: "50px",
        }}
      />


    </ButtonBase>
  );
};

export default LogoSection;
