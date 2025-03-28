import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
  Paper,
  IconButton,
  Dialog,
} from "@mui/material";
import { DeleteOutline, ShoppingCart, Add, Remove } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MultiStepCheckoutForm from "./MultiStepCheckoutForm.js";
import Header from "./Header.js";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "https://case-galaxy-backend-2ow1.onrender.com/api";

function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail");
  const [userId, setUserId] = useState(null);
  const [language, setLanguage] = useState(localStorage.getItem("selectedLanguage") || 'en');
  const currencySymbol = language === 'en' ? '₹' : '¥';


  
  // Price Converter
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

  const convertPrice = (price) => {
    const rate = exchangeRates[currency] || 1;
    return (price * rate).toFixed(2);
  };




  useEffect(() => {
    const checkLanguageChange = setInterval(() => {
      const currentLanguage = localStorage.getItem("selectedLanguage") || 'en';
      if (currentLanguage !== language) {
        setLanguage(currentLanguage);
      }
    }, 500);

    return () => clearInterval(checkLanguageChange);
  }, [language]);

  useEffect(() => {
    if (!userEmail) {
      toast.error( "User not logged in!" );
      navigate("/login");
      return;
    }
    fetchUserId();
  }, [userEmail, navigate, language]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/getUserId/${userEmail}`);
      setUserId(response.data.userId);
    } catch (err) {
      toast.error("Failed to fetch user ID." );
      console.error("Error fetching user ID:", err);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      const cartData = response.data || { items: [] };
      const validItems = (cartData.items || []).filter(item => item?.productId);
      setCart({ ...cartData, items: validItems });
    } catch (err) {
      toast.error("Failed to load cart." );
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!productId) return;
    try {
      await axios.delete(`${API_BASE_URL}/cart/${userId}/item/${productId}`);
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item?.productId?._id !== productId)
      }));
      toast.success( "Item removed from cart!" );
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error("Failed to remove item.");
      console.error("Error removing item:", err);
    }
  };

  const updateQuantity = async (productId, change) => {
    if (!productId) return;
    const item = cart.items.find(item => item?.productId?._id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);

    try {
      await axios.patch(`${API_BASE_URL}/cart/${userId}/item/${productId}`, {
        quantity: newQuantity
      });

      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item => 
          item?.productId?._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      }));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error("Failed to update quantity." );
      console.error("Error updating quantity:", err);
    }
  };

  const getTotalPrice = () => {
    if (!cart.items || cart.items.length === 0) return "0.00";
    return cart.items.reduce((total, item) => {
      if (!item?.productId?.price) return total;
      const price = item.productId.price || 0;
      const discount = item.productId.discountPrice || 0;
      return total + ((price - discount) * (item.quantity || 1));
    }, 0).toFixed(2);
  };

  const handleProceedToBuy = () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty!" );
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Header />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)',
        py: 4
      }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4, md: 5 },
            mt: { xs: 8, sm: 12, md: 15 },
            background: "linear-gradient(45deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)",
            width: "85%",
            display: "flex",
            flexDirection: "column",
            marginBottom: "30px",
            gap: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: "primary.main",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            { "Your Cart" }
          </Typography>
          
          {loading ? (
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
              { "Loading your cart..." }
            </Typography>
          ) : cart.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
                {"Your cart is empty" }
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3 }}
                onClick={() => navigate('/')}
              >
                { "Continue Shopping" }
              </Button>
            </Box>
          ) : (
            <Box>
            <List>
              {cart.items.map(
                (item) =>
                  item?.productId && (
                    <React.Fragment key={item.productId._id}>
                      <ListItem
                        sx={{
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: "center",
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={item.productId.model || "Product"}
                            src={item.productId.image}
                            variant="square"
                            sx={{
                              width: { xs: 60, sm: 80 },
                              height: { xs: 60, sm: 80 },
                              mb: { xs: 1, sm: 0 },
                            }}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={item.productId.model || "Unknown Product"}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {currencySymbol} {convertPrice(item.productId.price - item.productId.discountPrice)}
                              </Typography>
                              {item.productId.discountPrice && (
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    textDecoration: "line-through",
                                    ml: 1,
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {currencySymbol} {convertPrice(item.productId.price)}
                                </Typography>
                              )}
                              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                <IconButton onClick={() => updateQuantity(item.productId._id, -1)} disabled={item.quantity <= 1}>
                                  <Remove />
                                </IconButton>
                                <Typography sx={{ mx: 1 }}>{item.quantity || 1}</Typography>
                                <IconButton onClick={() => updateQuantity(item.productId._id, 1)}>
                                  <Add />
                                </IconButton>
                              </Box>
                            </>
                          }
                        />
                        <Button startIcon={<DeleteOutline />} onClick={() => removeFromCart(item.productId._id)} color="error">
                          Remove
                        </Button>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  )
              )}
            </List>
            <Box sx={{ mt: 5, textAlign: "right" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Total: {currencySymbol} {convertPrice(getTotalPrice())}
              </Typography>
              <Button
                variant="contained"
                color="info"
                startIcon={<ShoppingCart />}
                onClick={handleProceedToBuy}
                size="large"
                fullWidth
              >
                Proceed to Buy
              </Button>
            </Box>
          </Box>
          )}
        </Paper>
        <Dialog
          open={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <MultiStepCheckoutForm
            totalPrice={getTotalPrice()}
            onClose={() => setIsCheckoutOpen(false)}
          />
        </Dialog>
      </Box>
    </>
  );
}

export default CartPage;