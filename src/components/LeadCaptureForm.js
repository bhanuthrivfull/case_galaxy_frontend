import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

// Create custom theme
const newTheme = createTheme({
  palette: {
    mode: "light", // Light theme for a modern feel
    primary: {
      main: "#6200ea", // Purple primary color
    },
    background: {
      default: "#ffffff", // White background for the whole container
      paper: "#ffffff", // White background for the paper
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif", // Modern font
    h1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            color: "#6200ea", // Floating label color
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px", // Rounded corners for input fields
            "& fieldset": {
              borderColor: "#6200ea", // Border color
            },
            "&:hover fieldset": {
              borderColor: "#6200ea", // Border color on hover
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6200ea", // Focused border color
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "1rem",
          padding: "0.75rem 1.5rem",
          borderRadius: "12px", // Rounded button
          "&:hover": {
            backgroundColor: "#3700b3", // Darker purple on hover
          },
        },
      },
    },
  },
});

const LeadCaptureForm = () => {
  const { translations } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const titleStyles = {
    fontSize: {
      xs: "1.75rem",
      sm: "2rem",
      md: "2.5rem",
      lg: "3rem",
    },
    fontWeight: 500,
    textAlign: "center",
    marginBottom: "2rem",
    color: "#6200ea", // Purple text color for the title
  };

  // Validation patterns
  const patterns = {
    name: /^[A-Z][a-z]*(?:\s[a-zA-Z][a-zA-Z]*){0,49}$/,
    phone: /^(?!.*(\d)\1{6})[6-9]\d{9}$/,
  };



  const errorMessages = {
    name: {
      required:  "Name is required",
      pattern:
        "Name must start with a capital letter, contain only letters (no numbers or special characters), and allow only a single space between words."
    },
    phone: {
      required: "Phone number is required",
      pattern: 
        "Phone number must start with a digit between 6 and 9, contain exactly 10 digits, and not have 9 consecutive identical digits."
    }
  };


  const validateField = (name, value) => {
    if (!value) return errorMessages[name].required;
    if (patterns[name] && !patterns[name].test(value)) {
      return errorMessages[name].pattern;
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Set errors and touched fields
    setErrors(newErrors);
    setTouched({ name: true, phone: true });

    // Check if there are errors
    if (Object.keys(newErrors).length > 0) {
      return; // Stop form submission if there are errors
    }

    // Proceed with form submission if no errors
    setIsSubmitting(true);

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Something went wrong. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyles = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "#ffffff",
  };

  const paperStyles = {
    padding: "2.5rem",
    maxWidth: "480px",
    width: "100%",
    border: "1.5px solid #333",
    borderRadius: "20px",
    backgroundColor: "rgb(253, 253, 253)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)", // Light shadow for the card
  };

  return (
    <ThemeProvider theme={newTheme}>
      <Container maxWidth={false} disableGutters sx={containerStyles}>
        <Paper elevation={8} sx={paperStyles}>
          <Typography variant="h1" sx={titleStyles}>
            Get 15% Exclusive Offers on your first order
          </Typography>
          <AnimatePresence>
            {submitted ? (
              <Alert severity="success">{ "Congratulations! You got a 15% flat discount."}</Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap="1.5rem">
                  <TextField
                    label={ "Full Name"}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    fullWidth
                    InputProps={{
                      inputProps: { minLength: 3 }
                    }}
                  />
                  <TextField
                    label={ "Phone Number"}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur("phone")}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    fullWidth
                    InputProps={{
                      inputProps: { maxLength: 10 }
                    }}
                  />
                  {errors.submit && (
                    <Alert severity="error" sx={{ marginBottom: "1rem" }}>
                      {errors.submit}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: "12px", // Rounded button
                      padding: "1rem",
                      fontSize: "1rem",
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      <span>{ "Submit"}</span>
                    )}
                  </Button>
                </Box>
              </form>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default LeadCaptureForm;
