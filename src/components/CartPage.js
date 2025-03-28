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
      toast.error(language === 'en' ? "User not logged in!" : "用户未登录!");
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
      toast.error(language === 'en' ? "Failed to fetch user ID." : "获取用户ID失败");
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
      toast.error(language === 'en' ? "Failed to load cart." : "加载购物车失败");
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
      toast.success(language === 'en' ? "Item removed from cart!" : "商品已从购物车移除!");
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      toast.error(language === 'en' ? "Failed to remove item." : "移除商品失败");
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
      toast.error(language === 'en' ? "Failed to update quantity." : "更新数量失败");
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
      toast.error(language === 'en' ? "Your cart is empty!" : "您的购物车是空的!");
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
            {language === 'en' ? "Your Cart" : "您的购物车"}
          </Typography>
          
          {loading ? (
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
              {language === 'en' ? "Loading your cart..." : "正在加载您的购物车..."}
            </Typography>
          ) : cart.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
                {language === 'en' ? "Your cart is empty" : "您的购物车是空的"}
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 3 }}
                onClick={() => navigate('/')}
              >
                {language === 'en' ? "Continue Shopping" : "继续购物"}
              </Button>
            </Box>
          ) : (
            <Box>
              <List>
                {cart.items.map((item) => (
                  <React.Fragment key={item.productId._id}>
                    <ListItem
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 3,
                        py: 3,
                        px: 2,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {/* Product Image - Updated to prevent cutting */}
                      <Box sx={{ 
                        flexShrink: 0,
                        width: { xs: '100%', sm: 120 },
                        height: 120,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                      }}>
                        <Box
                          component="img"
                          src={item.productId.image}
                          alt={item.productId.model || (language === 'en' ? "Product" : "产品")}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>

                      {/* Product Details */}
                      <Box sx={{ 
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        minWidth: 0
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {item.productId.model || (language === 'en' ? "Unknown Product" : "未知产品")}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" color="primary" fontWeight="bold">
                            {currencySymbol}{(item.productId.price - (item.productId.discountPrice || 0)).toFixed(2)}
                          </Typography>
                          {item.productId.discountPrice && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: "line-through" }}
                            >
                              {currencySymbol}{item.productId.price}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <IconButton
                            onClick={() => updateQuantity(item.productId._id, -1)}
                            disabled={item.quantity <= 1}
                            size="small"
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity || 1}
                          </Typography>
                          <IconButton
                            onClick={() => updateQuantity(item.productId._id, 1)}
                            size="small"
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Remove Button */}
                      <Box sx={{ alignSelf: { sm: 'flex-start' } }}>
                        <Button
                          startIcon={<DeleteOutline />}
                          onClick={() => removeFromCart(item.productId._id)}
                          color="error"
                          size="small"
                        >
                          {language === 'en' ? "Remove" : "移除"}
                        </Button>
                      </Box>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 5, textAlign: "right" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {language === 'en' ? "Total" : "总计"}: {currencySymbol}{getTotalPrice()}
                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<ShoppingCart />}
                  onClick={handleProceedToBuy}
                  size="large"
                  fullWidth
                >
                  {language === 'en' ? "Proceed to Buy" : "继续购买"}
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