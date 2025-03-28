import {
  Add as AddIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

const API_BASE_URL = "https://case-galaxy-backend-2ow1.onrender.com/api";

const ProductManagement = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const selectedLanguage = localStorage.getItem("selectedLanguage");
  const currencySymbol = selectedLanguage === 'en' ? '₹' : '¥';




  const [formData, setFormData] = useState({
    name: "",
    model: "",
    image: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    inStock: true,
    rating: 4.5,
    reviews: 0,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    model: "",
    price: "",
    discountPrice: "",
    category: "",
    description: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      image: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      inStock: true,
      rating: 4.5,
      reviews: 0,
    });
    setFormErrors({
      name: "",
      model: "",
      price: "",
      discountPrice: "",
      category: "",
      description: "",
      image: "",
    });
  };

  // Updated validateField: accepts an updatedData object for up-to-date comparisons
  const validateField = (name, value, updatedData = formData) => {
    let errorMessage = "";

    switch (name) {
      case "name":
        if (!value) {
          errorMessage =  "Product name is required.";
        } else if (value.length > 35) {
          errorMessage = "Product name must not exceed 30 characters.";
        } else if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(value)) {
          errorMessage =
            "Product name should start with a letter, contain only alphabets, and allow only a single space between words.";
        } else if (value.length < 3) {
          errorMessage = "Product name must be at least 3 characters long.";
        }
        break;

      case "model":
        if (!value) {
          errorMessage =  "Brand and model is required.";
        } else if (value.length > 30) {
          errorMessage = "Model must not exceed 30 characters.";
        } else if (!/^[A-Za-z][A-Za-z0-9]*(?:\s[A-Za-z0-9]+)*$/.test(value)) {
          errorMessage =
            "Model should start with a letter and contain only alphabets, numbers, and a single space between words.";
        } else if (value.length < 3) {
          errorMessage = "Model must be at least 3 characters long.";
        }
        break;

      case "price":
        if (!value) {
          errorMessage = "Price is required.";
        } else if (Number(value) < 2) {
          errorMessage =
           "Price must be greater than 2.";
        } else if (Number(value) > 10000) {
          errorMessage =
            "Price must be less than 10,000.";
        }
        // When price changes, revalidate discountPrice with the updated data
        if (updatedData.discountPrice) {
          if (Number(updatedData.discountPrice) >= Number(value)) {
            setFormErrors((prev) => ({
              ...prev,
              discountPrice:
              
                "Discount price should be less than regular price.",
            }));
          } else {
            setFormErrors((prev) => ({
              ...prev,
              discountPrice: "",
            }));
          }
        }
        break;

      case "discountPrice":
        if (!value) {
          errorMessage =
             "Discount price is required.";
        } else if (Number(value) >= Number(updatedData.price)) {
          errorMessage =
     
            "Discount price should be less than regular price.";
        } else if (Number(value) < 1) {
          errorMessage =
         "Discount price must be greater than 0.";
        }
        break;

      case "category":
        if (!value) {
          errorMessage =
            "Category is required.";
        }
        break;

      case "description":
        if (!value) {
          errorMessage =
           "Description is required.";
        } else if (!/[A-Za-z]/.test(value)) {
          errorMessage = "Description must contain at least one letter and should not start with an empty space.";
        } else if (!/^[^\s]+(?:\s[^\s]+)*$/.test(value)) {
          errorMessage = "Description should contain only a single space between words.";
        } else if (value.length < 10) {
          errorMessage = "Description must be at least 10 characters long.";
        } else if (value.length > 300) {
          errorMessage = "Description cannot exceed 300 characters.";
        }
        break;

      case "image":
        if (!value) {
          errorMessage =  "Image URL is required.";
        } else if (!/^(https?:\/\/[^\s]+\.[^\s]+)$/i.test(value)) {
          errorMessage =
            "Please enter a valid image URL (must start with http:// or https:// and have a valid domain).";
        }
        break;

      default:
        break;
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Create an updated version of formData for immediate validation comparisons
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // Validate the changed field using updated data
    validateField(name, value, updatedData);

    // If price changes, revalidate discountPrice to update its error message if needed
    if (name === "price" && updatedData.discountPrice) {
      validateField("discountPrice", updatedData.discountPrice, updatedData);
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleStockToggle = (e) => {
    setFormData((prev) => ({
      ...prev,
      inStock: e.target.checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate all fields before submitting
    Object.keys(formData).forEach((field) => {
      validateField(field, formData[field]);
    });

    // Check if there are any errors
    if (Object.values(formErrors).some((error) => error)) {
      setSnackbar({
        open: true,
        message:
          "Please fix the errors in the form.",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/add-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: [formData],
          language: e.target.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      setSnackbar({
        open: true,
        message: "Product added successfully!",
        severity: "success",
      });
      resetForm();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };


  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          background: "linear-gradient(135deg,rgba(178, 185, 158, 0.07),rgb(95, 246, 105))",
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              color: theme.palette.primary.main,
            }}
          >
            {"Product Management"}
          </Typography>
        </Box>
        <form id="en" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                {"Basic Information"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleInputBlur} // Added onBlur
                required
                size={isMobile ? "small" : "medium"}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand & Model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                onBlur={handleInputBlur} // Added onBlur
                required
                size={isMobile ? "small" : "medium"}
                error={!!formErrors.model}
                helperText={formErrors.model}
              />
            </Grid>

            {/* Pricing Section */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                onBlur={handleInputBlur} // Added onBlur
                required
                error={!!formErrors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currencySymbol}</InputAdornment>
                  ),
                }}
                size={isMobile ? "small" : "medium"}
                inputProps={{
                  min: 2,
                  max: 10000,
                }}
                helperText={formErrors.price}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Discount Price"
                name="discountPrice"
                type="number"
                value={formData.discountPrice}
                onChange={handleInputChange}
                onBlur={handleInputBlur} // Ensure onBlur is added
                error={!!formErrors.discountPrice}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currencySymbol}</InputAdornment>
                  ),
                }}
                size={isMobile ? "small" : "medium"}
                inputProps={{
                  min: 1,
                  max: 10000,
                }}
                helperText={formErrors.discountPrice}
              />
            </Grid>

            {/* Add this after the price fields to show validation messages */}
            {/* <Grid item xs={12}>
                {formErrors.price && (
                  <Typography color="error" variant="caption">
                    {formErrors.price}
                  </Typography>
                )}
              </Grid> */}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
                <InputLabel
                  sx={{
                    color: "#000",
                    backgroundColor: formData.category ? "#fff" : "transparent",
                    textDecoration: "none",
                    padding: "0 4px",
                    "&.Mui-focused": {
                      color: "#6C63FF",
                      backgroundColor: "#fff",
                    },
                  }}
                >
                  Category
                </InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur} // Added onBlur
                  displayEmpty
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "1px solid #ccc",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      border: "1px solid #999",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "2px solidrgb(141, 230, 162)",
                    },
                    backgroundColor: "rgba(178, 242, 182, 0.79)",
                  }}
                  error={!!formErrors.category}
                >
                  <MenuItem value="Mobile">📱 Mobile</MenuItem>
                  <MenuItem value="Tablet">📟 Tablet</MenuItem>

                  <MenuItem
                    value="Laptop"
                    disabled
                    sx={{ textDecoration: "line-through", color: "gray" }}
                  >
                    💻 Laptop (Out of Stock)
                  </MenuItem>
                  <MenuItem
                    value="Smartwatch"
                    disabled
                    sx={{ textDecoration: "line-through", color: "gray" }}
                  >
                    ⌚ Smartwatch (Coming Soon)
                  </MenuItem>
                </Select>
                {formErrors.category && (
                  <Typography color="error" variant="caption">
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                onBlur={handleInputBlur} // Added onBlur
                required
                InputProps={{
                  endAdornment: formData.image && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment>,
                }}
                size={isMobile ? "small" : "medium"}
                error={!!formErrors.image}
                helperText={formErrors.image}
              />
            </Grid>

            {/* Description Section */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleInputBlur} // Added onBlur
                required
                multiline
                rows={4}
                size={isMobile ? "small" : "medium"}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>

            {/* Stock Status Section */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch checked={formData.inStock} onChange={handleStockToggle} color="primary" />
                }
                label="In Stock"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  disabled={loading}
                  fullWidth={isMobile}
                  sx={{ minWidth: { sm: "120px" } }}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  fullWidth={isMobile}
                  sx={{ minWidth: { sm: "120px" } }}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {loading ? "Adding..." : "Add Product"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductManagement;



