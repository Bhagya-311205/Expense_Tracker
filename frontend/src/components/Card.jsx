import React from "react";
import { Link } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

function Card({
  title,
  subtitle,
  btnText,
  footerText,
  footerLinkText,
  footerLinkTo,
  onSubmit,
  children,
  footerLinks,
  disabled = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled && onSubmit) onSubmit(e);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-blue-100 shadow-sm">
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-blue-600">{title}</h1>
            {subtitle && <p className="text-md text-slate-800 ">{subtitle}</p>}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {children}

            {btnText && (
              <button
                type="submit"
                disabled={disabled}
                aria-busy={disabled}
                className={`w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  disabled
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {disabled ? (
                  <>
                    <CircularProgress size={12} color="inherit" />
                    <span>  Loading...</span>
                  </>
                ) : (
                  btnText
                )}
              </button>
            )}
          </form>

          {footerText && (
            <p className="text-center text-sm text-slate-600">
              {footerText}
              {footerLinkText && footerLinkTo && (
                <>
                  {" "}
                  <Link
                    to={footerLinkTo}
                    className="font-semibold text-blue-600 hover:text-blue-400"
                  >
                    {footerLinkText}
                  </Link>
                </>
              )}
            </p>
          )}

          {footerLinks && footerLinks.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              {footerLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={link.onClick}
                  className="font-semibold text-blue-600 hover:text-blue-400"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;
