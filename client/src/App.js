import React from "react";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Paper, Box, Typography, TextField, InputAdornment, Button, IconButton, CircularProgress } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

import "./style.scss";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

function App() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [state, setState] = React.useState({});

  async function handleNameSubmit(event) {
    setState({ ...state, checkingName: true });
    await fetch("http://localhost:3000/checkName", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors",
      body: JSON.stringify({ username: state.twitterHandle }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.errors) {
          console.error(json.errors[0]);
          setState({ ...state, checkingName: false, validTwitterHandle: false });
        } else if (json.data.username === state.twitterHandle) {
          setState({ ...state, checkingName: false, validTwitterHandle: true, usernameId: json.data.id });
        }
      })
      .catch((err) => {
        console.log(err);
        setState({ ...state, checkingName: false, validTwitterHandle: false });
      });
  }

  return (
    <CssBaseline>
      <Paper
        elevation={12}
        sx={{
          position: "relative",
          maxWidth: 1024,
          mx: "auto",
          mt: 4,
          mb: 32,
          p: 5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: 7,
        }}>
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Typography variant="h2" gutterBottom>
          <b>Welcome!</b>
        </Typography>
        <Typography sx={{ mb: 2 }} variant="h5" gutterBottom>
          Enter the twitter handle of the account whose following list you want to copy.
        </Typography>
        <TextField
          onChange={(event) => setState({ ...state, twitterHandle: event.target.value })}
          name="sourceHandle"
          type="email"
          placeholder="TedTalks"
          label="Twitter Handle"
          InputProps={{
            startAdornment: <InputAdornment position="start">@</InputAdornment>,
            ...(state.checkingName
              ? {
                  endAdornment: (
                    <InputAdornment position="end">
                      <CircularProgress size={32} thickness={5} />
                    </InputAdornment>
                  ),
                }
              : {
                  endAdornment: (
                    <InputAdornment position="end">
                      {typeof state.validTwitterHandle !== "undefined" ? state.validTwitterHandle ? <CheckCircleOutlinedIcon color="success" /> : <CheckCircleOutlinedIcon color="error" /> : null}
                    </InputAdornment>
                  ),
                }),
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={handleNameSubmit}
            variant="contained"
            sx={{
              maxWidth: 100,
              width: "100%",
              mt: 1, // margin top
            }}>
            NEXT
          </Button>
        </Box>
      </Paper>
    </CssBaseline>
  );
}

export default function ToggleColorMode() {
  const [mode, setMode] = React.useState("light");
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        ...(mode === "dark"
          ? {
              components: {
                MuiPaper: {
                  styleOverrides: {
                    root: {
                      background: "#16181c",
                    },
                  },
                },
              },
            }
          : {}),
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: {
                  default: "#1da1f2",
                },
              }
            : {
                background: {
                  default: "#000",
                },
              }),
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
