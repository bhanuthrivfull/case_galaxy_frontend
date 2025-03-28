import React, { useState } from "react";
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
import { useLanguage } from "../../contexts/LanguageContext";

const API_BASE_URL = "http://localhost:5000/api";

const OrderManagement = ({ orders, setOrders }) => {
  const {translations,language} = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState({});

  const orderStatuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

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


  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
                background: "linear-gradient(135deg,rgba(178, 185, 158, 0.07),rgb(95, 246, 105))",
 // Add linear gradient background here
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {/* Order Management */}
        {translations?.admin?.order_management_tab?.order_management || "Loading..."}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{translations?.admin?.order_management_tab?.order_id || "Loading..."}</TableCell>
              {!isMobile && <TableCell>{translations?.admin?.order_management_tab?.customer || "Loading..."}</TableCell>}
              <TableCell>{translations?.admin?.order_management_tab?.total || "Loading..."}</TableCell>
              <TableCell>{translations?.admin?.order_management_tab?.status || "Loading..."}</TableCell>
              {/* <TableCell>Actions</TableCell> */}
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
                <TableCell>{language==="en"?"₹":"¥"}{order.totalAmount.toFixed(2)}</TableCell>
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
                    {translations?.admin?.order_management_tab?.options.map((status) => (
                      <MenuItem key={status} value={status.toLowerCase()}>
                        {status}
                      </MenuItem>
                    ))}
                    
                  </Select>
                </TableCell>
                {/* <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleStatusChange(order._id, order.orderStatus)
                    }
                    disabled={loading[order._id]}
                  >
                    Update
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrderManagement;
