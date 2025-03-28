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
  Tooltip,
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





  const handleNavigation = () => {
    navigate("/");
    window.scrollTo(0, 0);
  };

  const { translations } = useLanguage()
  console.log('Responss==>', translations)
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
                  Case Galaxy
                </Typography>
              </motion.div>

              {/* Right Menu */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title="Language" placement="bottom">
                  <Box onClick={handleReloadClick} sx={{ cursor: 'pointer' }}>
                    <Typography>🌐</Typography>
                  </Box>
                </Tooltip>
                <Box sx={{ display: props.customStyles }}>
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
                {/* Cart Icon */}
                <IconButton
                  color="inherit"
                  component={Link}
                  to="/cart"
                  sx={{ display: props.customStyles }}
                >
                  <Badge badgeContent={cartItemCount} color="secondary">
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
                  Logout
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
              Menu
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
              <ListItemText primary={`Logout`} sx={{ color: "white" }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

export default Header;
