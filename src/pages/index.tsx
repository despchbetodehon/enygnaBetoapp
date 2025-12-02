
import React from 'react';
import Head from 'next/head';
import { makeStyles } from '@material-ui/core/styles';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  useMediaQuery,
  useTheme,
  Fab,
  Divider,
  Chip
} from '@material-ui/core';
import { motion } from 'framer-motion';
import { 
  FaWhatsapp, 
  FaCar, 
  FaFileAlt, 
  FaShieldAlt, 
  FaClock, 
  FaCheck,
  FaAward,
  FaUserTie,
  FaStar,
  FaGraduationCap,
  FaGlobe,
  FaChartLine,
  FaHandshake,
  FaExchangeAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import Link from 'next/link';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Hero Section Premium
  heroSection: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: theme.spacing(4, 2),
    background: 'radial-gradient(ellipse at top, rgba(26, 54, 93, 0.3) 0%, transparent 70%)',
  },

  heroContent: {
    textAlign: 'center',
    color: '#fff',
    zIndex: 2,
    maxWidth: '1400px',
    width: '100%',
  },

  // Logo Container Premium
  logoContainer: {
    position: 'relative',
    marginBottom: theme.spacing(4),
    display: 'inline-block',
  },

  logo: {
    width: 'clamp(100px, 17vw, 200px)',
    height: 'clamp(100px, 17vw, 200px)',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '6px solid rgba(192, 192, 192, 0.5)',
    boxShadow: `
      0 30px 80px rgba(0,0,0,0.6),
      0 0 0 12px rgba(192, 192, 192, 0.1),
      inset 0 0 50px rgba(0,0,0,0.3)
    `,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'scale(1.05) rotate(5deg)',
      boxShadow: `
        0 40px 100px rgba(0,0,0,0.7),
        0 0 0 16px rgba(192, 192, 192, 0.2),
        inset 0 0 60px rgba(0,0,0,0.4)
      `,
    },
  },

  experienceBadge: {
    position: 'absolute',
    top: -15,
    right: -15,
    background: 'linear-gradient(135deg, #a8a8a8 0%, #c0c0c0 100%)',
    borderRadius: '50%',
    width: 'clamp(50px, 3vw, 90px)',
    height: 'clamp(50px, 3vw, 90px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0a1929',
    fontWeight: 600,
    fontSize: 'clamp(0.2rem, 1.5vw, 1.0rem)',
    boxShadow: '0 12px 35px rgba(192, 192, 192, 0.5)',
    border: '4px solid rgba(255,255,255,0.2)',
  },

  // Typography Premium
  mainTitle: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 700,
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    background: 'black',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(3),
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    textShadow: '0 0 80px rgba(192, 192, 192, 0.3)',
  },

  subtitle: {
    fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)',
    fontWeight: 300,
    color: '#cbd5e1',
    marginBottom: theme.spacing(4),
    maxWidth: '1000px',
    margin: '0 auto',
    lineHeight: 1.6,
    fontFamily: '"Libre Baskerville", "Georgia", serif',
  },

  // Credentials Section Premium
  credentialsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },

  professionalTitle: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontWeight: 700,
    fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
    color: '#a8a8a8',
    textShadow: '0 0 30px rgba(192, 192, 192, 0.5)',
    letterSpacing: '0.05em',
  },

  credentialsBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },

  credentialBadge: {
    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: 30,
    padding: '12px 24px',
    border: '2px solid rgba(192, 192, 192, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
    fontWeight: 600,
    color: '#e2e8f0',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.25) 0%, rgba(255,255,255,0.1) 100%)',
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(192, 192, 192, 0.3)',
      borderColor: 'rgba(192, 192, 192, 0.5)',
    },
  },

  // Features Grid Premium
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing(3),
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    maxWidth: '1400px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    },
  },

  featureCard: {
    background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.4) 0%, rgba(15, 20, 25, 0.6) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: '1px solid rgba(192, 192, 192, 0.2)',
    padding: theme.spacing(4),
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      border: '1px solid rgba(34, 139, 34, 0.5)',
      boxShadow: '0 20px 60px rgba(34, 139, 34, 0.2)',
      '&::before': {
        opacity: 1,
      },
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(34, 139, 34, 0.1) 0%, transparent 100%)',
      opacity: 0,
      transition: 'opacity 0.5s ease',
      pointerEvents: 'none',
    },
  },

  featureIcon: {
    fontSize: 'clamp(36px, 6vw, 48px)',
    color: '#a8a8a8',
    marginBottom: theme.spacing(2),
    filter: 'drop-shadow(0 4px 12px rgba(192, 192, 192, 0.4))',
  },

  featureTitle: {
    fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: theme.spacing(1.5),
    fontFamily: '"Playfair Display", "Georgia", serif',
  },

  featureDescription: {
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    color: '#94a3b8',
    lineHeight: 1.6,
    fontFamily: '"Libre Baskerville", "Georgia", serif',
  },

  // CTA Buttons Premium
  ctaContainer: {
    display: 'flex',
    gap: theme.spacing(3),
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: theme.spacing(5),
  },

  primaryButton: {
    background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
    color: '#ffffff',
    padding: 'clamp(16px, 3vw, 20px) clamp(32px, 7vw, 48px)',
    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
    fontWeight: 700,
    borderRadius: 50,
    textTransform: 'none',
    boxShadow: '0 16px 40px rgba(34, 139, 34, 0.4)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Playfair Display", "Georgia", serif',
    border: '2px solid transparent',
    '&:hover': {
      background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
      transform: 'translateY(-4px)',
      boxShadow: '0 20px 50px rgba(34, 139, 34, 0.5)',
      border: '2px solid rgba(255,255,255,0.3)',
    },
  },

  secondaryButton: {
    background: 'transparent',
    color: '#a8a8a8',
    border: '2px solid #a8a8a8',
    padding: 'clamp(16px, 3vw, 20px) clamp(32px, 7vw, 48px)',
    fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
    fontWeight: 600,
    borderRadius: 50,
    textTransform: 'none',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '"Playfair Display", "Georgia", serif',
    '&:hover': {
      background: 'rgba(192, 192, 192, 0.1)',
      border: '2px solid #c0c0c0',
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(192, 192, 192, 0.3)',
    },
  },

  // Background Effects
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(192, 192, 192, 0.15) 0%, transparent 30%),
      radial-gradient(circle at 80% 80%, rgba(34, 139, 34, 0.15) 0%, transparent 30%)
    `,
  },

  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',    // ocupa toda a largura da tela
    height: '50%',    // mantém a altura que você já tinha
    opacity: 0.05,
    objectFit: 'cover',
    pointerEvents: 'none',
    zIndex: 1,
    margin: 0,
    padding: 0,
    borderWidth: 0,
  },



  floatingButton: {
    position: 'fixed',
    bottom: 'clamp(20px, 5vw, 35px)',
    right: 'clamp(20px, 5vw, 35px)',
    background: 'linear-gradient(135deg, #25D366 30%, #22c55e 90%)',
    color: '#fff',
    width: 'clamp(60px, 12vw, 75px)',
    height: 'clamp(60px, 12vw, 75px)',
    boxShadow: '0 16px 40px rgba(37, 211, 102, 0.5)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(135deg, #22c55e 30%, #16a34a 90%)',
      transform: 'scale(1.15)',
      boxShadow: '0 20px 50px rgba(37, 211, 102, 0.6)',
    },
    [theme.breakpoints.down('sm')]: {
      width: '60px',
      height: '60px',
      bottom: '20px',
      right: '20px',
    },
    [theme.breakpoints.down('xs')]: {
      width: '55px',
      height: '55px',
      bottom: '15px',
      right: '15px',
    },
  },

  addressCard: {
    position: 'fixed',
    top: 'clamp(15px, 3vw, 30px)',
    right: 'clamp(15px, 3vw, 30px)',
    background: 'white',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: '2px solid rgba(192, 192, 192, 0.4)',
    padding: theme.spacing(2),
    maxWidth: '320px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    zIndex: 999,
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 30px 80px rgba(192, 192, 192, 0.3)',
      border: '2px solid rgba(192, 192, 192, 0.6)',
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: '200px',
      padding: theme.spacing(1.5),
    },
    [theme.breakpoints.down('sm')]: {
      top: '15px',
      right: '15px',
      width: '50px',
      height: '50px',
      maxWidth: '50px',
      padding: 0,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    [theme.breakpoints.down('xs')]: {
      width: '45px',
      height: '45px',
      maxWidth: '45px',
    },
  },

  addressHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
      gap: 0,
      marginBottom: 0,
    },
  },

  addressIcon: {
    fontSize: 24,
    color: '#a8a8a8',
    filter: 'drop-shadow(0 4px 12px rgba(192, 192, 192, 0.4))',
    [theme.breakpoints.down('sm')]: {
      fontSize: 26,
      margin: 0,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: 24,
    },
  },

  addressTitle: {
    fontSize: 'clamp(0.85rem, 2.5vw, 1.2rem)',
    fontWeight: 400,
    color: '#f8fafc',
    fontFamily: '"Playfair Display", "Georgia", serif',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  addressText: {
    fontSize: 'clamp(0.65rem, 1vw, 0.85rem)',
    color: '#cbd5e1',
    lineHeight: 1.6,
    fontFamily: '"Libre Baskerville", "Georgia", serif',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  addressCep: {
    fontSize: 'clamp(0.55rem, 0.8vw, 0.75rem)',
    color: '#94a3b8',
    fontWeight: 300,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },

  whatsappIcon: {
    fontSize: 'clamp(28px, 7vw, 40px)',
    [theme.breakpoints.down('sm')]: {
      fontSize: '30px',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '28px',
    },
  },

  divider: {
    background: 'linear-gradient(90deg, transparent, rgba(192, 192, 192, 0.5), transparent)',
    height: 2,
    margin: theme.spacing(4, 0),
    maxWidth: 300,
    alignSelf: 'center',
  },

  // Stats Section
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(6),
    flexWrap: 'wrap',
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(4),
  },

  statItem: {
    textAlign: 'center',
    minWidth: '150px',
  },

  statNumber: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: '"Playfair Display", serif',
  },

  statLabel: {
    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
    color: '#94a3b8',
    marginTop: theme.spacing(1),
    fontFamily: '"Libre Baskerville", serif',
  },
}));

const credentials = [
  { icon: <FaAward />, title: '20+ Anos' },
  { icon: <FaGraduationCap />, title: 'Especialista' },
  { icon: <FaStar />, title: 'Certificado' },
  { icon: <FaUserTie />, title: 'Profissional' },
  { icon: <FaGlobe />, title: 'Internacional' },
];

const features = [
  {
    icon: <FaShieldAlt />,
    title: 'Segurança Premium',
    description: 'Processos seguros e certificados com garantia total de confidencialidade'
  },
  {
    icon: <FaGlobe />,
    title: 'Alcance Global',
    description: 'Atendimento especializado nacional e internacional com excelência'
  },
  {
    icon: <FaChartLine />,
    title: 'Eficiência Comprovada',
    description: 'Processos otimizados com alta taxa de aprovação e agilidade'
  },
  {
    icon: <FaHandshake />,
    title: 'Relacionamento Premium',
    description: 'Atendimento VIP personalizado com consultoria especializada'
  },
];

const stats = [
  { number: '20+', label: 'Anos de Experiência' },
  { number: '10k+', label: 'Clientes Atendidos' },
  { number: '98%', label: 'Satisfação' },
  { number: '24/7', label: 'Suporte Digital' },
];

export default function Home() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  return (
    <>
      <Head>
        <title>Beto Dehon | Despachante  | 20+ Anos de Excelência</title>
        <meta
          name="description"
          content="Despachante Beto Dehon - Mais de 20 anos de experiência premium em documentação veicular. Atendimento profissional , ágil e 100% digital."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="icon" href="/betologo.jpg" />
      </Head>

      <div className={classes.root}>
        <div className={classes.backgroundPattern} />
        
        {/* GIF animado semi-transparente na parte inferior */}
        <img 
          src="https://cdn.prod.website-files.com/62ee5b899147fe452e4bc3a7/633ccff7f816dedfcacc9088_Consultoria_.gif"
          alt="Background animation"
          className={classes.videoOverlay}
        />
        
        {/* Card de Endereço Flutuante */}
        <motion.a
          href="https://www.google.com/maps/place/Despachante+Beto+Dehon+%E2%80%93+Documentos+e+Servi%C3%A7os+Veiculares+em+Tubar%C3%A3o/@-28.4758692,-49.0157124,21z/data=!4m14!1m7!3m6!1s0x9521425e5d6f475b:0x3f346de14f847db!2sDespachante+Beto+Dehon+%E2%80%93+Documentos+e+Servi%C3%A7os+Veiculares+em+Tubar%C3%A3o!8m2!3d-28.475868!4d-49.015901!16s%2Fg%2F1ptytds2m!3m5!1s0x9521425e5d6f475b:0x3f346de14f847db!8m2!3d-28.475868!4d-49.015901!16s%2Fg%2F1ptytds2m?entry=ttu&g_ep=EgoyMDI1MTAwNC4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className={classes.addressCard}
          initial={{ opacity: 0, x: 100, y: -50 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: 0,
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut",
            scale: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -2, 2, 0]
          }}
        >
          <div className={classes.addressHeader}>
            <motion.div
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <FaMapMarkerAlt className={classes.addressIcon} />
            </motion.div>
            <Typography className={classes.addressTitle}>
              Nosso Endereço
            </Typography>
          </div>
          
          <Typography className={classes.addressText}>
            R. Pio XII, 743 - Humaitá<br />
            Tubarão - SC
          </Typography>
          
          <Typography className={classes.addressCep}>
            📍 CEP: 88704-330
          </Typography>
        </motion.a>
        
        <section className={classes.heroSection}>
          <Container maxWidth="lg" className={classes.heroContent}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Logo Premium */}
              <motion.div variants={fadeInUp}>
                <div className={classes.logoContainer}>
                  <motion.img 
                    src="/betologo.jpg" 
                    alt="Beto Dehon Premium" 
                    className={classes.logo}
                    variants={scaleIn}
                    whileHover={{ scale: 1.08, rotate: 3 }}
                  />
                  <motion.div 
                    className={classes.experienceBadge}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div>20+</div>
                    <div style={{ fontSize: '0.65em' }}>ANOS</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.div variants={fadeInUp}>
                <Typography className={classes.mainTitle}>
                  Despachante Beto Dehon
                </Typography>
              </motion.div>

              {/* Subtitle */}
              <motion.div variants={fadeInUp}>
                <Typography className={classes.subtitle}>
                  Excelência em documentação veicular com padrão internacional de qualidade. 
                  Atendimento premium, processos certificados e resultados garantidos.
                </Typography>
              </motion.div>

              {/* Credentials */}
              <motion.div variants={fadeInUp} className={classes.credentialsContainer}>
                <Typography className={classes.professionalTitle}>
                  DESPACHANTE CERTIFICADO 
                </Typography>
                
                <div className={classes.credentialsBadges}>
                  {credentials.map((credential, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className={classes.credentialBadge}
                      whileHover={{ scale: 1.08, y: -6 }}
                    >
                      {credential.icon}
                      <span>{credential.title}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <Divider className={classes.divider} />

              {/* Stats */}
              <motion.div variants={fadeInUp} className={classes.statsContainer}>
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className={classes.statItem}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Typography className={classes.statNumber}>
                      {stat.number}
                    </Typography>
                    <Typography className={classes.statLabel}>
                      {stat.label}
                    </Typography>
                  </motion.div>
                ))}
              </motion.div>

           

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className={classes.ctaContainer}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className={classes.primaryButton}
                    startIcon={<FaWhatsapp />}
                    href="https://wa.me/5548988449379"
                    target="_blank"
                  >
                    Consultoria Especializada
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/servicos" passHref>
                    <Button className={classes.secondaryButton}>
                      Explorar Serviços Premium
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </Container>
        </section>

      
      
      </div>
    </>
  );
}
