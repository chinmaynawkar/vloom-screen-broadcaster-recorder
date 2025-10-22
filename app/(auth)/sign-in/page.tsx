"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

/**
 * Enhanced SignIn Page Component
 *
 * Modern, professional sign-in page with improved UX/UI design.
 * Features glassmorphism, subtle animations, and better visual hierarchy.
 */
const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="sign-in">
      {/* Enhanced Background with Animated Elements */}
      <div className="overlay" />
      <div className="floating-elements">
        <div className="floating-circle circle-1" />
        <div className="floating-circle circle-2" />
        <div className="floating-circle circle-3" />
      </div>

      {/* Left Section - Enhanced Testimonial */}
      <aside className="testimonial">
        <div className="testimonial-content">
          <Link href="/" className="logo-link brand-link">
            <div className="logo-container">
              <Image
                src="/assets/icons/logo.svg"
                alt="Vloom Logo"
                width={40}
                height={40}
                className="logo-icon brand-icon"
              />
              <h1 className="logo-text brand-text">Vloom</h1>
            </div>
          </Link>

          <div className="testimonial-card">
            <div className="stars-container">
              {Array.from({ length: 5 }).map((_, index) => (
                <Image
                  src="/assets/icons/star.svg"
                  alt="Star Icon"
                  width={24}
                  height={24}
                  key={index}
                  className="star-icon"
                />
              ))}
            </div>

            <blockquote className="testimonial-text">
              "Vloom makes screen recording effortless. From quick walkthroughs
              to full presentations, it's fast, smooth, and shareable in
              seconds."
            </blockquote>

            <div className="testimonial-author">
              <div className="author-avatar">
                <Image
                  src="/assets/images/jason.png"
                  alt="Jason Rivera"
                  width={56}
                  height={56}
                  className="author-image"
                />
                <div className="avatar-ring" />
              </div>
              <div className="author-info">
                <h3 className="author-name">Jason Rivera</h3>
                <p className="author-title">Product Designer, NovaByte</p>
              </div>
            </div>
          </div>

          <div className="features-preview">
            <div className="feature-item">
              <div className="feature-icon">
                <Image
                  src="/assets/icons/record.svg"
                  alt="Record"
                  width={20}
                  height={20}
                  className="feature-icon-white"
                />
              </div>
              <span>One-click recording</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Image
                  src="/assets/icons/link.svg"
                  alt="Share"
                  width={20}
                  height={20}
                  className="feature-icon-white"
                />
              </div>
              <span>Instant sharing</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Image
                  src="/assets/icons/upload.svg"
                  alt="Cloud"
                  width={20}
                  height={20}
                  className="feature-icon-white"
                />
              </div>
              <span>Cloud storage</span>
            </div>
          </div>
        </div>

        <footer className="testimonial-footer">
          <p>© Vloom 2025 • Made with ❤️ for creators</p>
        </footer>
      </aside>

      {/* Right Section - Enhanced Sign-in Form */}
      <aside className="google-sign-in">
        <div className="sign-in-container">
          <div className="sign-in-header">
            <Link href="/" className="brand-link">
              <Image
                src="/assets/icons/logo.svg"
                alt="Vloom Logo"
                width={48}
                height={48}
                className="brand-icon"
              />
              <h1 className="brand-text font-bold text-2xl">Vloom</h1>
            </Link>

            <div className="welcome-content">
              <h2 className="welcome-title">
                Welcome to the future of
                <span className="highlight"> screen recording</span>
              </h2>
              <p className="welcome-subtitle">
                Join thousands of creators who are already using Vloom to
                capture, share, and engage with their audience.
              </p>
            </div>
          </div>

          <div className="sign-in-form">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`sign-in-button ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <Image
                  src="/assets/icons/google.svg"
                  alt="Google Icon"
                  width={20}
                  height={20}
                />
              )}
              <span>
                {isLoading ? "Signing you in..." : "Continue with Google"}
              </span>
            </button>

            {/* Optional divider removed since we only support Google sign-in for now */}
          </div>

          <div className="trust-indicators">
            <div className="trust-item badge-secure">
              <Image
                src="/assets/icons/check.svg"
                alt="Secure"
                width={16}
                height={16}
                className="trust-icon"
              />
              <span>Secure & Private</span>
            </div>
            <div className="trust-item badge-free">
              <Image
                src="/assets/icons/checkmark.svg"
                alt="Free"
                width={16}
                height={16}
                className="trust-icon"
              />
              <span>Free to start</span>
            </div>
            <div className="trust-item badge-setup">
              <Image
                src="/assets/icons/check.svg"
                alt="No setup"
                width={16}
                height={16}
                className="trust-icon"
              />
              <span>No setup required</span>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
};

export default SignIn;
