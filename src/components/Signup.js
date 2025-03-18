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
  const { translations } = useLanguage();

  const schema = yup.object().shape({
    name: yup
      .string()
      .required(translations?.sign_up?.err_msg_name_req)
      .min(2, translations?.sign_up?.err_msg_two_char)
      .matches(/^[a-zA-Z\s]*$/, translations?.sign_up?.err_contain_letters),
    email: yup
      .string()
      .email(translations?.sign_up?.err_valid_email)
      .required(translations?.sign_up?.err_email_required)
      .test("is-valid-domain",translations?.sign_up?.err_valid_domain, (value) => {
        if (!value) return false;
        const domain = value.split("@")[1];
        if (!domain) return false;

        const domainParts = domain.split(".");
        if (domainParts.length < 2) return false;

        const topLevelDomain = domainParts[domainParts.length - 1];
        return (
          !domain.startsWith("example.") &&
          !domain.endsWith(".test") &&
          /^[a-zA-Z.-]+$/.test(domain) &&
          topLevelDomain.length >= 2
        );
      }),
    password: yup
      .string()
      .required(translations?.sign_up?.err_psw_required)
      .min(8, translations?.sign_up?.err_psw_char)
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, translations?.sign_up?.err_psw_contain
      ),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null],  translations?.sign_up?.err_psw_match)
      .required(translations?.sign_up?.confirm_psw),
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
          {translations?.sign_up?.title || "Loading..."}
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
                {translations?.sign_up?.account_created || "Loading..."}
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
                label={translations?.sign_up?.full_name_label || "Loading"}
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
                label={translations?.sign_up?.email_address_label || "Loading"}
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
                label={translations?.sign_up?.psw_label || "Loading"}
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
                label={translations?.sign_up?.confirm_psw_label || "Loading"}
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
             <span>{translations?.sign_up?.title || "Loading"}</span>
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
              {translations?.sign_up?.already_have_account || "Loading"}
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
              {translations?.sign_up?.login_here || "Loading"}
            </Link>
          </Box>
        </Box>
      </motion.div>
    </AuthLayout>
  );
};

export default Signup;
