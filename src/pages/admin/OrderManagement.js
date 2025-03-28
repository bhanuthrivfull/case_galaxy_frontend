import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Select,
  MenuItem,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = "https://case-galaxy-backend-2ow1.onrender.com/api";

const CURRENCY_SYMBOLS = {
  INR: "₹",
  CNY: "¥",
  USD: "$"
};

const OrderManagement = ({ orders, setOrders }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState({});
  const [exchangeRates, setExchangeRates] = useState({ INR: 1 });
  const [currency, setCurrency] = useState("INR");
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  // Get currency based on language
  const getCurrencyFromLanguage = () => {
    const lang = localStorage.getItem("selectedLanguage");
    return lang === "zh-TW" ? "CNY" : "INR";
  };

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      setIsLoadingRates(true);
      try {
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/INR");
        const data = await response.json();
        
        if (data && data.rates) {
          setExchangeRates({
            ...data.rates,
            INR: 1 // Ensure base rate is 1
          });
        }
      } catch (error) {
        console.error("Failed to fetch rates, using defaults:", error);
        // Fallback rates if API fails
        setExchangeRates({
          USD: 0.012,
          CNY: 0.087,
          INR: 1
        });
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchExchangeRates();
  }, []);

  // Update currency when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newCurrency = getCurrencyFromLanguage();
      setCurrency(newCurrency);
    };

    // Set initial currency
    handleLanguageChange();

    // Listen for storage changes
    window.addEventListener('storage', handleLanguageChange);
    return () => window.removeEventListener('storage', handleLanguageChange);
  }, []);

  // Format currency display without commas
  const formatCurrency = (amount) => {
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    // Convert to string and remove any commas
    const amountString = (amount * (exchangeRates[currency] || 1)).toFixed(2).replace(/,/g, '');
    return `${symbol} ${amountString}`;
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/orders/${orderId}`,
        { orderStatus: newStatus }
      );

      // Update orders in state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      alert("Order Updated");

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (isLoadingRates) {
    return <Typography>Loading exchange rates...</Typography>;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        background: "linear-gradient(135deg,rgba(178, 185, 158, 0.07),rgb(95, 246, 105))",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Order Management
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              {!isMobile && <TableCell>Customer</TableCell>}
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id} hover>
                <TableCell>{order._id.slice(-6)}</TableCell>
                {!isMobile && (
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{order.userId.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {order.userId.email}
                      </Typography>
                    </Box>
                  </TableCell>
                )}
                <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                <TableCell>
                  <Select
                    value={order.orderStatus}
                    size="small"
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    disabled={loading[order._id]}
                    sx={{ minWidth: 120 }}
                  >
                    {orderStatuses.map((status) => (
                      <MenuItem key={status} value={status.toLowerCase()}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrderManagement;