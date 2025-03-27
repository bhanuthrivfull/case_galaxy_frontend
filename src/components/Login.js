// src/components/Login.js
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Typography,
  Link,
  Box,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "./AuthLayout";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const Login = () => {
  const { translations } = useLanguage();

  const schema = yup.object().shape({
    email: yup
  .string()
  .required("Email is required.")
  .transform((value) => value.toLowerCase())
  .test(
    "max-length",
    "Email cannot exceed 50 characters.",
    (value) => !value || value.length <= 50
  )
  .test(
    "no-special-chars",
    "Email cannot contain special characters.",
    (value) => !value || !/[!#$%^&*(),?":{}|<>\-_=+]/.test(value)
  )
  .test(
    "starts-with-letter",
    "Email must start with a letter.",
    (value) => !value || /^[a-zA-Z]/.test(value)
  )
  .matches(
    /^[a-zA-Z](?!.*\.\.)[a-zA-Z0-9]*(?:\.[a-zA-Z0-9]+)*@[a-zA-Z]+\.(?:com|org|net|edu|gov|co|io|in|biz|info|tv|us|ca|uk|eu)$/,
    "Please enter a valid email address (xxx@domain.com)."
  )
  .test(
    "min-length",
    "Email must be at least 13 characters long.",
    (value) => !value || value.length >= 13
  ),
    password: yup
      .string()
      .required( "Password is required.")
      .test(
        "no-whitespace",
        "Password cannot contain spaces.",
        (value) => !value || !/\s/.test(value)
      )
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/,
        "Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)."
      ),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { login, resetInactivityTimeout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setGlobalError] = useState("");

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setGlobalError("");

      const user = await login(data.email, data.password);
      resetInactivityTimeout();

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        window.location.replace("/");
      }
    } catch (err) {
      setGlobalError(err.message || "Login failed. Please try again.");

      if (err.response?.data?.errors) {
        Object.keys(err.response.data.errors).forEach((key) => {
          setError(key, {
            type: "manual",
            message: err.response.data.errors[key],
          });
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <AuthLayout>
      <motion.div initial="hidden" animate="visible" variants={formAnimation}>
        <Typography component="h1" variant="h4" gutterBottom align="center" style={{ fontStyle: "italic", fontWeight: "bold" }}>
          {"Log In"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            mt: 1,
            width: "100%",
            maxWidth: "400px",
            mx: "auto",
          }}
        >
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="email"
                label={"Email Address"}
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                onChange={(e) => {
                  const lowercaseValue = e.target.value.toLowerCase();
                  field.onChange({
                    target: {
                      name: e.target.name,
                      value: lowercaseValue
                    }
                  });
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label={"Password"}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              height: 56,
              borderRadius: 2,
              fontSize: "1rem",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              },
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Link
              href="/forgot-password"
              variant="body2"
              sx={{ mb: isMobile ? 1 : 0, color: "blue" }}
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgotpassword");
              }}
            >
              {"Forgot password?"}
            </Link>
            <Link
              href="/signup"
              variant="body2"
              onClick={(e) => {
                e.preventDefault();
                navigate("/signup");
              }}
            >
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;