import Card from "./Card";

function OtpVerify({
  onOtpSubmit,
  otp,
  setOtp,
  email,
  onChangeDetails,
  onResendOtp,
  loading,
}) {
  return (
    <Card
      title="TrackEx"
      subtitle="Verify your email address"
      btnText="Verify your Account"
      onSubmit={onOtpSubmit}
      disabled={loading}
      footerLinks={[
        { label: "Change details", onClick: onChangeDetails },
        { label: "Resend OTP", onClick: onResendOtp },
      ]}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">OTP Code</label>
        <input
          id="otp"
          name="otp"
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          className="w-full rounded-lg border border-slate-400 px-3 py-3 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      <p className="text-sm text-slate-600">
        OTP sent to <span className="font-medium text-blue-600">{email}</span>
      </p>
    </Card>
  );
}

export default OtpVerify;
