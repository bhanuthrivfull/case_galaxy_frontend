import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  X as CloseIcon,
  MenuIcon,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../contexts/LanguageContext";

function Header(props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { logout, currentUser } = useAuth(); // Get user from AuthContext
  const navigate = useNavigate();

  // Fetch cart items count from backend
  const fetchCartCount = async () => {
    if (!currentUser) return; // Ensure user is logged in

    try {
      const response = await axios.get(
        `http://localhost:5000/api/cart/${currentUser.id}`
      );
      const cartItems = response.data.items || [];
      const itemCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ); // Sum all item quantities
      setCartItemCount(itemCount);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();

    // Poll every 10 seconds to update the cart count
    const interval = setInterval(fetchCartCount, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



  const handleNavigation = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  const { translations } = useLanguage()
console.log('Responss==>',translations)
  return (
    <>
      <motion.div>
        <AppBar
          sx={{
            backgroundColor: "black",
            transition: "all 0.3s ease",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ py: 1, justifyContent: "space-between" }}>
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    flexGrow: 1,
                    fontWeight: "bold",
                    background: "rgb(138, 239, 105)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    cursor: "pointer",
                    "@media (max-width: 678px)": {
                      fontSize: "16px", // Font size for screen width <= 678px
                    },
                  }}
                  onClick={handleNavigation}
                >
                  {translations?.title || "Loading..."}
                </Typography>
              </motion.div>

              {/* Right Menu */}
              <Box sx={{ display: "flex", alignItems: "center", gap:{xs:0,sm:2} }}>
                {/* Cart Icon */}
                <LanguageSelector />
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  sx={{ display: props.customStyles }}
                >
                  <Badge badgeContent={cartItemCount} color="info">
                    <ShoppingCart />
                  </Badge>
                </IconButton>

                {/* Logout Button */}
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    backgroundColor: "rgb(138, 239, 105)", // Add your gradient colors
                    borderColor: "transparent", // Hide the border color
                    color: "white", // Set text color to white for better contrast
                    "&:hover": {
                      backgroundColor: "rgb(241, 227, 71)", // Invert gradient on hover for effect
                      borderColor: "transparent", // Hide border on hover as well
                    },
                  }}
                >
                  {translations?.logout || "Loading..."}
                </Button>

                {/* Mobile Menu Button */}
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <IconButton
                    color="inherit"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </motion.div>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 350,
            background: "rgba(145, 160, 153, 0.98)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ color: "white" }}>
              {translations?.sm_menu || "Loading..."}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(false)}
              style={{ width: "80px" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary={`${translations?.logout || "Loading..."}`} sx={{ color: "white" }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;
