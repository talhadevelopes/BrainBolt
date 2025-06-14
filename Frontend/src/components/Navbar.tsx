import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavProps {
  title: string;
  icon: React.ElementType;
}

const ProfileBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/signup');
  };

  const dropdownVariants: Variants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <div className="relative ml-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full p-2 backdrop-blur-sm text-white/70 hover:bg-white/10 transition-all duration-300"
      >
        <User className="h-5 w-5 text-white/70" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 mt-2 w-48 bg-white/5 border border-white/10 rounded-lg shadow-xl backdrop-blur-sm"
          >
            <div className="p-2 space-y-2">
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded-md transition-all duration-300"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Your Dashboard</span>
              </motion.button>
              <motion.button
                onClick={handleSignOut}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-md transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Navbar = ({ title, icon: Icon }: NavProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { scrollY } = useScroll();
  const navbarHeight = useTransform(scrollY, [0, 100], [80, 60]);
  const navbarOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(!!authStatus);
  }, []);

  const handleNavigation = (path: string) => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus) {
      navigate(path);
    } else {
      navigate('/signup');
    }
    setIsMobileMenuOpen(false);
  };

  const navItemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <motion.nav
      style={{ height: navbarHeight, opacity: navbarOpacity }}
      className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm"
    >
      {/* Subtle hexagonal background pattern */}
      <div className="absolute inset-0 opacity-[0.015] z-0">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id="hexagons"
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
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      {/* Optional subtle gradient overlay to match Hero section */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 via-transparent to-transparent z-0" /> */}

      <div className="max-w-6xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full py-4">
          {/* Logo Section */}
          <div className="flex items-center">
            <motion.button
              onClick={() => handleNavigation('/')}
              className="flex-shrink-0 flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Icon className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text" />
              </motion.div>
              <span className="ml-2 text-xl font-light text-white tracking-tight">
                {title}
              </span>
            </motion.button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                },
              }}
              initial="hidden"
              animate="visible"
              className="ml-10 flex items-center space-x-4"
            >
              {[
                { path: '/', label: 'Home' },
                { path: '/content', label: 'Theory Mastery' },
                { path: '/Code', label: 'Code Dojo' },
                { path: '/cp', label: 'Competitive Arena' },
                { path: '/kc', label: 'Knowledge Check' },
                { path: '/rh', label: 'Resource Hub' },
              ].map((item) => (
                <motion.button
                  key={item.path}
                  variants={navItemVariants}
                  onClick={() => handleNavigation(item.path)}
                  className="relative px-3 py-2 rounded-full text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Auth Section */}
          <div className="flex items-center">
            {isAuthenticated ? (
              <ProfileBadge />
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/signup')}
                className="group ml-4 px-6 py-2 bg-white text-black rounded-full font-medium text-sm hover:shadow-2xl hover:shadow-white/20 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  Sign In
                </span>
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full text-white/70 hover:bg-white/5 border border-white/10 transition-all duration-300 md:hidden ml-4"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-2">
                {[
                  { path: '/content', label: 'Theory Mastery' },
                  { path: '/Code', label: 'Code Dojo' },
                  { path: '/cp', label: 'Competitive Arena' },
                  { path: '/kc', label: 'Knowledge Check' },
                  { path: '/rh', label: 'Resource Hub' },
                ].map((item) => (
                  <motion.button
                    key={item.path}
                    variants={navItemVariants}
                    onClick={() => handleNavigation(item.path)}
                    className="block px-3 py-2 rounded-full text-sm font-medium text-white/70 hover:bg-white/5 border border-white/10 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};