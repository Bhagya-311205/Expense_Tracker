import React from "react";
import Card from "./Card";

function SignUpForm({
  onSubmit,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  return (
    <Card
      title="TrackEx"
      subtitle="Create your account"
      btnText="Create Account"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkTo="/"
      onSubmit={onSubmit}
      disabled={loading}
    >
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="fullName"
        >
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 pr-12 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-slate-800"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.25 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 pr-12 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-600 hover:text-slate-800"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.25 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

export default SignUpForm;
