import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoginForm from "../components/LoginForm";
import { authAPI } from "../services/api";
import OtpVerify from "../components/OtpVerify";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [hasError, setHasError] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showOtpView, setShowOtpView] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setHasError(true);
      toast.error("Please enter Email !");
      return;
    }

    if (!password) {
      setHasError(true);
      toast.error("Please enter Password !");
      return;
    }
    setLoading(true);
    setHasError(false);

    try {
      const response = await authAPI.login(trimmedEmail, password);

      if (!response.requiresOTP) {
        setIsLoggedIn(true);
        toast.success("Already logged in!");
        navigate("/Dashboard");
      } else {
        setShowOtpView(true);
        toast.success(response.message);
      }
    } catch (error) {
      setHasError(true);
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      await authAPI.verifyOTP(email.trim(), otp);
      setIsLoggedIn(true);
      toast.success("Login successful!");
      navigate("/Dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setShowOtpView(false);
    setOtp("");
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await authAPI.resendOTP(email.trim());
      toast.success(response.message);
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (showOtpView) {
    return (
      <OtpVerify
        onOtpSubmit={handleOtpSubmit}
        otp={otp}
        setOtp={setOtp}
        email={email}
        onChangeDetails={handleChangeEmail}
        onResendOtp={handleResendOtp}
        loading={loading}
      />
    );
  }

  return (
    <LoginForm
      onEmailSubmit={handleSubmit}
      hasError={hasError}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      loading={loading}
    />
  );
}

export default Login;
