import React from "react";
import Card from "./Card";

function LoginForm({
  onEmailSubmit,
  hasError,
  email,
  setEmail,
  password,
  setPassword,
  loading,
}) {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputClass = hasError
    ? "w-full rounded-lg border border-red-500 px-3 py-3 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
    : "w-full rounded-lg border border-slate-300 px-3 py-3 text-sm text-black bg-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <Card
      title="TrackEx"
      subtitle="Sign in to your account"
      btnText={"Sign in"}
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/SignUp"
      onSubmit={onEmailSubmit}
      disabled={loading}
    >
      <div className="space-y-2">
        <label className="text-md font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-md font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={`${inputClass} pr-12`}
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
    </Card>
  );
}

export default LoginForm;
