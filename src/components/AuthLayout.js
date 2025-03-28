import React, { useEffect } from 'react';
import { Box, Container, Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip

const AuthLayout = ({ children }) => {
  useEffect(() => {
    const scriptId = "google-translate-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      const element = document.getElementById("google_translate_element");
      if (element && element.innerHTML.trim() === "") {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,zh-TW,zh-HK",
            // Set the previously selected language if it exists
            defaultLanguage: localStorage.getItem('selectedLanguage') || 'en'
          },
          "google_translate_element"
        );

        // Add event listener to detect language change
        const selectElement = element.querySelector('select');
        if (selectElement) {
          selectElement.addEventListener('change', (e) => {
            const selectedLanguage = e.target.value;
            localStorage.setItem('selectedLanguage', selectedLanguage);
          });
        }
      }
    };
  }, []);
  const [reload, setReload] = React.useState(false);

  // useEffect to handle page reload
  useEffect(() => {
    if (reload) {
      window.location.reload();
      setReload(false);
    }
  }, [reload]);

  // Handle click to trigger reload
  const handleReloadClick = () => {
    setReload(true);
  };
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: "url('/assets/login_bg.jpg')",
        backgroundRepeat: 'no-repeat',  // Prevents the background from repeating
        backgroundSize: 'cover',       // Ensures the image covers the area
        padding: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Box
      sx={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        display: 'flex',           // Align children side by side
        gap: '10px',              // Space between the two boxes
        alignItems: 'center',     // Vertically center the items
        zIndex: 1000,
      }}
    >
      {/* First Box with Globe Icon */}
      <Tooltip title="Language" placement="bottom">
      <Box
        onClick={handleReloadClick}
        sx={{
          cursor: 'pointer',
        }}
      >
        <Typography>🌐</Typography>
      </Box>
      </Tooltip>

      {/* Second Box with Google Translate */}
      <Box
        id="google_translate_element"
        sx={{
          '& select': {
            backgroundColor: '#f5f5f5',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '14px',
            color: '#333',
            outline: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#0056b3',
            },
            '&:focus': {
              borderColor: '#004085',
              boxShadow: '0 0 8px rgba(0, 91, 187, 0.4)',
            },
          },
        }}
      />
</Box>

      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: "rgba(209, 209, 209, 0.8)",
            borderRadius: '20px',          // Adjust the value to your preferred border radius
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
