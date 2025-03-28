import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://case-galaxy-backend-2ow1.onrender.com/api";
function ProductShowcase({ category }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState({}); // Track loading state per product 

  const selectedLanguage = localStorage.getItem("selectedLanguage");
  const currencySymbol = selectedLanguage === 'en' ? '₹' : '¥';

  const [exchangeRates, setExchangeRates] = useState({});
  const [currency, setCurrency] = useState("INR");

  const getCurrencyFromLanguage = () => {
    const lang = localStorage.getItem("selectedLanguage");
    if (lang === "zh-TW") return "CNY";
    return "INR";
  };


  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/INR")
      .then(res => res.json())
      .then(data => setExchangeRates(data.rates))
      .catch(error => console.error("Error fetching exchange rates:", error));

    setCurrency(getCurrencyFromLanguage());
  }, []);




  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products`);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError("404 Error: Products not found. Please try again later.");
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };


  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();

    try {
      const userEmail = localStorage.getItem("userEmail"); // Get email from localStorage or auth system
      setLoadingProducts((prev) => ({
        ...prev,
        [product._id]: true,
      }));

      if (!userEmail) {
        toast.error("User not logged in!");
        return;
      }

      // Fetch userId using email
      const userResponse = await axios.get(
        `${API_BASE_URL}/users/getUserId/${userEmail}`
      );
      const userId = userResponse.data.userId;

      if (!userId) {
        toast.error("User ID not found!");
        return;
      }

      // Add to cart
      await axios.post(`${API_BASE_URL}/cart/add`, {
        userId,
        productId: product._id,
        quantity: 1,
      });

      toast.success(`${product.name} ${"added to cart!"}`, {
        position: "bottom-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      // Clear loading state for this specific product
      setLoadingProducts((prev) => ({
        ...prev,
        [product._id]: false,
      }));
    }
  };

  const getGridSize = () => {
    if (isMobile) return 12;
    if (isTablet) return 6;
    return 4;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }



  return (
    <Box
      id="productshowcase"
      sx={{
        py: 4,
        px: 2,
        maxWidth: "100%",
        margin: "0 auto",
        backgroundImage: 'linear-gradient(45deg,rgb(255, 255, 255),rgb(255, 255, 255))',
        boxShadow: 3,
      }}
    >
      <ToastContainer />
      <Typography
        variant="h3"
        component="h2"
        gutterBottom
        textAlign="center"
        sx={{ color: " rgb(0, 0, 0)", mb: 4, fontWeight: "bold" }}
      >
        {category} {"Products"}
      </Typography>

      <Grid container spacing={2} sx={{ display: "flex", justifyContent: "center" }}>
        {products.map((product, index) => {
          // Convert prices based on selected currency
          const convertedPrice = exchangeRates[currency]
            ? (product.price * exchangeRates[currency]).toFixed(2)
            : product.price.toFixed(2);

          const convertedDiscountPrice = exchangeRates[currency]
            ? (product.discountPrice * exchangeRates[currency]).toFixed(2)
            : product.discountPrice.toFixed(2);

          const convertedFinalPrice = (convertedPrice - convertedDiscountPrice).toFixed(2);

          return (
            <Grid item xs={12} sm={6} md={getGridSize()} key={product._id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  onClick={() => handleCardClick(product._id)}
                  sx={{
                    backgroundImage: 'linear-gradient(45deg,rgb(255, 255, 255),rgb(255, 255, 255))',
                    borderRadius: 3,
                    height: "450px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 4,
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: "100%",
                      height: 200,
                      objectFit: "contain",
                      backgroundColor: "white",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.03)",
                      },
                    }}
                    image={product.image}
                    alt={product.name}
                  />

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 2,
                      boxShadow: 4,
                      borderRadius: "12px",
                      backgroundColor: 'rgb(114, 245, 248)',
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{
                        color: "text.primary",
                        fontWeight: "bold",
                        mb: 1,
                        fontSize: { xs: "1rem", sm: "1.2rem" },
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: "500",
                          color: "#171616",
                          backgroundImage: "linear-gradient(to right, rgb(22, 21, 21), rgb(12, 12, 12))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparentAdmin Panel",
                          padding: "0.2em 0.4em",
                          borderRadius: "4px",
                        }}
                      >
                        {product.model}
                      </span>
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: { sm: "space-between" },
                        alignItems: "center",
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="rgb(0, 0, 0)"
                        sx={{
                          fontWeight: "bold",
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                        }}
                      >
                        {currencySymbol}
                        {convertedFinalPrice}
                      </Typography>

                      {product.discountPrice > 0 && (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{
                            fontWeight: "bold",
                            textDecoration: "line-through",
                            mx: { xs: 0, sm: 1 },
                            mt: { xs: 0.5, sm: 0 },
                            fontSize: { xs: "1.2rem", sm: "1.3rem" },
                          }}
                        >
                          {currencySymbol}{convertedPrice}
                        </Typography>
                      )}

                      {product.discountPrice > 0 && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0,
                            color: "#333",
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.8rem",
                              lg: "0.9rem",
                            },
                          }}
                        >
                          <span>Save</span> {currencySymbol}
                          {convertedDiscountPrice}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      variant="contained"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={!product.inStock || loadingProducts[product._id]}
                      sx={{
                        mt: 2,
                        color: "black",
                        fontSize: { xs: "0.5rem", sm: "1rem" },
                        py: { xs: 1, sm: 1.5 },
                        width: { xs: "100%", sm: "auto" },
                        backgroundColor: "rgb(244, 241, 78)",
                        boxShadow: 3,
                        "&:hover": {
                          bgcolor: "",
                        },
                        "&.Mui-disabled": {
                          color: "rgb(0, 0, 0) !important",
                          backgroundColor: "rgba(255, 255, 255, 0.46) !important",
                          boxShadow: "none !important",
                        },
                      }}
                    >
                      {loadingProducts[product._id] ? (
                        <>
                          <CircularProgress
                            size={24}
                            sx={{
                              position: "absolute",
                              left: "50%",
                              marginLeft: "-12px",
                              color: "white",
                            }}
                          />
                          <span style={{ opacity: 0 }}>{"ADD TO CART"}</span>
                        </>
                      ) : (
                        <span>
                          {"ADD TO CART"}
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

    </Box>
  );
}

export default ProductShowcase;