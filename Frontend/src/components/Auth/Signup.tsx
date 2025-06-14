import React, { useState } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Eye, EyeOff, UserPlus, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

export const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
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
  const redirectAfterSignup = params.get('redirect') || '/login';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check password strength when password field changes
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-white/10';
    if (passwordStrength === 1) return 'bg-red-500/50';
    if (passwordStrength === 2) return 'bg-yellow-500/50';
    if (passwordStrength === 3) return 'bg-blue-500/50';
    return 'bg-green-500/50';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthTextColor = () => {
    if (passwordStrength === 0) return 'text-white/30';
    if (passwordStrength === 1) return 'text-red-400';
    if (passwordStrength === 2) return 'text-yellow-400';
    if (passwordStrength === 3) return 'text-blue-400';
    return 'text-green-400';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordStrength < 2) {
      setError('Please use a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('https://eduplaybackend.vercel.app/Signup', {
        username: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Check for 200 status code as successful response
      if (response.status === 200) {
        // Show success message
        toast.success('Account created successfully!');

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate(redirectAfterSignup);
        }, 1500);
      } else {
        setError(response.data.msg || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    if (redirectAfterSignup.startsWith('/login')) {
      navigate(redirectAfterSignup);
    } else {
      navigate('/login');
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

      {/* Hexagonal Background Pattern - Same as Hero */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="signup-hexagons"
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
          <rect width="100%" height="100%" fill="url(#signup-hexagons)" />
        </svg>
      </div>

      {/* Animated hexagonal elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-20 right-20 opacity-[0.03]"
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <polygon
            points="50,8 80,26 80,62 50,80 20,62 20,26"
            fill="none"
            stroke="white"
            strokeWidth="1"
          />
          <polygon
            points="50,20 70,32 70,56 50,68 30,56 30,32"
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
          duration: 28,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-32 left-16 opacity-[0.02]"
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <polygon
            points="60,10 95,32.5 95,77.5 60,100 25,77.5 25,32.5"
            fill="none"
            stroke="white"
            strokeWidth="0.8"
          />
        </svg>
      </motion.div>

      {/* Subtle gradient overlay */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-transparent to-transparent"
      />
      
      {/* Minimal floating elements with hexagonal inspiration */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.02, 0.04, 0.02],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[500px] h-[500px] -top-60 -right-60"
      >
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl transform rotate-12" />
      </motion.div>

      <motion.div
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.015, 0.03, 0.015],
          rotate: [0, -45, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[600px] h-[600px] -bottom-60 -left-60"
      >
        <div className="w-full h-full bg-gradient-to-tr from-blue-500/8 to-transparent rounded-full blur-3xl transform -rotate-12" />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10 max-w-md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle hexagonal pattern overlay - same as hero */}
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
            <motion.div variants={itemVariants} className="text-center mb-8">
              {/* Minimal badge with hexagonal accent */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/70 text-sm font-medium mb-6 backdrop-blur-sm"
              >
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse-slow" />
                Join BrainBolt
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">
                Create your
              </h1>
              <h1 className="text-3xl md:text-4xl font-light text-white mb-4 tracking-tight">
                <span className="relative">
                  <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-transparent bg-clip-text font-medium">
                    account
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
                    className="absolute -inset-2 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-lg blur-xl -z-10"
                  />
                </span>
              </h1>
              
              <p className="text-white/50 text-sm font-light mb-2">
                Already have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={goToLogin}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300 font-medium"
                >
                  Sign in
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
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-light text-white/70 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm font-light"
                  placeholder="Enter your full name"
                />
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-light text-white/70 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm font-light"
                  placeholder="Enter your email address"
                />
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="block text-sm font-light text-white/70 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm font-light"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/70 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/40 font-light">Password strength:</div>
                      <div className={`text-xs font-medium ${getStrengthTextColor()}`}>
                        {getStrengthText()}
                      </div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      ></div>
                    </div>

                    {/* Password Requirements */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { test: /[A-Z]/.test(formData.password), label: 'Capital letter' },
                        { test: /[0-9]/.test(formData.password), label: 'Number' },
                        { test: formData.password.length >= 8, label: '8+ characters' },
                        { test: /[^A-Za-z0-9]/.test(formData.password), label: 'Special character' }
                      ].map((req, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Check className={`h-3 w-3 mr-2 ${req.test ? 'text-green-400' : 'text-white/20'} transition-colors duration-300`} />
                          <span className={`font-light ${req.test ? 'text-white/60' : 'text-white/30'} transition-colors duration-300`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-light text-white/70 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm font-light"
                  placeholder="Confirm your password"
                />
                {formData.password && formData.confirmPassword && (
                  <div className="mt-2 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <span className="text-xs text-green-400 flex items-center font-light">
                        <Check className="h-3 w-3 mr-1" /> Passwords match
                      </span>
                    ) : (
                      <span className="text-xs text-red-400 flex items-center font-light">
                        <AlertCircle className="h-3 w-3 mr-1" /> Passwords don't match
                      </span>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={isLoading ? {} : { scale: 1.02 }}
                  whileTap={isLoading ? {} : { scale: 0.98 }}
                  className={`group relative w-full flex justify-center items-center gap-2 py-3 px-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Terms */}
              <motion.p variants={itemVariants} className="text-xs text-center text-white/30 font-light">
                By creating an account, you agree to our{' '}
                <span className="text-white/50 hover:text-white/70 transition-colors duration-300 cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-white/50 hover:text-white/70 transition-colors duration-300 cursor-pointer">
                  Privacy Policy
                </span>
              </motion.p>
            </motion.form>
          </div>

          {/* Subtle glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-green-400/5 via-blue-400/5 to-purple-400/5 opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.02 }}
          />
        </motion.div>
      </div>
    </section>
  );
};