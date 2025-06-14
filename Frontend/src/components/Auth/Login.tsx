import React, { useState } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Eye, EyeOff, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const params = new URLSearchParams(location.search);
  const redirectAfterLogin = params.get('redirect') || '/';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://eduplaybackend.vercel.app/Login', {
        username,
        password
      });

      if (response.data.success) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify({
          username,
          ...response.data.user
        }));

        toast.success('Login successful!');
        setTimeout(() => {
          navigate(redirectAfterLogin);
        }, 1500);
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black py-12"
    >
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        toastStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white'
        }}
      />

      {/* Hexagonal Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015] z-0">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="login-hexagons"
              x="0"
              y="0"
              width="20"
              height="17.32"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="10,1 18.66,6 18.66,16 10,21 1.34,16 1.34,6"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
              <polygon
                points="20,9.5 28.66,14.5 28.66,24.5 20,29.5 11.34,24.5 11.34,14.5"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-hexagons)" />
        </svg>
      </div>

      {/* Animated Hexagonal Elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 right-20 opacity-[0.03]"
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 95,32.5 95,77.5 60,100 25,77.5 25,32.5"
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
          <polygon
            points="60,25 80,37.5 80,62.5 60,75 40,62.5 40,37.5"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>

      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-32 left-16 opacity-[0.02]"
      >
        <svg width="80" height="80" viewBox="0 0 80 80">
          <polygon
            points="40,5 65,22.5 65,57.5 40,75 15,57.5 15,22.5"
            fill="none"
            stroke="white"
            strokeWidth="0.8"
          />
        </svg>
      </motion.div>

      {/* Subtle Gradient Overlay */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-transparent to-transparent"
      />

      {/* Floating Gradient Elements */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.02, 0.04, 0.02],
          rotate: [0, 60, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[600px] h-[600px] -top-80 -right-80"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl transform rotate-45" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.015, 0.03, 0.015],
          rotate: [0, -60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[500px] h-[500px] -bottom-80 -left-80"
      >
        <div className="w-full h-full bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl transform -rotate-45" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 max-w-md md:max-w-3xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative p-8 md:p-12 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle Hexagonal Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.015] hover:opacity-[0.03] transition-opacity duration-500">
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 60 60"
            >
              <polygon
                points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5"
                fill="none"
                stroke="white"
                strokeWidth="0.3"
              />
              <polygon
                points="30,15 40,22.5 40,37.5 30,45 20,37.5 20,22.5"
                fill="none"
                stroke="white"
                strokeWidth="0.2"
              />
            </svg>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-10 md:mb-12">
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm font-medium mb-6 backdrop-blur-sm"
              >
                <LogIn className="w-4 h-4 text-blue-400" />
                Welcome Back
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight leading-tight">
                Sign In to
                <span className="relative ml-2">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text font-medium">
                    BrainBolt
                  </span>
                  <motion.div
                    animate={{
                      scale: [1, 1.02, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-lg blur-xl -z-10"
                  />
                </span>
              </h1>
              
              <p className="text-white/60 text-base md:text-lg font-light">
                Don't have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/signup')}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
                >
                  Create one
                </motion.button>
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                variants={itemVariants}
                className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center backdrop-blur-sm"
              >
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-light">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <motion.form 
              variants={itemVariants} 
              onSubmit={handleSubmit} 
              className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0"
            >
              {/* Username Field */}
              <motion.div variants={itemVariants} className="col-span-1">
                <label htmlFor="username" className="block text-sm font-light text-white/70 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm font-light text-sm"
                  placeholder="Enter your username"
                />
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="col-span-1">
                <label htmlFor="password" className="block text-sm font-light text-white/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm font-light text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div variants={itemVariants} className="col-span-2 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-400 focus:ring-blue-400/50 border-white/20 rounded bg-white/[0.02] backdrop-blur-sm"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/60 font-light">
                    Remember me
                  </label>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  className="text-sm font-light text-blue-400 hover:text-blue-300 transition-colors duration-300"
                >
                  Forgot password?
                </motion.button>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="col-span-2">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={isLoading ? {} : { scale: 1.02 }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                  className={`group relative w-full flex justify-center items-center gap-2 py-3 px-6 rounded-full text-base font-medium transition-all duration-300 ${
                    isLoading 
                      ? "bg-white/10 text-white/50 cursor-not-allowed" 
                      : "bg-white text-black hover:bg-white/90 hover:shadow-2xl hover:shadow-white/20"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.form>
          </div>

          {/* Subtle Glow Effect on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.02 }}
          />
        </motion.div>
      </div>
    </section>
  );
};