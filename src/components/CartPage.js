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
import { useLanguage } from "../contexts/LanguageContext.js";

const API_BASE_URL = "http://localhost:5000/api";


function CartPage() {
  const [cart, setCart] = useState({ items: [] });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      toast.error("User not logged in!");
      navigate("/login");
      return;
    }
    fetchUserId();
  }, [userEmail, navigate]);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchUserId = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/getUserId/${userEmail}`
      );
      setUserId(response.data.userId);
    } catch (err) {
      toast.error("Failed to fetch user ID.");
      console.error("Error fetching user ID:", err);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      const cartData = response.data || { items: [] };
      setCart({ ...cartData, items: cartData.items || [] });
      setError(null);
    } catch (err) {
      setError("Failed to load cart.");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!productId) return;
    try {
      await axios.delete(`${API_BASE_URL}/cart/${userId}/item/${productId}`);
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter(
          (item) => item?.productId?._id !== productId
        ),
      }));
      toast.success("Item removed from cart!");
    } catch (err) {
      toast.error("Failed to remove item.");
      console.error("Error removing item:", err);
    }
  };

  const updateQuantity = async (productId, change) => {
    if (!productId) return;
    const item = cart.items.find((item) => item?.productId?._id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);

    try {
      await axios.patch(`${API_BASE_URL}/cart/${userId}/item/${productId}`, {
        quantity: newQuantity,
      });

      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item?.productId?._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      }));
    } catch (err) {
      toast.error("Failed to update quantity.");
      console.error("Error updating quantity:", err);
    }
  };

  const getTotalPrice = () => {
    return cart.items
      .reduce((total, item) => {
        if (!item?.productId?.price) return total;
        return total + (item.productId.price - item.productId.discountPrice) * (item.quantity || 1);
      }, 0)
      .toFixed(2);
  };

  const handleProceedToBuy = () => {
    setIsCheckoutOpen(true);
  };

  const { translations, language } = useLanguage();

  return (
    <>
      <Header />
      <div className="container-fuild" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: "100vh",
        background: "linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)",
        mx: "100%",
      }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 4, md: 5 }, // More padding on larger screens
            mt: { xs: 8, sm: 12, md: 15 }, // Increased margin-top for header gap
            // bgcolor: "background.paper",
            background: "linear-gradient(45deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)",
            width: "85%",
            display: "flex",
            flexDirection: "column",
            marginBottom: "30px",
            gap: { xs: 2, sm: 3, md: 4 }, // Adds gap between child elements inside Paper
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
            {"Your Cart"}
          </Typography>
          {cart.items.length === 0 ? (
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
              {"Your cart is empty"}
            </Typography>
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
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  ₹{(item.productId.price - item.productId.discountPrice).toFixed(2)}
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
                                    ₹{item.productId.price}
                                  </Typography>
                                )}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                  }}
                                >
                                  <IconButton
                                    onClick={() =>
                                      updateQuantity(item.productId._id, -1)
                                    }
                                    disabled={item.quantity <= 1}
                                  >
                                    <Remove />
                                  </IconButton>
                                  <Typography sx={{ mx: 1 }}>
                                    {item.quantity || 1}
                                  </Typography>
                                  <IconButton
                                    onClick={() =>
                                      updateQuantity(item.productId._id, 1)
                                    }
                                  >
                                    <Add />
                                  </IconButton>
                                </Box>
                              </>
                            }
                          />
                          <Button
                            startIcon={<DeleteOutline />}
                            onClick={() => removeFromCart(item.productId._id)}
                            color="error"
                          >
                            {"Remove"}
                          </Button>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    )
                )}
              </List>
              <Box sx={{ mt: 5, textAlign: "right" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {"Total"}: ₹{getTotalPrice()}


                </Typography>
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<ShoppingCart />}
                  onClick={handleProceedToBuy}
                  size="large"
                  fullWidth
                >
                  {"Proceed to Buy"}
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
      </div>
    </>
  );
}

export default CartPage;
