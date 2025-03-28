import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import {
  Favorite,
  LocalShipping,
  Brush,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { usp_items } from "../constants/data";

const uspItems = [
  {
    icon: <Favorite sx={{ fontSize: 70, color: "error.main" }} />, // Larger icon for more impact
    title: "Eco-Friendly",
    description: "Crafted from sustainable materials.",
  },
  {
    icon: <LocalShipping sx={{ fontSize: 70, color: "primary.main" }} />,
    title: "Free Shipping",
    description: "Free shipping available for all orders.",
  },
  {
    icon: <Brush sx={{ fontSize: 70, color: "secondary.main" }} />,
    title: "Customizable",
    description: "Add your own touch with custom designs",
  },
];

function USPSection() {
  return (
    <Box
      sx={{
        py: 10, // Increased padding for more space
        px: { xs: 2, sm: 10 }, // Adjusted padding for mobile
        bgcolor: "white", // White background
      }}
    >
      <Grid container spacing={5} justifyContent="center">
        {
          usp_items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ maxWidth: 320, width: "100%" }}> {/* Set maxWidth for mobile */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.3 }}
                viewport={{ once: true }}
              >
                <Box
                  sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    borderRadius: 2,
                    backgroundColor: `${index % 3 === 0 ? "rgb(224, 236, 110)" : index % 3 === 1 ? "rgb(36, 235, 69)" : "rgb(237, 218, 119)"}`,
                    boxShadow: 6, // Added shadow for depth
                    height: "100%",
                    minHeight: 320, // Ensure consistent height
                    transition: "all 0.3s ease", // Smooth transition for hover effects
                    "&:hover": {
                      transform: "translateY(-10px)", // Hover with subtle movement
                      boxShadow: 10, // Stronger shadow on hover
                    },
                  }}
                >
                  {uspItems[index]?.icon}

                  <Typography
                    variant="h5" // Bold heading for prominence
                    component="h3"
                    gutterBottom
                    sx={{
                      mt: 3,
                      color: "black", // Black color for title text
                      fontWeight: 600, // Bold font weight for title
                      letterSpacing: 1, // Slight letter spacing for elegance
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "black" }}>
                    {item.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))
        }
      </Grid>
    </Box>
  );
}

export default USPSection;
