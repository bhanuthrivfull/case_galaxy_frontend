import React from 'react';
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
import { useLanguage } from '../../contexts/LanguageContext';

const OrderHistory = ({ orders }) => {
  const { translations, language } = useLanguage();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error',
      confirmed: 'secondary',
      cancancelled: 'default',
    };
    return statusColors[status.toLowerCase()] || 'default';
  };

  const statusTranslations = {
    en: {
      Pending: "Pending",
      Processing: "Processing",
      Shipped: "Shipped",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
      Confirmed: "Confirmed",
    },
    zh: {
      Pending: "待处理",
      Processing: "处理中",
      Shipped: "已发货",
      Delivered: "已送达",
      Cancelled: "已取消",
      Confirmed: "已确认",
    },
  };
  
  const normalizeStatus = (status) => {
    console.log('Status=====>',status)
    const normalized = {
      "pending": "Pending",
      "processing": "Processing",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled",
      "confirmed": "Confirmed",
      "待处理": "Pending",
      "处理中": "Processing",
      "已发货": "Shipped",
      "已送达": "Delivered",
      "已取消": "Cancelled",
      "已确认": "Confirmed",
    };
    return normalized[status.toLowerCase()] || status;
  };
  
  // Get translated status while ensuring fallback to English
  const getTranslatedStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return (
      statusTranslations[language]?.[normalizedStatus] ||
      statusTranslations["en"][normalizedStatus] ||
      status
    );
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        background: "linear-gradient(135deg, rgba(178, 185, 158, 0.07), rgb(95, 246, 105))",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {translations?.admin?.order_tab?.order_history || "Loading..."}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{translations?.admin?.order_tab?.order_id || "Loading..."}</TableCell>
              {!isMobile && <TableCell>{translations?.admin?.order_tab?.customer || "Loading..."}</TableCell>}
              <TableCell>{translations?.admin?.order_tab?.total || "Loading..."}</TableCell>
              <TableCell>{translations?.admin?.order_tab?.status || "Loading..."}</TableCell>
              <TableCell>{translations?.admin?.order_tab?.date || "Loading..."}</TableCell>
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
                  <Chip
                    label={getTranslatedStatus(order.orderStatus)}
                    color={getStatusColor(order.orderStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default OrderHistory;
