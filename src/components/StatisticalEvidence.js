import React from "react";
import { Typography, Grid, Box, Paper } from "@mui/material";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const stats = [
  { value: "90%", label: "Customer Satisfaction" },
  { value: "200+", label: "Unique Designs" },
  { value: "10M+", label: "Covers Sold" },
];

function StatisticalEvidence() {
  const { translations } = useLanguage();
  return (
    <Box sx={{ py: 8, bgcolor: "white" }}>
      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        textAlign="center"
        sx={{ color: "black", mb: 6 }}
      >
        Our Impact
      </Typography>
      <Grid container spacing={4}>
        {/* {stats.map((stat, index) => (
          
        ))} */}
        {
          stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                viewport={{ once: true }}
              >
                <Paper
                  sx={{
                    p: 4,
                    mx: 5,
                    height: '200px',
                    textAlign: "center",
                    borderRadius: "12px",
                    bgcolor: index % 2 === 0 ? "rgb(210, 12, 232) " : "rgb(28, 160, 114) ", // Alternate colors for stat cards
                    color: "white",
                    boxShadow: 3,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.1)", // Hover effect to scale up the card
                      boxShadow: 6,
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    component="div"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ fontWeight: "light", opacity: 0.8 }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))
        }
      </Grid>
    </Box>
  );
}

export default StatisticalEvidence;
