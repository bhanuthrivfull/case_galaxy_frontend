import React from "react";
import { Typography, Box, Avatar, Rating, Container, Paper } from "@mui/material";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLanguage } from "../contexts/LanguageContext";
import { testomonial_data } from "../constants/data";

const reviews = [
  {
    "id": 1,
    "name": "Raju",
    "rating": 3,
    "comment": "Very durable and looks super sleek. Totally worth it.",
    "avatar": "https://media.gettyimages.com/id/175990379/video/portrait-of-a-horrible-boss.jpg?s=640x640&k=20&c=rrcEN7JwxCS3NEPBD6eHN-R_I7zUv98CL-lpMCzaDGA="
  },
  {
    "id": 2,
    "name": "Ram",
    "rating": 4,
    "comment": "Stylish and strong, it makes my phone look amazing!",
    "avatar": "https://media.istockphoto.com/id/849455442/photo/smiling-businessman-in-his-office.jpg?s=612x612&w=0&k=20&c=PcM0ei31yAmQLV_LjzQODC424QDcMeEDff9r-gmJyu0="
  },
  {
    "id": 3,
    "name": "Krishna",
    "rating": 4,
    "comment": "Perfect fit and looks amazing! The case feels premium.",
    "avatar": "https://img.freepik.com/premium-photo/smiling-businessman-formal-wear-using-tablet-while-standing-rooftop_232070-1360.jpg"
  }
];

function CustomerReviews() {
  return (
    <Box sx={{ py: 12, background: "#ffffff", color: "white" }}>
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          textAlign="center"
          sx={{
            fontWeight: "bold",
            color: "black",
            mb: 4,
          }}
        >
          Customer Testimonials
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* {reviews.map((review) => (
            
          ))} */}
          {
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      background: "rgb(55, 228, 240)",
                      borderRadius: "10px",
                      padding: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      color: "white",
                    }}
                  >
                    <Avatar
                      alt={review.name}
                      src={review.avatar}
                      sx={{
                        width: 70,
                        height: 70,
                        border: "3px solid #007BFF",
                      }}
                    />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
                        {review.name}
                      </Typography>
                      <Rating value={review.rating} readOnly sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.8, color: "white" }}>
                        "{review.comment}"
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              ))
          }
        </Box>
      </Container>
    </Box>
  );
}

export default CustomerReviews;