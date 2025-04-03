import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const OrderHistory = ({ orders }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const selectedLanguage = localStorage.getItem("selectedLanguage") || "en";  
  const currencySymbol = selectedLanguage === "en" ? "₹" : "¥";  
  

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




  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return statusColors[status.toLowerCase()] || 'default';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        background: "linear-gradient(135deg,rgba(178, 185, 158, 0.07),rgb(95, 246, 105))" // Linear gradient background
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Order History
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              {!isMobile && <TableCell>Customer</TableCell>}
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(exchangeRates).length > 0 ? (
              orders.map((order) => {
                const rate = exchangeRates[currency] || 1; // Default to 1 if no rate found
                const convertedPrice = (order.totalAmount * rate).toFixed(2);

                return (
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
                    <TableCell>{currencySymbol}{convertedPrice}</TableCell> {/* Updated here */}
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading exchange rates...
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrderHistory;
