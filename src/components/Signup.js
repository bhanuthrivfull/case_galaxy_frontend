// src/components/Signup.js
import React, { useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "./AuthLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const Signup = () => {

  const schema = yup.object().shape({
    name: yup
      .string()
      .required("Name is required.")
      .test(
        "no-special-chars",
        "Name cannot contain special characters.",
        (value) => !/[!@#$%^&*(),?":{}|<>\-_=+]/.test(value)
      )
      .test(
        "no-start-with-space",
        "Name should not start with a space.",
        (value) => !/^ /.test(value)
      )
      .test(
        "no-multiple-spaces",
        "Name should not contain multiple consecutive spaces.",
        (value) => !/\s{2,}/.test(value)
      )
      .test(
        "no-numbers",
        "Name cannot contain numbers.",
        (value) => !/\d/.test(value)
      )
      .matches(
        /^[A-Z][a-zA-Z\s]{2,39}$/,
        "Name must start with a capital letter, contain only letters and spaces, and be between 3 to 40 characters long."
      )
      ,
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
        "Please enter a valid email address (user@domain.com)."
      )
      .test(
        "min-length",
        "Email must be at least 13 characters long.",
        (value) => !value || value.length >= 13
      ),
    password: yup
      .string()
      .required("Password is required.")
      .test(
        "no-whitespace",
        "Password cannot contain spaces.",
        (value) => !value || !/\s/.test(value)
      )
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/,
        "Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)."
      ),
    confirmPassword: yup
      .string()
      .required("Confirm Password is required.")
      .oneOf([yup.ref("password"), null], "Passwords must match."),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const { signup } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError("");

      const userData = {
        name: data.name.trim(),
        email: data.email.toLowerCase(),
        password: data.password,
      };

      await signup(userData);

      setSuccess(true);
      reset();

      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "An error occurred during signup");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
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

  const alertAnimation = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <AuthLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={formAnimation}
        className="w-full max-w-md mx-auto"
      >
        <Typography
          component="h1"
          variant="h4"
          gutterBottom
          align="center"
          style={{ fontStyle: "italic", fontWeight: "bold" }}
        >
          {"Create Account"}
        </Typography>

        <AnimatePresence>
          {error && (
            <motion.div {...alertAnimation}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div {...alertAnimation}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {"Account created successfully! Redirecting..."}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{
            mt: 1,
            width: "100%",
            "& .MuiTextField-root": { mb: 2 },
          }}
        >
          <Controller
            name="name"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                id="name"
                label={"Full Name"}
                autoComplete="name"
                autoFocus
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                id="email"
                label={"Email Address"}
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
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
                required
                fullWidth
                label={"Password"}
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
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
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                required
                fullWidth
                label={"Confirm Password"}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
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
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              height: 56,
              borderRadius: 2,
              fontSize: "1rem",
              textTransform: "none",
              transition: "all 0.3s ease",
              position: "relative",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
             <span>{"Create Account"}</span>
            )}
          </Button>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: isMobile ? "column" : "row",
              gap: 1,
              mt: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {"Already have an account?"}
            </Typography>
            <Link
              href="/login"
              variant="body2"
              sx={{
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {"Log in here"}
            </Link>
          </Box>
        </Box>
      </motion.div>
    </AuthLayout>
  );
};

export default Signup;
