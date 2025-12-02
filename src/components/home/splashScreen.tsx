import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = makeStyles((theme) => ({
  '@keyframes float': {
    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
    '33%': { transform: 'translateY(-20px) rotate(5deg)' },
    '66%': { transform: 'translateY(10px) rotate(-3deg)' },
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
    '50%': { transform: 'scale(1.1)', opacity: 1 },
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%) skewX(-15deg)' },
    '100%': { transform: 'translateX(300%) skewX(-15deg)' },
  },
  '@keyframes particleFloat': {
    '0%': { transform: 'translateY(100vh) translateX(0px) rotate(0deg)', opacity: 0 },
    '10%': { opacity: 1 },
    '90%': { opacity: 1 },
    '100%': { transform: 'translateY(-100vh) translateX(100px) rotate(360deg)', opacity: 0 },
  },
  '@keyframes glowPulse': {
    '0%, 100%': { 
      boxShadow: `0 0 20px rgba(33, 243, 172, 0.3),
                  0 0 40px rgba(33, 243, 172, 0.2),
                  0 0 60px rgba(33, 243, 172, 0.1),
                  inset 0 0 20px rgba(33, 243, 172, 0.1)`
    },
    '50%': { 
      boxShadow: `0 0 30px rgba(33, 243, 172, 0.6),
                  0 0 60px rgba(33, 243, 172, 0.4),
                  0 0 90px rgba(33, 243, 172, 0.3),
                  inset 0 0 30px rgba(33, 243, 172, 0.2)`
    },
  },
  root: {
    width: '100%',
    height: '100vh',
    background: `
      radial-gradient(circle at 20% 80%, rgba(33, 243, 172, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
      linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        linear-gradient(45deg, transparent 30%, rgba(33, 243, 172, 0.03) 50%, transparent 70%),
        linear-gradient(-45deg, transparent 30%, rgba(0, 255, 255, 0.02) 50%, transparent 70%)
      `,
      animation: '$shimmer 3s infinite',
    }
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    background: 'linear-gradient(45deg, #21f3ac, #00ffff)',
    borderRadius: '50%',
    animation: '$particleFloat 15s infinite linear',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      background: 'linear-gradient(45deg, #21f3ac, #00ffff)',
      borderRadius: '50%',
      filter: 'blur(2px)',
      opacity: 0.5,
    }
  },
  logoContainer: {
    position: 'relative',
    marginBottom: theme.spacing(6),
    animation: '$float 6s ease-in-out infinite',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 40,
    border: '3px solid transparent',
    background: `
      linear-gradient(#0a0a0a, #0a0a0a) padding-box,
      linear-gradient(45deg, #21f3ac, #00ffff, #8a2be2, #21f3ac) border-box
    `,
    objectFit: 'cover',
    animation: '$glowPulse 2s ease-in-out infinite',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-10px',
      left: '-10px',
      right: '-10px',
      bottom: '-10px',
      background: 'linear-gradient(45deg, #21f3ac, #00ffff, #8a2be2, #21f3ac)',
      borderRadius: 50,
      filter: 'blur(20px)',
      opacity: 0.3,
      animation: '$pulse 2s ease-in-out infinite',
    }
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    animation: '$shimmer 3s infinite',
    borderRadius: 40,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > *': {
      marginBottom: theme.spacing(3),
    },
    '& > *:last-child': {
      marginBottom: 0,
    },
  },
  progressBar: {
    width: 300,
    height: 6,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    border: '1px solid rgba(33, 243, 172, 0.2)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      background: 'linear-gradient(90deg, #21f3ac, #00ffff, #8a2be2)',
      borderRadius: 3,
      animation: '$shimmer 2s infinite',
    }
  },
  text: {
    fontFamily: 'Montserrat, Poppins, sans-serif',
    background: 'linear-gradient(45deg, #21f3ac, #00ffff, #8a2be2)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    fontWeight: 900,
    fontSize: 28,
    letterSpacing: 3,
    textAlign: 'center',
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -5,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '80%',
      height: 2,
      background: 'linear-gradient(90deg, transparent, #21f3ac, transparent)',
      animation: '$shimmer 2s infinite',
    }
  },
  subtitle: {
    fontFamily: 'Montserrat, sans-serif',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: 300,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: theme.spacing(1),
  },
  orbitalRing: {
    position: 'absolute',
    border: '1px solid rgba(33, 243, 172, 0.2)',
    borderRadius: '50%',
    animation: '$float 8s ease-in-out infinite reverse',
  },
  ring1: {
    width: 200,
    height: 200,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  ring2: {
    width: 280,
    height: 280,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animationDelay: '-2s',
  },
  ring3: {
    width: 360,
    height: 360,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animationDelay: '-4s',
  },
}));

export default function SplashScreen() {
  const classes = useStyles();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const particles = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className={classes.particle}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 15}s`,
        animationDuration: `${15 + Math.random() * 10}s`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.random() * 2 }}
    />
  ));

  return (
    <AnimatePresence>
      <motion.div
        className={classes.root}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Partículas flutuantes */}
        <div className={classes.particleContainer}>
          {particles}
        </div>

        {/* Anéis orbitais */}
        <div className={`${classes.orbitalRing} ${classes.ring1}`} />
        <div className={`${classes.orbitalRing} ${classes.ring2}`} />
        <div className={`${classes.orbitalRing} ${classes.ring3}`} />

        {/* Logo com animações */}
        <motion.div
          className={classes.logoContainer}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: [0, 1.2, 1], 
            rotate: [0, 360, 0] 
          }}
          transition={{ 
            duration: 2, 
            type: 'spring', 
            bounce: 0.4 
          }}
        >
          <img
            src="/betologo.jpg"
            alt="Logo Beto Dheon"
            className={classes.logo}
          />
          <div className={classes.shimmerOverlay} />
        </motion.div>

        {/* Container de carregamento */}
        <motion.div
          className={classes.loadingContainer}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {/* Barra de progresso futurística */}
          <motion.div
            className={classes.progressBar}
            initial={{ width: 0 }}
            animate={{ width: 300 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <motion.div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #21f3ac, #00ffff)',
                borderRadius: 3,
                position: 'relative',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>

          {/* Texto principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography className={classes.text}>
              BETO DHEON
            </Typography>
            <Typography className={classes.subtitle}>
              Central de Operações Avançada
            </Typography>
          </motion.div>

          {/* Indicador de carregamento */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 14,
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: 1,
              textAlign: 'center',
            }}
          >
            Inicializando Sistema... {Math.round(progress)}%
          </motion.div>
        </motion.div>

        {/* Efeito de grid futurístico no fundo */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: `
              linear-gradient(transparent 0%, rgba(33, 243, 172, 0.05) 100%),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 98px,
                rgba(33, 243, 172, 0.1) 100px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 98px,
                rgba(33, 243, 172, 0.1) 100px
              )
            `,
            opacity: 0.3,
          }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ delay: 1, duration: 1.5 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}