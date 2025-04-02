"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, CreditCard, LocalShipping, ErrorOutline } from "@mui/icons-material"
import {
  Button,
  CardContent,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Divider,
  useTheme,
  useMediaQuery,
  CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"

const API_BASE_URL = "http://localhost:5000/api"

// Enhanced dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#BB86FC",
    },
    secondary: {
      main: "#03DAC6",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    error: {
      main: "#CF6679",
    },
    success: {
      main: "#03DAC6",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#BB86FC",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
})

// Animation variants
const pageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  }),
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99],
    },
  },
}

export default function MultiStepCheckoutForm({ totalPrice, onClose }) {


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

  const convertPrice = (price) => {
    const rate = exchangeRates[currency] || 1;
    return (price * rate).toFixed(2);
  };


  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "",
    cardType: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const navigate = useNavigate()

  const selectedLanguage = localStorage.getItem("selectedLanguage");
  const currencySymbol = selectedLanguage === 'en' ? '₹' : '¥';

  // Validation functions
  const validateName = (value) => {
    if (!value) return "Name is required.";

    if (/[!@#$%^&*(),?":{}|<>\-_=+]/.test(value))
      return "Name cannot contain special characters.";

    if (/^\s/.test(value))
      return "Name should not start with a space.";

    if (/\s{2,}/.test(value))
      return "Name should not contain multiple consecutive spaces.";

    if (/\d/.test(value))
      return "Name cannot contain numbers.";

    if (!/^[A-Z][a-zA-Z\s]{2,39}$/.test(value))
      return "Name must start with a capital letter, contain only letters and spaces, and be between 3 to 40 characters long.";

    return ""; // Valid name
  };


  const validateEmail = (value) => {
    if (!value) return "Email is required.";

    value = value.toLowerCase(); // Convert to lowercase in real-time

    if (value.length > 50) return "Email cannot exceed 50 characters.";
    if (value.length < 13) return "Email must be at least 13 characters long.";

    if (/[!#$%^&*(),?":{}|<>\-_=+]/.test(value))
      return "Email cannot contain special characters.";

    if (!/^[a-zA-Z]/.test(value))
      return "Email must start with a letter.";

    const emailRegex = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)*@[a-zA-Z]+(\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(value))
      return "Please enter a valid email address (user@domain.com).";

    return ""; // No error
  };


  const validatePhone = (value) => {
    if (!value) return "Phone number is required."
    if (!/^[6-9]\d{9}$/.test(value)) return "Phone number must be 10 digits and start with 6, 7, 8, or 9."
    return ""
  }

  const validateAddress = (value) => {
    if (!value) return "Address is required."
    if (value.length < 10) return "Address must be at least 10 characters long."
    if (/[!@#$%^&*(),?":{}|<>]/.test(value)) return "Address contains invalid special characters."
    return ""
  }

  const validateCity = (value) => {
    if (!value) return "City is required."
    if (/[!@#$%^&*(),?":{}|<>0-9]/.test(value)) return "City name cannot contain special characters or numbers."
    if (!/^[A-Za-z\s]{2,}$/.test(value)) return "City name must be at least 2 characters long."
    return ""
  }

  const validateState = (value) => {
    if (!value) return "State is required."
    if (/[!@#$%^&*(),?":{}|<>0-9]/.test(value)) return "State name cannot contain special characters or numbers."
    if (!/^[A-Za-z\s]{2,}$/.test(value)) return "State name must be at least 2 characters long."
    return ""
  }

  const validateZipCode = (value) => {
    if (!value) return "ZIP code is required."
    if (!/^\d{6}$/.test(value)) return "ZIP code must be exactly 6 digits."
    return ""
  }

  const validateCardNumber = (value) => {
    const cleanedValue = value.replace(/\s/g, '')
    if (!cleanedValue) return "Card number is required."

    // Card type specific validation
    if (formData.cardType === "American Express") {
      if (!/^3[47][0-9]{13}$/.test(cleanedValue)) return "American Express cards must start with 34 or 37 and be 15 digits."
    } else if (formData.cardType === "Visa") {
      if (!/^4[0-9]{12}(?:[0-9]{3})?$/.test(cleanedValue)) return "Visa cards must start with 4 and be 13 or 16 digits."
    } else if (formData.cardType === "MasterCard") {
      if (!/^5[1-5][0-9]{14}$/.test(cleanedValue)) return "MasterCard must start with 51-55 and be 16 digits."
    } else if (formData.cardType === "JCB") {
      if (!/^(?:2131|1800|35\d{3})\d{11}$/.test(cleanedValue)) return "JCB cards must start with 2131, 1800, or 35 and be 15-16 digits."
    } else if (formData.cardType === "Diners Club") {
      if (!/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(cleanedValue)) return "Diners Club cards must start with 300-305, 36, or 38-39 and be 14 digits."
    } else if (formData.cardType === "RuPay") {
      if (!/^6[0-9]{15}$/.test(cleanedValue)) return "RuPay cards must start with 6 and be 16 digits."
    } else {
      // Generic validation if no card type selected
      if (!/^[0-9]{13,19}$/.test(cleanedValue)) return "Card number must be 13-19 digits."
    }

    if (/(\d)\1{15}/.test(cleanedValue)) return "Card number cannot have all identical digits."
    return ""
  }

  const validateCardExpiry = (value) => {
    if (!value) return "Expiry date is required."
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) return "Invalid expiry date format (MM/YY)."
    const [month, year] = value.split("/")
    const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 0)
    if (expiryDate <= new Date()) {
      return "Expiry date must be in the future"
    }
    return ""
  }

  const validateCardCvc = (value) => {
    if (!value) return "CVV is required."

    // Card type specific CVC validation
    if (formData.cardType === "American Express") {
      if (!/^\d{4}$/.test(value)) return "American Express cards require 4-digit CVV."
    } else {
      if (!/^\d{3}$/.test(value)) return "CVV must be 3 digits for this card type."
    }

    return ""
  }

  const personal_details = {
    "title": "Personal Details",
    "full_name": "Full Name",
    "email": "Email",
    "phone": "Phone",
    "address": "Address",
    "city_name": "City",
    "state_name": "State",
    "zip": "Zip Code",
    "card_number": "Card Number",
    "expiry": "Expiry Date",
    "cvv": "CVV"
  }

  const validateField = (name, value) => {
    switch (name) {
      case "name": return validateName(value)
      case "email": return validateEmail(value)
      case "phone": return validatePhone(value)
      case "address": return validateAddress(value)
      case "city": return validateCity(value)
      case "state": return validateState(value)
      case "zipCode": return validateZipCode(value)
      case "cardNumber": return validateCardNumber(value)
      case "cardExpiry": return validateCardExpiry(value)
      case "cardCvc": return validateCardCvc(value)
      default: return ""
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field])
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const validateStep = (stepNumber) => {
    const newErrors = {}
    let isValid = true

    if (stepNumber === 1) {
      ["name", "email", "phone", "address", "city", "state", "zipCode"].forEach((field) => {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })
    }

    if (stepNumber === 2) {
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = "Please select a payment method"
        isValid = false
      }
    }

    if (stepNumber === 3 && formData.paymentMethod === "card") {
      if (!formData.cardType) {
        newErrors.cardType = "Please select a card type"
        isValid = false
      }
    }

    if (stepNumber === 4 && formData.paymentMethod === "card") {
      ["cardNumber", "cardExpiry", "cardCvc"].forEach((field) => {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (step === 1 && !validateStep(1)) return
    if (step === 2 && !validateStep(2)) return
    if (step === 3 && formData.paymentMethod === "card" && !validateStep(3)) return
    if (step === 4 && formData.paymentMethod === "card" && !validateStep(4)) return

    if ((step === 3 && formData.paymentMethod === "cod") || (step === 5 && formData.paymentMethod === "card")) {
      placeOrder()
    } else {
      setDirection(1)
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setDirection(-1)
    setStep((prev) => prev - 1)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    switch (name) {
      case "cardNumber":
        formattedValue = value.replace(/\D/g, "")

        // Apply card type specific formatting
        if (formData.cardType === "American Express") {
          if (formattedValue.length > 15) return
          formattedValue = formattedValue.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3").trim()
        } else {
          if (formattedValue.length > 16) return
          formattedValue = formattedValue.replace(/(\d{4})/g, "$1 ").trim()
        }
        break

      case "cardExpiry":
        formattedValue = value.replace(/\D/g, "")
        if (formattedValue.length >= 2) {
          let month = formattedValue.slice(0, 2)
          let year = formattedValue.slice(2, 4)
          if (parseInt(month) > 12) month = "12"
          else if (parseInt(month) < 1) month = "01"
          formattedValue = month + (year ? "/" + year : "")
          if (year.length === 2) {
            const currentYear = new Date().getFullYear() % 100
            if (parseInt(year) < currentYear) return
          }
        }
        formattedValue = formattedValue.slice(0, 5)
        break
      case "address":
        formattedValue = value.replace(/^\s+/, '')
        if (value.startsWith(' ')) {
          setErrors(prev => ({ ...prev, address: "Address cannot start with a space" }))
        }
        break
      case "phone":
        let onlyNumbers = value.replace(/\D/g, "")
        if (/(\d)\1{6,}/.test(onlyNumbers)) {
          setErrors(prev => ({ ...prev, phone: "Phone number cannot have more than 6 identical consecutive digits" }))
          return
        }
        if (onlyNumbers.length > 0 && !/^[6789]/.test(onlyNumbers)) return
        formattedValue = onlyNumbers.slice(0, 10)
        break
      case "zipCode":
        formattedValue = value.replace(/\D/g, "").slice(0, 6)
        break
      case "name":
        formattedValue = value
          .replace(/^\s+/, '')
          .replace(/[^a-zA-Z\s]/g, "")
          .replace(/\s+/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase())
        if (value.startsWith(' ')) {
          setErrors(prev => ({ ...prev, name: "Name cannot start with a space" }))
        }
        break
      case "email":
        formattedValue = value
          .replace(/[,#'"!$%^&*()<>?/|}{[\]`~=+]/g, "")
          .replace(/\s/g, "")
          .replace(/@{2,}/g, "@")
          .replace(/\.{2,}/g, ".")
        break
      case "cardType":
        // When card type changes, reset card number validation
        setFormData(prev => ({
          ...prev,
          cardType: value,
          cardNumber: ""
        }))
        setErrors(prev => ({
          ...prev,
          cardNumber: ""
        }))
        formattedValue = value
        break
      default:
        break
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }))

    if (touched[name]) {
      const error = validateField(name, formattedValue)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const placeOrder = async () => {
    setLoading(true)

    try {
      if (!cart || !cart.items || cart.items.length === 0) {
        toast.error("Cart is empty. Please add items before placing an order.")
        setLoading(false)
        return
      }

      if (
        !formData ||
        !formData.name ||
        !formData.address ||
        !formData.city ||
        !formData.state ||
        !formData.zipCode ||
        !formData.phone ||
        !formData.paymentMethod
      ) {
        toast.error("Please fill in all required shipping details.")
        setLoading(false)
        return
      }

      const parsedTotal = totalPrice ? Number.parseFloat(totalPrice) : 0

      const orderData = {
        items: cart.items.map((item) => ({
          productId: item?.productId?._id,
          quantity: item.quantity || 1,
          price: item?.productId?.price || 0,
        })),
        totalAmount: parsedTotal,
        shippingAddress: {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          phone: formData.phone,
        },
        paymentMethod: formData.paymentMethod,
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("User not authenticated. Please log in.")
        setLoading(false)
        return
      }

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.orderId) {
        toast.success("Order placed successfully!")
        setStep(formData.paymentMethod === "card" ? 6 : 4)
        // Clear the cart after successful order placement
        const userEmail = localStorage.getItem("userEmail")
        const userResponse = await axios.get(`${API_BASE_URL}/users/getUserId/${userEmail}`)
        const userId = userResponse.data.userId
        await axios.delete(`${API_BASE_URL}/cart/${userId}`)
      } else {
        throw new Error("Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error(`Failed to place order: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const userEmail = localStorage.getItem("userEmail")
        const userResponse = await axios.get(`${API_BASE_URL}/users/getUserId/${userEmail}`)
        const userId = userResponse.data.userId
        const cartResponse = await axios.get(`${API_BASE_URL}/cart/${userId}`)
        setCart(cartResponse.data)
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast.error("Failed to load cart data")
      }
    }

    fetchCart()
  }, [])

  const cards_data = [
    "Visa",
    "MasterCard",
    "American Express",
    "RuPay"
  ]

  const renderCardTypeSelection = () => (
    <motion.div variants={fadeInUp}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography variant="h5" gutterBottom style={{ color: "white" }}>
          Select Card Type
        </Typography>
        <FormControl component="fieldset" error={!!errors.cardType}>
          <RadioGroup name="cardType" value={formData.cardType} onChange={handleInputChange}>
            {cards_data.map((type) => (
              <motion.div key={type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Paper
                  sx={{
                    mb: 2,
                    p: { xs: 2, sm: 3 },
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <FormControlLabel
                    value={type}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CreditCard />
                        <Typography>{type}</Typography>
                      </Box>
                    }
                  />
                </Paper>
              </motion.div>
            ))}
          </RadioGroup>
          {errors.cardType && (
            <Typography variant="caption" color="error">
              {errors.cardType}
            </Typography>
          )}
        </FormControl>
      </Box>
    </motion.div>
  )

  return (
    <ThemeProvider theme={darkTheme}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: "auto", sm: "auto" },
          maxHeight: { xs: "auto", sm: "none" },
          overflowY: "scroll",
          scrollbarWidth: "thin",
          scrollbarColor: "cyan black",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "cyan",
            borderRadius: "8px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "deepskyblue",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "black",
          },
          backgroundColor: "rgba(20, 102, 102, 0.93)",
        }}
      >
        <Stepper
          activeStep={step - 1}
          sx={{
            mb: 4,
            display: { xs: "none", sm: "flex" },
            backgroundColor: "rgb(74, 243, 68)",
            borderRadius: "8px",
            padding: 2,
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Step>
            <StepLabel
              sx={{
                color: "white",
                "& .MuiStepIcon-root": {
                  color: step > 0 ? "cyan" : "gray",
                },
                "& .MuiStepIcon-text": {
                  fill: "black",
                },
                "& .MuiStepLabel-label": {
                  color: step > 0 ? "cyan" : "gray",
                },
              }}
            >
              Details
            </StepLabel>
          </Step>
          <Step>
            <StepLabel
              sx={{
                color: "white",
                "& .MuiStepIcon-root": {
                  color: step > 1 ? "cyan" : "gray",
                },
                "& .MuiStepIcon-text": {
                  fill: "black",
                },
                "& .MuiStepLabel-label": {
                  color: step > 1 ? "cyan" : "gray",
                },
              }}
            >
              Payment
            </StepLabel>
          </Step>
          <Step>
            <StepLabel
              sx={{
                color: "white",
                "& .MuiStepIcon-root": {
                  color: step > 2 ? "cyan" : "gray",
                },
                "& .MuiStepIcon-text": {
                  fill: "black",
                },
                "& .MuiStepLabel-label": {
                  color: step > 2 ? "cyan" : "gray",
                },
              }}
            >
              Confirm
            </StepLabel>
          </Step>
        </Stepper>

        {/* Mobile Step Indicator */}
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            justifyContent: "center",
            alignItems: "center",
            mb: 3,
            padding: 2,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            color: "white",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Step {step} of {formData.paymentMethod === "card" ? "6" : "4"}
          </Typography>
        </Box>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: "relative" }}
          >
            {step === 1 && (
              <motion.div variants={fadeInUp}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 2, sm: 3 },
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    style={{ color: "white" }}
                  >
                    Personal Details
                  </Typography>
                  <TextField
                    fullWidth
                    label={personal_details?.full_name}
                    name="name"
                    value={formData.name}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value.trim().length > 0 && errors.name === "Name cannot start with a space") {
                        setErrors(prev => ({ ...prev, name: "" }));
                      }
                    }}
                    onBlur={() => handleBlur("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{

                      maxLength: 40,
                      pattern: "^[A-Z][a-zA-Z\\s]{2,39}$",
                      title: "Name must be 3-40 characters, start with a capital letter, and contain only letters and spaces"
                    }}
                  />
                  <TextField
                    fullWidth
                    label={personal_details?.email}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      let value = e.target.value
                        .toLowerCase() // Convert to lowercase in real-time
                        .replace(/\s/g, "") // Remove spaces
                        .replace(/[^a-zA-Z0-9.@_-]/g, "") // Allow only valid email characters
                        .replace(/@+/g, "@") // Prevent multiple '@' symbols
                        .replace(/\.+/g, ".") // Prevent multiple '.' in a row
                        .replace(/(\.@|@\.)/g, ""); // Prevent invalid '@.' patterns

                      const atIndex = value.indexOf("@");
                      if (atIndex > 0) {
                        const localPart = value.substring(0, atIndex);
                        value = localPart.replace(/^\.+|\.+$/g, "") + value.substring(atIndex); // Trim dots at start/end of local part
                      }
                      if (atIndex > -1) {
                        const domainPart = value.substring(atIndex);
                        value = value.substring(0, atIndex) + domainPart.replace(/\.+/g, "."); // Prevent multiple '.' in domain part
                      }

                      setFormData((prev) => ({ ...prev, email: value }));

                      // Clear errors if the input becomes valid
                      if (value.trim().length > 0 && errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    onBlur={() => handleBlur("email")}
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                        setErrors((prev) => ({ ...prev, email: "Email cannot contain spaces" }));
                      }
                      if (e.target.value === "" && (e.key === "@" || e.key === ".")) {
                        e.preventDefault();
                      }
                    }}
                    error={!!errors.email}
                    helperText={errors.email || ""}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      maxLength: 50,
                      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                      title: "Please enter a valid email address (e.g., user@example.com)"
                    }}
                  />

                  <TextField
                    fullWidth
                    label={personal_details?.phone}
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (/(\d)\1{6,}/.test(value)) {
                        setErrors(prev => ({
                          ...prev,
                          phone: "Phone number cannot have more than 6 identical consecutive digits"
                        }));
                        return;
                      }
                      if (value.length > 0 && !/^[6789]/.test(value)) {
                        return;
                      }
                      value = value.slice(0, 10);
                      setFormData(prev => ({ ...prev, phone: value }));
                      setErrors(prev => ({ ...prev, phone: "" }));
                    }}
                    onBlur={() => handleBlur("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      maxLength: 10,
                      inputMode: 'numeric',
                      pattern: '[6789][0-9]{9}',
                      title: 'Enter a valid 10-digit Indian phone number starting with 6-9'
                    }}
                  />
                  <TextField
                    fullWidth
                    label={personal_details?.address}
                    name="address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value.trim().length > 0 && errors.address === "Address cannot start with a space") {
                        setErrors(prev => ({ ...prev, address: "" }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("address");
                      if (formData.address.trim().length > 0 && formData.address.trim().length < 10) {
                        setErrors(prev => ({ ...prev, address: "Address must be at least 10 characters long" }));
                      }
                    }}
                    error={!!errors.address}
                    helperText={errors.address}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      onKeyDown: (e) => {
                        if (e.target.value === "" && e.key === " ") {
                          e.preventDefault();
                          setErrors(prev => ({ ...prev, address: "Address cannot start with a space" }));
                        }
                      },
                      maxLength: 250,
                      pattern: "^\\S+(?: \\S+)*$",
                      title: "Address cannot start or end with spaces"
                    }}
                  />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label={personal_details?.city_name}
                      name="city"
                      value={formData.city}
                      onChange={(e) => {
                        let value = e.target.value
                          .replace(/^\s+/, '')
                          .replace(/[^a-zA-Z\s]/g, '')
                          .replace(/\s+/g, ' ');
                        setFormData(prev => ({ ...prev, city: value }));
                        if (value.trim().length > 0 && errors.city === "City cannot start with a space") {
                          setErrors(prev => ({ ...prev, city: "" }));
                        }
                      }}
                      onBlur={() => handleBlur("city")}
                      onKeyDown={(e) => {
                        if (e.target.value === "" && e.key === " ") {
                          e.preventDefault();
                          setErrors(prev => ({ ...prev, city: "City cannot start with a space" }));
                        }
                      }}
                      error={!!errors.city}
                      helperText={errors.city}
                      size={isMobile ? "small" : "medium"}
                      inputProps={{
                        maxLength: 30,
                        pattern: "^[a-zA-Z][a-zA-Z ]*$",
                        title: "City must start with a letter and contain only letters and spaces"
                      }}
                    />
                    <TextField
                      fullWidth
                      label={personal_details?.state_name}
                      name="state"
                      value={formData.state}
                      onChange={(e) => {
                        let value = e.target.value
                          .replace(/^\s+/, '')
                          .replace(/[^a-zA-Z\s]/g, '')
                          .replace(/\s+/g, ' ');
                        setFormData(prev => ({ ...prev, state: value }));
                        if (value.trim().length > 0 && errors.state === "State cannot start with a space") {
                          setErrors(prev => ({ ...prev, state: "" }));
                        }
                      }}
                      onBlur={() => handleBlur("state")}
                      onKeyDown={(e) => {
                        if (e.target.value === "" && e.key === " ") {
                          e.preventDefault();
                          setErrors(prev => ({ ...prev, state: "State cannot start with a space" }));
                        }
                      }}
                      error={!!errors.state}
                      helperText={errors.state}
                      size={isMobile ? "small" : "medium"}
                      inputProps={{
                        maxLength: 30,
                        pattern: "^[a-zA-Z][a-zA-Z ]*$",
                        title: "State must start with a letter and contain only letters and spaces"
                      }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label={personal_details?.zip}
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("zipCode")}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      maxLength: 6,
                      inputMode: 'numeric',
                      pattern: '\\d{6}',
                      title: 'Enter a valid 6-digit ZIP code'
                    }}
                  />
                </Box>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div variants={fadeInUp}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    style={{ color: "white" }}
                  >
                    Payment Method
                  </Typography>
                  <FormControl
                    component="fieldset"
                    error={!!errors.paymentMethod}
                  >
                    <RadioGroup
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={(e) => {
                        handleInputChange(e);
                        setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Paper
                          sx={{
                            mb: 2,
                            p: { xs: 2, sm: 3 },
                            transition: "all 0.3s ease",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                            border: errors.paymentMethod ? "1px solid" : "none",
                            borderColor: errors.paymentMethod
                              ? "error.main"
                              : "transparent",
                          }}
                        >
                          <FormControlLabel
                            value="cod"
                            control={<Radio />}
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <LocalShipping />
                                <Box>
                                  <Typography>Cash On Delivery</Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Pay when you receive
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        </Paper>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Paper
                          sx={{
                            p: { xs: 2, sm: 3 },
                            transition: "all 0.3s ease",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                            border: errors.paymentMethod ? "1px solid" : "none",
                            borderColor: errors.paymentMethod
                              ? "error.main"
                              : "transparent",
                          }}
                        >
                          <FormControlLabel
                            value="card"
                            control={<Radio />}
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <CreditCard />
                                <Box>
                                  <Typography>Credit/Debit Card</Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Secure online Payment
                                  </Typography>
                                </Box>
                              </Box>
                            }
                          />
                        </Paper>
                      </motion.div>
                    </RadioGroup>
                    {errors.paymentMethod && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "error.main",
                          }}
                        >
                          <ErrorOutline fontSize="small" />
                          <Typography variant="caption" color="error">
                            {errors.paymentMethod}
                          </Typography>
                        </Box>
                      </motion.div>
                    )}
                  </FormControl>
                </Box>
              </motion.div>
            )}

            {step === 3 &&
              formData.paymentMethod === "card" &&
              renderCardTypeSelection()}

            {step === 4 && formData.paymentMethod === "card" && (
              <motion.div variants={fadeInUp}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    maxHeight: "calc(100vh - 150px)",
                    overflow: "hidden",
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                    Card Details
                  </Typography>
                  {formData.cardType && (
                    <Typography variant="subtitle2" color="text.secondary">
                      {formData.cardType} Card
                    </Typography>
                  )}
                  <TextField
                    fullWidth
                    label={personal_details.card_number || "Loading..."}
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("cardNumber")}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    inputProps={{
                      maxLength: formData.cardType === "American Express" ? 17 : 19,
                      inputMode: 'numeric',
                      title: `Enter ${formData.cardType || 'card'} number`
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <TextField
                      label={personal_details.expiry || "Loading..."}
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("cardExpiry")}
                      error={!!errors.cardExpiry}
                      helperText={errors.cardExpiry}
                      placeholder="MM/YY"
                      inputProps={{ maxLength: 5 }}
                      size={isMobile ? "small" : "medium"}
                    />
                    <TextField
                      label={personal_details.cvv || "Loading..."}
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        e.target.value = numericValue;
                        handleInputChange(e);
                      }}
                      onBlur={() => handleBlur("cardCvc")}
                      error={!!errors.cardCvc}
                      helperText={errors.cardCvc}
                      type="password"
                      inputProps={{
                        maxLength: formData.cardType === "American Express" ? 4 : 3,
                        inputMode: 'numeric'
                      }}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                </Box>
              </motion.div>
            )}

            {((step === 3 && formData.paymentMethod === "cod") ||
              (step === 5 && formData.paymentMethod === "card")) && (
                <motion.div variants={fadeInUp}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      style={{ color: "white" }}
                    >
                      Confirm Order
                    </Typography>
                    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Delivery Address
                      </Typography>
                      <Typography color="text.secondary" paragraph>
                        {formData.name}
                        <br />
                        {formData.address}
                        <br />
                        {formData.city}, {formData.state} {formData.zipCode}
                        <br />
                        Phone: {formData.phone}
                      </Typography>
                      <Typography variant="subtitle1" gutterBottom>
                        Payment Method
                      </Typography>
                      <Typography color="text.secondary">
                        {formData.paymentMethod === "cod"
                          ? `Cash On Delivery`
                          : `${formData.cardType} Card`}
                      </Typography>
                    </Paper>
                  </Box>
                </motion.div>
              )}

            {((step === 4 && formData.paymentMethod === "cod") ||
              (step === 6 && formData.paymentMethod === "card")) && (
                <motion.div variants={fadeInUp}>
                  <Box sx={{ textAlign: "center" }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 60, sm: 80 },
                          height: { xs: 60, sm: 80 },
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          mb: 3,
                        }}
                      >
                        <Check sx={{ fontSize: { xs: 30, sm: 40 } }} />
                      </Box>
                    </motion.div>
                    <Typography
                      variant="h5"
                      gutterBottom
                      style={{ color: "white" }}
                    >
                      Order Confirmed!
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      Thank you for your purchase
                    </Typography>
                    <Paper
                      sx={{
                        p: { xs: 2, sm: 3 },
                        mt: 3,
                        background:
                          "linear-gradient(145deg, rgba(187, 134, 252, 0.1), rgba(3, 218, 198, 0.1))",
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Order Summary
                      </Typography>

                      <TableContainer
                        component={Paper}
                        sx={{ boxShadow: "none", background: "transparent" }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                Product
                              </TableCell>
                              <TableCell align="center">
                                Quantity
                              </TableCell>
                              <TableCell align="right">
                                Price
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cart?.items?.map((item) => (
                              <TableRow key={item.productId._id}>
                                <TableCell>{item.productId.name}</TableCell>
                                <TableCell align="center">
                                  {item.quantity}
                                </TableCell>
                                <TableCell align="right">
                                  {currencySymbol}
                                  {convertPrice(((item.productId.price - item.productId.discountPrice) * item.quantity).toFixed(2))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          px: 2,
                        }}
                      >
                        <Typography variant="subtitle1">
                          <strong>Your Cart</strong>
                        </Typography>
                        <Typography variant="subtitle1" color="primary">
                          <strong>{currencySymbol}{convertPrice(totalPrice)}</strong>
                        </Typography>

                      </Box>
                    </Paper>
                  </Box>
                </motion.div>
              )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 4,
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {step > 1 &&
                step < (formData.paymentMethod === "card" ? 6 : 4) && (
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    fullWidth={isMobile}
                  >
                    Back
                  </Button>
                )}
              {step === 1 && (
                <Button
                  variant="outlined"
                  onClick={onClose}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
              )}
              {step < (formData.paymentMethod === "card" ? 5 : 3) && (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  fullWidth={isMobile}
                  sx={{
                    background: " #BB86FC ",
                    "&:hover": {
                      background: " #02b3a9 ",
                    },
                  }}
                >
                  Next
                </Button>
              )}
              {((step === 3 && formData.paymentMethod === "cod") ||
                (step === 5 && formData.paymentMethod === "card")) && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    fullWidth={isMobile}
                    disabled={loading}
                    sx={{
                      background: " #BB86FC ",
                      "&:hover": {
                        background: " #02b3a9",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <span>Place Orders</span>
                    )}
                  </Button>
                )}
              {((step === 4 && formData.paymentMethod === "cod") ||
                (step === 6 && formData.paymentMethod === "card")) && (
                  <Button
                    variant="contained"
                    onClick={() => {
                      onClose()
                      window.location.reload()
                    }}
                    fullWidth={isMobile}
                    sx={{
                      background: " #BB86FC ",
                      "&:hover": {
                        background: " #02b3a9 ",
                      },
                    }}
                  >
                    Close
                  </Button>
                )}
            </Box>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </ThemeProvider>
  );
}                            
