import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    // Check OTP expiration on component mount
    const storedTimestamp = localStorage.getItem("otpTimestamp");
    if (storedTimestamp && Date.now() - parseInt(storedTimestamp) > 5 * 60 * 1000) {
      localStorage.removeItem("resetOtp");
      localStorage.removeItem("otpTimestamp");
    }
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar({ open: false, message: "", severity: "success" });
    }, 2000);
  };

  const sendOtp = async () => {
    setErrors({});
    const storedTimestamp = localStorage.getItem("otpTimestamp");

    // Check if OTP is still valid (5 min)
    if (storedTimestamp && Date.now() - parseInt(storedTimestamp) < 5 * 60 * 1000) {
      showSnackbar("Already sent OTP (valid up to 5 min)");
      return;
    }

    try {
      const response = await axios.post("https://case-galaxy-backend-2ow1.onrender.com/api/auth/send-otp", { email });
      localStorage.setItem("resetOtp", response.data.otp);
      localStorage.setItem("otpTimestamp", Date.now().toString());
      showSnackbar("OTP sent successfully!");
    } catch (error) {
      setErrors((prev) => ({ ...prev, email: error.response?.data?.error || "Error sending OTP" }));
    }
  };

  const verifyOtp = () => {
    setErrors({});
    const storedOtp = localStorage.getItem("resetOtp");

    if (!storedOtp || otp !== storedOtp) {
      setErrors((prev) => ({ ...prev, otp: "Invalid OTP" }));
      return;
    }

    // OTP Verified: Remove stored OTP
    localStorage.removeItem("resetOtp");
    localStorage.removeItem("otpTimestamp");
    setOtpVerified(true);
    showSnackbar("OTP verified successfully!");
  };

  const changePassword = async () => {
    setErrors({});
    try {
      await axios.post("https://case-galaxy-backend-2ow1.onrender.com/api/auth/update-password", { email, newPassword });
      setPasswordChanged(true);
      showSnackbar("Password changed successfully!", "success");
      localStorage.removeItem("resetOtp");
      localStorage.removeItem("otpTimestamp");
      window.location.reload();
    } catch (error) {
      setErrors((prev) => ({ ...prev, newPassword: "Error changing password" }));
    }
  };


  useEffect(() => {
    const scriptId = "google-translate-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "text/javascript";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      const element = document.getElementById("google_translate_element");
      if (element && element.innerHTML.trim() === "") {
        const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';

        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,zh-TW,zh-HK",
            autoDisplay: false,
            defaultLanguage: savedLanguage,
          },
          "google_translate_element"
        );

        if (savedLanguage && savedLanguage !== 'en') {
          setTimeout(() => {
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement) {
              selectElement.value = savedLanguage;
              selectElement.dispatchEvent(new Event('change'));
            }
          }, 1000);
        }
      }
    };

    const handleLanguageChange = () => {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.addEventListener('change', (e) => {
          const selectedLanguage = e.target.value;
          localStorage.setItem('selectedLanguage', selectedLanguage);

          const previousLanguage = localStorage.getItem('previousLanguage');
          if (selectedLanguage !== previousLanguage) {
            localStorage.setItem('previousLanguage', selectedLanguage);
            window.location.reload();
          }
        });
      }
    };

    const checkForSelectElement = setInterval(() => {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        handleLanguageChange();
        clearInterval(checkForSelectElement);
      }
    }, 500);

    return () => {
      clearInterval(checkForSelectElement);
    };
  }, []);

  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (reload) {
      window.location.reload();
      setReload(false);
    }
  }, [reload]);

  const handleReloadClick = () => {
    setReload(true);
  };


  return (
    <Container maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Box className='d-flex position-absolute ' sx={{ top: '20px', right: '20px' }}>
        <div className='d-flex align-items-center gap-1'>
          {/* <h6 className='text-white'>Change Language</h6> */}
          <Tooltip title="Language" placement="bottom">
            <Box onClick={handleReloadClick} sx={{ cursor: 'pointer' }}>
              <Typography>🌐</Typography>
            </Box>
          </Tooltip>
          <Box>
            <div id="google_translate_element" />
            <style>
              {`
                      #google_translate_element select {
                        background-color: #f5f5f5;
                        border: 2px solid #007bff;
                        border-radius: 8px;
                        padding: 8px;
                        font-size: 14px;
                        color: #333;
                        outline: none;
                        transition: all 0.3s ease;
                      }
                      #google_translate_element select:hover {
                        border-color: #0056b3;
                      }
                      #google_translate_element select:focus {
                        border-color: #004085;
                        box-shadow: 0 0 8px rgba(0, 91, 187, 0.4);
                      }
                    `}
            </style>
          </Box>
        </div>
      </Box>
      <Box
        sx={{
          backgroundColor: "rgba(196, 243, 255, 0.7)",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          marginTop: "50px",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
          <IconButton onClick={() => window.history.back()} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" gutterBottom>
            {"Change Password"}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label={"Enter Registered Email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email}
        />
        <Button
          variant="outlined"
          sx={{
            color: "black",
            border: "2px solid rgba(255, 255, 255, 0.5)",
            backgroundColor: "transparent",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 8px rgba(255, 255, 255, 0.2)",
            mt: 1,
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderColor: "rgba(0, 0, 0, 0.8)",
              boxShadow: "0 6px 12px rgba(255, 255, 255, 0.4)",
              transform: "translateY(-2px)"
            },
            "&:active": {
              transform: "translateY(1px)"
            }
          }}
          onClick={sendOtp}
        >
          {"Send OTP"}
        </Button>
        <TextField
          fullWidth
          label={"Enter OTP"}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          margin="normal"
          variant="outlined"
          error={!!errors.otp}
          helperText={errors.otp}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: "#28a745", color: "white", mt: 1, "&:hover": { backgroundColor: "#218838" } }}
          onClick={verifyOtp}
        >
          {"Verify OTP"}
        </Button>

        {otpVerified && (
          <>
            <TextField
              fullWidth
              label={"New Password"}
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: "#dc3545", color: "white", mt: 1, "&:hover": { backgroundColor: "#c82333" } }}
              onClick={changePassword}
              disabled={!newPassword}
            >
              {"Change Password"}
            </Button>
          </>
        )}
        {passwordChanged && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => (window.location.href = "/")}>
              Go to Home
              {"Go to Home"}

            </Button>
          </Box>
        )}
      </Box>

      {/* Snackbar for Success Messages */}
      <Snackbar open={snackbar.open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;
