import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contexts/AuthContext";
import AdminProfile from "./AdminProfile";
import OrderHistory from "./OrderHistory";
import OrderManagement from "./OrderManagement";
import ProductManagement from "./ProductManagement";
import LanguageSelector from "../../components/LanguageSelector";
import { useLanguage } from "../../contexts/LanguageContext";
function AdminPanel() {
  const { translations } = useLanguage();
  const [value, setValue] = useState(0);
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = useMediaQuery("(max-width: 480px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/orders`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to fetch orders");
      }
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setSelectedTab(newValue);
  };

  const handleMobileTabChange = (event) => {
    setValue(event.target.value);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  if (!user || user.role !== "admin") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", padding: "20px" }}
      >
        <Typography variant="h6" color="error">
          🚫 Access Denied. Admin privileges required.
        </Typography>
      </motion.div>
    );
  }

  const tabContent = [
    <AdminProfile key="profile" />,
    <OrderHistory key="history" orders={orders} />,
    <OrderManagement key="management" orders={orders} setOrders={setOrders} />,
    <ProductManagement key="products" />,
  ];

  // const tabOptions = [
  //   { label: "👤 Profile", value: 0 },
  //   { label: "📦 Orders", value: 1 },
  //   { label: "⚙️ Management", value: 2 },
  //   { label: "🛍️ Products", value: 3 },
  // ];

  const tabOptions = [
    { label: `👤 ${translations?.admin?.profile}`, value: 0 },
    { label: `📦  ${translations?.admin?.orders}`, value: 1 },
    { label: `⚙️  ${translations?.admin?.management}`, value: 2 },
    { label: `🛍️  ${translations?.admin?.products}`, value: 3 },
  ];

  return (
    <>
      {/* Viewport Meta Tag */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container
          maxWidth="md"
          sx={{
            mt: isSmallScreen ? 6 : isMobile ? 8 : 10,
            mb: isSmallScreen ? 1 : isMobile ? 2 : 4,
            px: isSmallScreen ? 1 : isMobile ? 2 : 3,
          }}
        >
          {/* Navbar for Mobile */}
          {isMobile ? (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "linear-gradient(135deg,rgba(176, 214, 40, 0.08),rgb(237, 167, 63))",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6">{translations?.admin?.title || "Loading..."}</Typography>
              <Box>
                {/* Menu Button */}
                <LanguageSelector />
                
                <IconButton onClick={handleMenuOpen}>
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {tabOptions.map((tab, index) => (
                    <MenuItem
                      key={tab.value}
                      onClick={() => {
                        setValue(index);
                        setSelectedTab(index);
                        handleMenuClose();
                      }}
                    >
                      {tab.label}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={logout} sx={{ color: "red" }}>
                    <LogoutIcon sx={{ mr: 1 }} />
                     {/* Logout */}
                     {translations?.admin?.logout || "Loading..."}
                  </MenuItem>
                </Menu>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={3}
              sx={{
                p: isSmallScreen ? 2 : isMobile ? 2.5 : 3,
                mb: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg,rgba(209, 163, 25, 0.23),rgb(235, 181, 65))",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <LanguageSelector />
                <Typography variant="h4" component="h1">
                  {translations?.admin?.title || "Loading..."}
                </Typography>

                <Button
                  variant="contained"
                  color="error"
                  onClick={logout}
                  startIcon={<LogoutIcon />}
                >
                  {/* Logout */}
                  {translations?.admin?.logout || "Loading..."}

                </Button>
              </Box>

              {/* Tabs Section */}
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="admin panel tabs"
                variant="scrollable"
                scrollButtons="auto"
                centered={!isMobile}
                sx={{
                  mt: 2,
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#6C63FF",
                  },
                  "& .MuiTab-root": {
                    fontWeight: "bold",
                    color: "#495057",
                    "&.Mui-selected": {
                      color: "#6C63FF",
                    },
                  },
                }}
              >
                {tabOptions.map((tab) => (
                  <Tab key={tab.value} label={tab.label} />
                ))}
              </Tabs>

            </Paper>
          )}

          {/* Mobile Dropdown for Tabs */}
          {/* {isMobile && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Admin Section</InputLabel>
              <Select value={selectedTab} onChange={handleMobileTabChange}>
                {tabOptions.map((tab) => (
                  <MenuItem key={tab.value} value={tab.value}>
                    {tab.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )} */}

          {/* Tab Content with Animation */}
          <Box sx={{ mt: 2 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {tabContent[value]}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Container>
      </motion.div>
    </>
  );
}

export default AdminPanel;
