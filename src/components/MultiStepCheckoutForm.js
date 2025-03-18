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
  const { translations } = useLanguage();
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
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z]{2,}\.[a-zA-Z]{2,}$/,
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
    name: translations?.personal_details?.name_err_msg?.err_msg,
    email: translations?.personal_details?.email_err_msg?.err_msg,
    phone: translations?.personal_details?.phone_err_msg?.err_msg,
    address: translations?.personal_details?.address_err_msg?.err_msg,
    city: translations?.personal_details?.city_err_msg?.err_msg,
    state: translations?.personal_details?.state_err_msg?.err_msg,
    zipCode: translations?.personal_details?.zipCode_err_msg?.err_msg,
    cardNumber: translations?.personal_details?.cardNumber_err_msg?.err_msg,
    cardExpiry: translations?.personal_details?.cardExpiry_err_msg?.err_msg,
    cardCvc: translations?.personal_details?.cardCvc_err_msg?.err_msg,
  }

  const validateField = (name, value) => {
    const errorKey = `${name}_err_msg`;
    if (translations?.personal_details[errorKey]) {
      console.log();
      console.log(translations?.personal_details[errorKey].required_err);

      if (!value) return `${translations?.personal_details[errorKey].field.charAt(0).toUpperCase() + translations?.personal_details[errorKey].field.slice(1)} ${translations?.personal_details[errorKey].required_err}`
      if (patterns[name] && !patterns[name].test(value.replace(/\s/g, ""))) {
        return errorMessages[name]
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
        
      case "phone":
        let onlyNumbers = value.replace(/\D/g, ""); 
        if (onlyNumbers.length > 0 && !/^[6789]/.test(onlyNumbers)) {
          return;
        }
        formattedValue = onlyNumbers.slice(0, 10); 
        break;
      
      case "zipCode":
        formattedValue = value.replace(/\D/g, "").slice(0, 6)
        break
      case "name":
        formattedValue = value
          .replace(/[^a-zA-Z\s]/g, "") 
          .replace(/\b\w/g, (char) => char.toUpperCase()); 
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

  const renderCardTypeSelection = () => (
    <motion.div variants={fadeInUp}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Typography variant="h5" gutterBottom style={{ color: "white" }}>
         {translations?.select_card_type || "Loading..."}
        </Typography>
        <FormControl component="fieldset" error={!!errors.cardType}>
          <RadioGroup name="cardType" value={formData.cardType} onChange={handleInputChange}>
            {translations?.cards_data.map((type) => (
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
              {translations?.details_title || "Loading..."}
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
              {translations?.payment_title || "Loading..."}
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
              {translations?.confirm_title || "Loading..."}
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
                    {translations?.personal_details.title || "Loading...."}
                  </Typography>
                  <TextField
                    fullWidth
                    label={translations?.personal_details?.full_name}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("name")}
                    error={!!errors.name}
                    helperText={errors.name}
                    size={isMobile ? "small" : "medium"}

                  />

                  <TextField
                    fullWidth
                    label={translations?.personal_details?.email}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("email")}
                    error={!!errors.email}
                    helperText={errors.email}
                    size={isMobile ? "small" : "medium"}
                  />
                  <TextField
                    fullWidth
                    label={translations?.personal_details?.phone}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    size={isMobile ? "small" : "medium"}
                  />
                  <TextField
                    fullWidth
                    label={translations?.personal_details?.address}
                    name="address"
                    multiline
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("address")}
                    error={!!errors.address}
                    helperText={errors.address}
                    size={isMobile ? "small" : "medium"}
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
                      label={translations?.personal_details?.city_name}
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("city")}
                      error={!!errors.city}
                      helperText={errors.city}
                      size={isMobile ? "small" : "medium"}
                    />
                    <TextField
                      fullWidth
                      label={translations?.personal_details?.state_name}
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("state")}
                      error={!!errors.state}
                      helperText={errors.state}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label={translations?.personal_details?.zip}
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
                    {translations?.payment_method || "Loading..."}
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
                                  <Typography>{translations?.cash_on_delivery || "Loading..."}</Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {translations?.Pay_when_you_receive || "Loading.."}
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
                                  <Typography>{translations?.Credit_Debit_Card || "Loading..."}</Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {translations?.Secure_online_payment || "Loading..."}
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
                    maxHeight: "calc(100vh - 150px)", // Restrict max height to prevent scroll
                    overflow: "hidden", // Ensures no unnecessary scrolling
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
                    {translations?.card_details || "Loading..."}
                  </Typography>
                  <TextField
                    fullWidth
                    label={translations?.personal_details.card_number || "Loading..."}
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur("cardNumber")}
                    error={!!errors.cardNumber}
                    helperText={errors.cardNumber}
                    inputProps={{ maxLength: 19 }}
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
                      label={translations?.personal_details.expiry || "Loading..."}
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
                      label={translations?.personal_details.cvv || "Loading..."}
                      name="cardCvc"
                      value={formData.cardCvc}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur("cardCvc")}
                      error={!!errors.cardCvc}
                      helperText={errors.cardCvc}
                      type="password"
                      inputProps={{ maxLength: 3 }}
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
                      {translations?.confirm_order || "Loading..."}
                    </Typography>
                    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {translations?.Delivery_Address || "Loading..."}
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
                        {translations?.payment_method || "Loading..."}
                      </Typography>
                      <Typography color="text.secondary">
                        {formData.paymentMethod === "cod"
                          ? `${translations?.cash_on_delivery}`
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
                      {translations?.order_confirmed || "Loading..."}!
                    </Typography>
                    <Typography color="text.secondary" paragraph>
                      {translations?.thank_you_purchase || "Loading..."}
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
                       {translations?.order_summary || "Loading..."}
                      </Typography>

                      <TableContainer
                        component={Paper}
                        sx={{ boxShadow: "none", background: "transparent" }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <strong>{translations?.order_product || "Loading.."}</strong>
                              </TableCell>
                              <TableCell align="center">
                                <strong>{translations?.order_quantity || "Loading.."}</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>{translations?.order_price || "Loading.."}</strong>
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
                                  ₹
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
                          <strong>{translations?.cart_modal?.total || "Loading..."}</strong>
                        </Typography>
                        <Typography variant="subtitle1" color="primary">
                          <strong>₹{totalPrice}</strong>
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
                    {translations?.btn_back || "Loading..."}
                  </Button>
                )}
              {step === 1 && (
                <Button
                  variant="outlined"
                  onClick={onClose}
                  fullWidth={isMobile}
                >
                  {translations?.btn_cancel || "Loading..."}
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
                  {translations?.btn_next || "Loading..."}
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
                     <span>{translations?.btn_place_order}</span>
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
                    {translations?.btn_close || "Loading..."}
                  </Button>
                )}
            </Box>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </ThemeProvider>
  );
}

