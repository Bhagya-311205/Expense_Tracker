import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SignUpForm from "../components/SignUpForm";
import { authAPI } from "../services/api";
import OtpVerify from "../components/OtpVerify";

function SignUp({ setIsLoggedIn }) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [showOtpView, setShowOtpView] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [tempUser, setTempUser] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.signup(fullName, trimmedEmail, password);

      const user = {
        name: fullName.trim(),
        email: trimmedEmail,
        password: password,
      };
      setTempUser(user);
      setShowOtpView(true);
      toast.success(response.message);
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);
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
      const verifyResponse = await authAPI.verifyOTP(tempUser.email, otp);
      toast.success(verifyResponse.message);
      setIsLoggedIn(true);
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeDetails = () => {
    setShowOtpView(false);
    setOtp("");
    // Restore form values from tempUser so user can edit them
    if (tempUser.name) {
      setFullName(tempUser.name);
    }
    if (tempUser.email) {
      setEmail(tempUser.email);
    }
    if (tempUser.password) {
      setPassword(tempUser.password);
      setConfirmPassword(tempUser.password);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response = await authAPI.resendOTP(tempUser?.email);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
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
        email={tempUser?.email}
        onChangeDetails={handleChangeDetails}
        onResendOtp={handleResendOtp}
        loading={loading}
      />
    );
  }

  return (
    <SignUpForm
      onSubmit={handleSubmit}
      fullName={fullName}
      setFullName={setFullName}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      confirmPassword={confirmPassword}
      setConfirmPassword={setConfirmPassword}
      loading={loading}
    />
  );
}

export default SignUp;
