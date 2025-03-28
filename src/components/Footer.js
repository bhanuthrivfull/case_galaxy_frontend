import { Facebook, Instagram, Twitter } from '@mui/icons-material';
import { Box, Grid, Link, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function Footer() {
  return (
    <Box
      sx={{
        backgroundColor: 'rgb(23, 23, 21) ',
        color: 'white',   // Set text color to white
        py: 8, // Increased padding on the Y-axis for a taller footer
        px: 4,
        boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.1)', // Subtle shadow for the footer
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent='center' // Center the content
        alignItems='center'
        direction={{ xs: 'column', md: 'row' }} // Stack in column on mobile, row on tablet and desktop
      >
        {/* Brand Section */}
        <Grid item xs={12} md={4}>
          <motion.div>
            <Typography
              variant='h6'
              gutterBottom
              sx={{
                backgroundColor: 'rgb(100 200 250)', // Gradient colors (pink to blue)
                WebkitBackgroundClip: 'text', // Clip the background to text
                color: 'transparent', // Make the text transparent to show the gradient
                borderRadius: { xs: "8px", sm: "12px", md: "16px" },
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {"Case Galaxy"}
            </Typography>
            <Typography
              variant='body2'
              sx={{ lineHeight: 1.8, textAlign: 'center' }}
            >
              {"Elevating device protection since 2025."}
            </Typography>
          </motion.div>
        </Grid>

        {/* Contact Section */}
        <Grid item xs={12} md={4}>
          <motion.div>
            <Typography
              variant='h6'
              gutterBottom
              sx={{
                backgroundColor: 'rgb(100 200 250)', // Gradient for the text
                WebkitBackgroundClip: 'text',
                color: 'transparent', // Text will be transparent to show the gradient
                borderRadius: { xs: "8px", sm: "12px", md: "16px" },
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {"Contact Us"}
            </Typography>
            <Typography
              variant='body2'
              sx={{ lineHeight: 1.8, textAlign: 'center' }}
            >
              {"Phone"}{' '}
              <Link color='inherit'>
                +91 97054 60388
              </Link>
            </Typography>
          </motion.div>
        </Grid>

        {/* Social Media Section */}
        <Grid item xs={12} md={4}>
          <motion.div>
            <Typography
              variant='h6'
              gutterBottom
              sx={{
                backgroundColor: 'rgb(100 200 250)', // Gradient for the text
                WebkitBackgroundClip: 'text',
                color: 'transparent', // Text will be transparent to show the gradient
                borderRadius: { xs: "8px", sm: "12px", md: "16px" },
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {"Follow Us"}
            </Typography>
            <Box
              sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}
            >
              <Link
                href={"https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F"}
                color='inherit'
                target='_blank'
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <Facebook fontSize='large' />
              </Link>
              <Link
                href={"https://www.instagram.com/?hl=en"}
                target='_blank'
                color='inherit'
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <Instagram fontSize='large' />
              </Link>
              <Link
                href={"https://x.com/?lang=en&mx=2"}
                target='_blank'
                color='inherit'
                sx={{
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.1)' },
                }}
              >
                <Twitter fontSize='large' />
              </Link>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Footer Links */}
      <Box mt={4} textAlign='center'>
        <motion.div>
          <Typography variant='body2'>
            © {new Date().getFullYear()}{' '}
            <Typography
              component='span'
              sx={{ fontWeight: 'bold', color: 'dark.main' }}
            >
              {"Case Galaxy"}
            </Typography>
            . {"All rights reserved."}
          </Typography>
          {/* <Typography variant='body2' sx={{ mt: 1 }}>
            <Link href='#' color='inherit' underline='hover'>
              Privacy Policy
            </Link>{' '}
            |{' '}
            <Link href='#' color='inherit' underline='hover'>
              Terms of Service
            </Link>
          </Typography> */}
        </motion.div>
      </Box>
    </Box>
  );
}

export default Footer;
