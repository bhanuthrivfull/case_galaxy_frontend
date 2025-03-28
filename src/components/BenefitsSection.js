import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Paper,
} from "@mui/material";
import { TaskAlt } from "@mui/icons-material"; // Updated Icon
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const benefits = [
  "Advanced heat dissipation for improved performance.",
  "Scratch-resistant surface with anti-glare properties.",
  "Eco-friendly materials used for sustainable design.",
  "Enhanced grip for better handling and usability.",
  "Optimized for wireless charging with no interference."
];

function BenefitsSection() {
  return (
    <Box sx={{ py: 8, bgcolor: "white" }}> {/* Changed background to white */}
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        textAlign="center"

        sx={{ color: "black", mb: 6 }}
      >
        Exceptional Features
      </Typography>
      <List sx={{ maxWidth: 600, margin: "0 auto" }}>
        {/* {benefits.map((benefit, index) => (
         
        ))} */}

        {
          benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <ListItem>
                <Paper
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    p: 2,
                    mb: 1.5,
                    borderRadius: "8px", // Rounded corners for the list items
                    backgroundColor: "rgb(167, 104, 235)",
                    boxShadow: 3, // Shadow effect
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)", // Hover effect
                      boxShadow: 6,
                    },
                  }}
                >
                  <ListItemIcon>
                    <TaskAlt sx={{ color: "black" }} /> {/* Icon */}
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: "text.primary",
                        fontSize: "1.1rem", // Slightly smaller font size
                      },
                    }}
                  />
                </Paper>
              </ListItem>
            </motion.div>
          ))}
      </List>
    </Box>
  );
}

export default BenefitsSection;
