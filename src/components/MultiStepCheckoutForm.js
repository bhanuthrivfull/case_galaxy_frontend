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
import { useLanguage } from "../contexts/LanguageContext"

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
  const { translations, language } = useLanguage();
  console.log(JSON.stringify(translations.cards_data))
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

  // Validation patterns
  const patterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)*@[a-zA-Z]+(\.[a-zA-Z]{2,})+$/,
    phone: /^[6-9]\d{9}$/,
    city: /^[a-zA-Z\s]{2,50}$/,
    state: /^[a-zA-Z\s]{2,50}$/,
    zipCode: /^[\d]{6}$/,
    cardNumber: /^[\d]{16}$/,
    cardExpiry: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    cardCvc: /^[\d]{3}$/,
  }

  // Error messages
  const errorMessages = {
    name: "Name should contain only letters and spaces (2-50 characters)",
    email: "Please enter a valid email address",
    phone: "Phone number must be 10 digits and start with 6, 7, 8, or 9",
    address: "Address is required (minimum 10 characters",
    city: "Enter a valid city",
    state: "Enter a valid state",
    zipCode: "ZIP code must be 6 digits",
    cardNumber: "Card number must be 16 digits",
    cardExpiry: "Invalid expiry date (MM/YY)",
    cardCvc: "CVV must be 3 digits",
  }

  const personal_details = {
    "title": "Personal Details",
    "full_name": "Full Name",
    "name_err_msg": {
      "field": "name",
      "required_err": "is required",
      "err_msg": "Name should contain only letters and spaces (2-50 characters)"
    },
    "email": "Email",
    "email_err_msg": {
      "field": "email",
      "required_err": "is required",
      "err_msg": "Please enter a valid email address"
    },
    "phone": "Phone",
    "phone_err_msg": {
      "field": "phone",
      "required_err": "is required",
      "err_msg": "Phone number must be 10 digits and start with 6, 7, 8, or 9"
    },
    "address": "Address",
    "address_err_msg": {
      "field": "address",
      "required_err": "is required",
      "err_msg": "Address is required (minimum 10 characters)"
    },
    "city_name": "City",
    "city_err_msg": {
      "field": "city",
      "required_err": "is required",
      "err_msg": "Enter a valid city"
    },
    "state_name": "State",
    "state_err_msg": {
      "field": "state",
      "required_err": "is required",
      "err_msg": "Enter a valid state"
    },
    "zip": "Zip Code",
    "zipCode_err_msg": {
      "field": "zipCode",
      "required_err": "is required",
      "err_msg": "ZIP code must be 6 digits"
    },
    "card_number": "Card Number",
    "cardNumber_err_msg": {
      "field": "cardNumber",
      "required_err": "is required",
      "err_msg": "Card number must be 16 digits"
    },
    "expiry": "Expiry Date",
    "cardExpiry_err_msg": {
      "field": "cardExpiry",
      "required_err": "expiry is required",
      "err_msg": "Invalid expiry date (MM/YY)"
    },
    "cvv": "CVV",
    "cardCvc_err_msg": {
      "field": "cardCvc",
      "required_err": "cvv is required",
      "err_msg": "CVV must be 3 digits"
    }
  }

  const validateField = (name, value) => {
    const errorKey = `${name}_err_msg`;
    if (personal_details[errorKey]) {
      console.log();
      console.log(personal_details[errorKey].required_err);

      if (!value) return `${personal_details[errorKey].field.charAt(0).toUpperCase() + personal_details[errorKey].field.slice(1)} ${personal_details[errorKey].required_err}`
      const patterns = {
        name: /^[a-zA-Z][a-zA-Z\s]*$/, // Updated to prevent leading spaces
        // ... rest of your patterns
      }
      const validateField = (name, value) => {
        const errorKey = `${name}_err_msg`;
        if (personal_details[errorKey]) {
          if (!value) return `${personal_details[errorKey].required_err}`;

          // Email validation with the provided regex
          if (name === "email") {
            if (/\s/.test(value)) {
              return "Email cannot contain spaces";
            }
            if (!/^[a-zA-Z][a-zA-Z0-9](\.[a-zA-Z0-9]+)*@[a-zA-Z]+(\.[a-zA-Z]{2,})+$/.test(value)) {
              return "Invalid email format (e.g., user.name@domain.ab.cd / .xyz)";
            }
            if (value.indexOf("@") === -1) {
              return "Email must contain @ symbol";
            }
            if (value.indexOf(".") === -1) {
              return "Email must contain a domain (e.g., .com)";
            }
            if (value.startsWith("@") || value.endsWith("@")) {
              return "Invalid @ symbol position";
            }
            if (value.startsWith(".") || value.endsWith(".")) {
              return "Email cannot start or end with a dot";
            }
            if (value.indexOf("@.") > -1 || value.indexOf(".@") > -1) {
              return "Invalid character sequence (@. or .@)";
            }
            if (value.match(/\.{2,}/)) {
              return "Email cannot contain consecutive dots";
            }
          }

          // ... rest of your existing validations
        }
        return "";
      }

    }
    const validateField = (name, value) => {
      const errorKey = `${name}_err_msg`;
      if (personal_details[errorKey]) {
        if (!value) return `${personal_details[errorKey].required_err}`

        // Common validation for city and state
        if (name === "city" || name === "state") {
          if (/^\s/.test(value)) {
            return "Cannot start with space";
          }
          if (!/^[a-zA-Z]/.test(value)) {
            return "Must start with a letter";
          }
          if (value.length < 2) {
            return "Must be at least 2 characters";
          }
        }

        // Email validation
        if (name === "email") {
          if (/\s/.test(value)) {
            return "Cannot contain spaces";
          }
          if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)*@[a-zA-Z]+(\.[a-zA-Z]{2,})+$/.test(value)) {
            return "Invalid email format";
          }
        }

        // ... rest of your existing validations
      }
      return "";
    }
    if (name === "name") {
      if (/^\s/.test(value)) {
        return "Name cannot start with a space";
      }
      if (!/^[a-zA-Z]/.test(value)) {
        return "Name must start with a letter";
      }
      if (value.length < 3) {
        return "Name must be at least 3 characters";
      }
      if (value.length > 50) {
        return "Name cannot exceed 50 characters";
      }
    }

    //adress validation
    if (name === "address" && value.length < 10) return errorMessages.address

    if (name === "cardExpiry") {
      const [month, year] = value.split("/")
      const expiryDate = new Date(2000 + Number.parseInt(year), Number.parseInt(month) - 0)
      if (expiryDate <= new Date()) {
        return "Expiry date must be in the future"
      }
    }
    return ""
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
      ;["name", "email", "phone", "address", "city", "state", "zipCode"].forEach((field) => {
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
      ;["cardNumber", "cardExpiry", "cardCvc"].forEach((field) => {
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

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target
  //   let formattedValue = value

  //   // Format specific fields
  //   switch (name) {
  //     case "cardNumber":
  //       formattedValue = value
  //         .replace(/\s/g, "")
  //         .replace(/(\d{4})/g, "$1 ")
  //         .trim()
  //       break
  //     case "cardExpiry":
  //       formattedValue = value
  //         .replace(/\D/g, "")
  //         .replace(/(\d{2})(\d)/, "$1/$2")
  //         .slice(0, 5)
  //       break
  //     case "phone":
  //       formattedValue = value.replace(/\D/g, "").slice(0, 10)
  //       break
  //     case "zipCode":
  //       formattedValue = value.replace(/\D/g, "").slice(0, 6)
  //       break
  //     default:
  //       break
  //   }

  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: formattedValue,
  //   }))

  //   if (touched[name]) {
  //     const error = validateField(name, formattedValue)
  //     setErrors((prev) => ({ ...prev, [name]: error }))
  //   }
  // }



  const handleInputChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value
    switch (name) {
      case "cardNumber":
        formattedValue = value.replace(/\D/g, "");

        if (formattedValue.length > 16) {
          return;
        }

        formattedValue = formattedValue.replace(/(\d{4})/g, "$1 ").trim();
        break;
        if (name === "phone") {
          if (!value) return errorMessages.phone;
          if (!/^[6789]\d{9}$/.test(value)) return errorMessages.phone;
          if (/(\d)\1{6,}/.test(value)) {
            return "Phone number cannot have more than 6 identical consecutive digits";
          }
        }
      case "cardExpiry":
        formattedValue = value.replace(/\D/g, "");


        if (formattedValue.length >= 2) {
          let month = formattedValue.slice(0, 2);
          let year = formattedValue.slice(2, 4);


          if (parseInt(month) > 12) {
            month = "12";
          } else if (parseInt(month) < 1) {
            month = "01";
          }


          formattedValue = month + (year ? "/" + year : "");


          if (year.length === 2) {
            const currentYear = new Date().getFullYear() % 100;
            if (parseInt(year) < currentYear) {
              return;
            }
          }
        }


        formattedValue = formattedValue.slice(0, 5);
        break;
      case "address":
        // Prevent leading spaces
        formattedValue = value.replace(/^\s+/, '');
        // If user tries to type space at beginning, show error immediately
        if (value.startsWith(' ')) {
          setErrors(prev => ({
            ...prev,
            address: "Address cannot start with a space"
          }));
        }
        break;

      case "phone":
        let onlyNumbers = value.replace(/\D/g, "");

        // Check for more than 5 identical consecutive digits
        if (/(\d)\1{6,}/.test(onlyNumbers)) {
          setErrors(prev => ({
            ...prev,
            phone: "Phone number cannot have more than 6 identical consecutive digits"
          }));
          return; // Don't update the value
        }

        if (onlyNumbers.length > 0 && !/^[6789]/.test(onlyNumbers)) {
          return;
        }
        formattedValue = onlyNumbers.slice(0, 10);
        break;

      case "zipCode":
        formattedValue = value.replace(/\D/g, "").slice(0, 6)
        break
      case "name":
        // Prevent leading spaces and allow only letters with single spaces between
        formattedValue = value
          .replace(/^\s+/, '') // Remove leading spaces
          .replace(/[^a-zA-Z\s]/g, "") // Remove non-alphabet characters
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letters

        // If user tries to type space at beginning, show error immediately
        if (value.startsWith(' ')) {
          setErrors(prev => ({
            ...prev,
            name: "Name cannot start with a space"
          }));
        }
        break;
      case "email":
        formattedValue = value
          .replace(/[,#'"!$%^&*()<>?/|}{[\]`~=+]/g, "")
          .replace(/\s/g, "")
          .replace(/@{2,}/g, "@")
          .replace(/\.{2,}/g, ".")

        break;




      default:
        break
    };

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
      const validateField = (name, value) => {
        const errorKey = `${name}_err_msg`;
        if (personal_details[errorKey]) {
          if (!value) return `${personal_details[errorKey].required_err}`;

          // Email validation
          if (name === "email") {
            if (/\s/.test(value)) {
              return "Email cannot contain spaces";
            }
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
              return "Invalid email format (e.g., user@example.com)";
            }
            if (value.indexOf("@") === -1) {
              return "Email must contain @ symbol";
            }
            if (value.indexOf(".") === -1) {
              return "Email must contain a domain (e.g., .com)";
            }
            if (value.startsWith("@") || value.endsWith("@")) {
              return "Invalid @ symbol position";
            }
            if (value.startsWith(".") || value.endsWith(".")) {
              return "Email cannot start or end with a dot";
            }
            if (value.indexOf("@.") > -1 || value.indexOf(".@") > -1) {
              return "Invalid character sequence (@. or .@)";
            }
          }

          // ... rest of your existing validations
        }
        return "";
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
    "Discover"
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
                      // Clear error if user starts typing valid text after initial space
                      if (e.target.value.trim().length > 0 && errors.name === "Name cannot start with a space") {
                        setErrors(prev => ({ ...prev, name: "" }));
                      }
                    }}
                    onBlur={() => handleBlur("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      onKeyDown: (e) => {
                        // Prevent space as first character
                        if (e.target.value === "" && e.key === " ") {
                          e.preventDefault();
                          setErrors(prev => ({ ...prev, name: "Name cannot start with a space" }));
                        }
                        // Prevent multiple consecutive spaces
                        if (e.key === " " && e.target.value.slice(-1) === " ") {
                          e.preventDefault();
                        }
                      },
                      maxLength: 50, // Maximum 50 characters
                      pattern: "^[a-zA-Z][a-zA-Z ]{2,49}$", // Regex for 3-50 chars (1 letter + 2-49 letters/spaces)
                      title: "Name must be 3-50 characters, start with a letter, and only single spaces between words"
                    }}
                  />
                  {/* Email Field */}
                  <TextField
                    fullWidth
                    label={personal_details?.email}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      // Clean the input value
                      let value = e.target.value
                        .replace(/\s/g, '') // Remove all spaces
                        .replace(/[^a-zA-Z0-9.@_-]/g, "") // Remove special chars except allowed ones
                        .replace(/@+/g, "@") // Prevent multiple @ symbols
                        .replace(/\.+/g, ".") // Prevent multiple dots
                        .replace(/(\.@|@\.)/g, ""); // Prevent dots right before or after @

                      // Prevent dots at start or end of local part
                      const atIndex = value.indexOf("@");
                      if (atIndex > 0) {
                        const localPart = value.substring(0, atIndex);
                        value = localPart.replace(/^\.+|\.+$/g, "") + value.substring(atIndex);
                      }

                      // Prevent multiple dots in domain part
                      if (atIndex > -1) {
                        const domainPart = value.substring(atIndex);
                        value = value.substring(0, atIndex) + domainPart.replace(/\.+/g, ".");
                      }

                      setFormData(prev => ({ ...prev, email: value }));

                      // Clear error if user starts typing valid text
                      if (value.trim().length > 0 && errors.email) {
                        setErrors(prev => ({ ...prev, email: "" }));
                      }
                    }}
                    onBlur={() => handleBlur("email")}
                    onKeyDown={(e) => {
                      // Prevent space character
                      if (e.key === " ") {
                        e.preventDefault();
                        setErrors(prev => ({ ...prev, email: "Email cannot contain spaces" }));
                      }
                      // Prevent typing @ as first character
                      if (e.target.value === "" && e.key === "@") {
                        e.preventDefault();
                      }
                      // Prevent typing dot as first character
                      if (e.target.value === "" && e.key === ".") {
                        e.preventDefault();
                      }
                    }}
                    error={!!errors.email}
                    helperText={errors.email || ""}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      pattern: "^[a-zA-Z][a-zA-Z0-9]*(\\.[a-zA-Z0-9]+)*@[a-zA-Z]+(\\.[a-zA-Z]{2,})+$",
                      title: "Please enter a valid email address (e.g., user.name@domain.xyz/ .ab.cd)"
                    }}
                  />
                  <TextField
                    fullWidth
                    label={personal_details?.phone}
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");

                      // Prevent more than 5 identical consecutive digits
                      if (/(\d)\1{6,}/.test(value)) {
                        setErrors(prev => ({
                          ...prev,
                          phone: "Phone number cannot have more than 6 identical consecutive digits"
                        }));
                        return;
                      }

                      // Prevent numbers not starting with 6-9
                      if (value.length > 0 && !/^[6789]/.test(value)) {
                        return;
                      }

                      // Limit to 10 digits
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
                      // Clear error if user starts typing valid text after initial space
                      if (e.target.value.trim().length > 0 && errors.address === "Address cannot start with a space") {
                        setErrors(prev => ({ ...prev, address: "" }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("address");
                      // Additional validation for minimum length
                      if (formData.address.trim().length > 0 && formData.address.trim().length < 10) {
                        setErrors(prev => ({ ...prev, address: errorMessages.address }));
                      }
                    }}
                    error={!!errors.address}
                    helperText={errors.address}
                    size={isMobile ? "small" : "medium"}
                    inputProps={{
                      onKeyDown: (e) => {
                        // Prevent space as first character
                        if (e.target.value === "" && e.key === " ") {
                          e.preventDefault();
                          setErrors(prev => ({ ...prev, address: "Address cannot start with a space" }));
                        }
                      },
                      maxLength: 250,
                      pattern: "^\\S+(?: \\S+)*$", // Regex to prevent leading/trailing spaces
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
                    {/* City Field */}
                    <TextField
                      fullWidth
                      label={personal_details?.city_name}
                      name="city"
                      value={formData.city}
                      onChange={(e) => {
                        // Remove leading spaces and allow only letters and single spaces
                        let value = e.target.value
                          .replace(/^\s+/, '') // Remove leading spaces
                          .replace(/[^a-zA-Z\s]/g, '') // Remove non-alphabet characters
                          .replace(/\s+/g, ' '); // Replace multiple spaces with single space

                        // Update the form data
                        setFormData(prev => ({ ...prev, city: value }));

                        // Clear error if user starts typing valid text after initial space
                        if (value.trim().length > 0 && errors.city === "City cannot start with a space") {
                          setErrors(prev => ({ ...prev, city: "" }));
                        }
                      }}
                      onBlur={() => handleBlur("city")}
                      onKeyDown={(e) => {
                        // Prevent space as first character
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

                    {/* State Field */}
                    <TextField
                      fullWidth
                      label={personal_details?.state_name}
                      name="state"
                      value={formData.state}
                      onChange={(e) => {
                        // Remove leading spaces and allow only letters and single spaces
                        let value = e.target.value
                          .replace(/^\s+/, '') // Remove leading spaces
                          .replace(/[^a-zA-Z\s]/g, '') // Remove non-alphabet characters
                          .replace(/\s+/g, ' '); // Replace multiple spaces with single space

                        // Update the form data
                        setFormData(prev => ({ ...prev, state: value }));

                        // Clear error if user starts typing valid text after initial space
                        if (value.trim().length > 0 && errors.state === "State cannot start with a space") {
                          setErrors(prev => ({ ...prev, state: "" }));
                        }
                      }}
                      onBlur={() => handleBlur("state")}
                      onKeyDown={(e) => {
                        // Prevent space as first character
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
                      maxLength: 19,
                      inputMode: 'numeric',
                      pattern: "[0-9\\s]{13,19}",
                      title: "Enter a valid 16-digit card number"
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
                        // Only allow numbers
                        const numericValue = e.target.value.replace(/\D/g, '');
                        e.target.value = numericValue; // Update the event value
                        handleInputChange(e); // Call the existing handler
                      }}
                      onBlur={() => handleBlur("cardCvc")}
                      error={!!errors.cardCvc}
                      helperText={errors.cardCvc}
                      type="password"
                      inputProps={{
                        maxLength: 3,
                        inputMode: 'numeric' // Shows numeric keyboard on mobile devices
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
                                  {language === "en" ? "₹" : "¥"}
                                  {((item.productId.price - item.productId.discountPrice) * item.quantity).toFixed(2)}
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
                          <strong>{language === "en" ? "₹" : "¥"}{totalPrice}</strong>
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
                    background:
                      " #BB86FC ",
                    "&:hover": {
                      background:
                        " #02b3a9 ",
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
                      background:
                        " #BB86FC ",
                      "&:hover": {
                        background:
                          " #02b3a9",
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
                      background:
                        " #BB86FC ",
                      "&:hover": {
                        background:
                          " #02b3a9 ",
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

