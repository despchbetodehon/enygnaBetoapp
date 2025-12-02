import React from 'react';
import { Box, Typography, Grid, Avatar, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { FaCheckCircle, FaShieldAlt, FaUserTie } from 'react-icons/fa';
import { motion } from 'framer-motion';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(8, 2),
    minHeight: '100vh',
    background: 'linear-gradient(120deg,#f4f6f9 60%,#e9ecef 100%)',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  container: {
    maxWidth: 1200,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(6),
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  avatarBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 32,
    boxShadow: '0 0 32px rgba(33,243,172,0.3), 0 0 8px rgba(129, 129, 129, 0.4)',
    border: '2.5px solid rgba(119, 119, 119, 0.6)',
    background: '#fff',
    objectFit: 'cover',
  },
  subtitle: {
    color: '#000000',
    fontWeight: 700,
    letterSpacing: 1,
    fontSize: 22,
    textShadow: '0 1px 10px rgba(114, 114, 114, 0.4)',
  },
  title: {
    fontFamily: 'Montserrat, Poppins, sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    color: '#2d5a3d',
    marginBottom: theme.spacing(2),
    textShadow: '0 2px 8px rgba(45,90,61,0.4)',
  },
  text: {
    color: '#555',
    fontSize: 'clamp(1rem, 1.4vw, 1.3rem)',
    fontWeight: 400,
    textShadow: '0 0 8px rgba(0,0,0,0.05)',
    lineHeight: 1.7,
  },
  highlights: {
    display: 'flex',
    flexDirection: 'row',
    gap: theme.spacing(4),
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
  },
  highlight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.2),
    color: '#ffd700',
    fontWeight: 600,
    fontSize: 17,
    textShadow: '0 0 8px rgba(255,215,0,0.4)',
  },
}));

export default function Sobre() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sectionAnim = {
    hidden: { opacity: 0, y: 45 },
    visible: { opacity: 1, y: 0 },
  };

  const highlightAnim = {
    rest: { scale: 1 },
    hover: { scale: 1.13, transition: { type: 'spring', stiffness: 200 } },
  };

  return (
    <motion.section
      className={classes.root}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionAnim}
      transition={{ duration: 1, type: 'spring', bounce: 0.22 }}
      id="sobre"
    >
      <div className={classes.container}>
        <Box className={classes.avatarBox}>
          <Avatar src="/betologo.jpg" alt="Logo Beto Dheon" className={classes.avatar} />
          <Typography className={classes.subtitle}>Desde 2007</Typography>
        </Box>
        <Box flex={1}>
          <Typography className={classes.title} component="h2">
            Sobre o Beto Dheon
          </Typography>
          <Typography className={classes.text}>
            Somos o despachante digital que mais inova no Brasil. <br />
            Com mais de 15 anos de experiência, trazemos tecnologia, agilidade e atendimento humanizado para
            nossos clientes. Facilitamos processos veiculares, tanto no Brasil como no exterior,
            de forma 100% digital, com segurança, eficiência e profissionalismo.
          </Typography>
          <Box className={classes.highlights}>
            <motion.div
              variants={highlightAnim}
              initial="rest"
              whileHover="hover"
              whileTap="hover"
              style={{ cursor: 'pointer' }}
            >
              <span className={classes.highlight}><FaCheckCircle /> Atendimento Ágil</span>
            </motion.div>
            <motion.div
              variants={highlightAnim}
              initial="rest"
              whileHover="hover"
              whileTap="hover"
              style={{ cursor: 'pointer' }}
            >
              <span className={classes.highlight}><FaShieldAlt /> 100% Seguro</span>
            </motion.div>
            <motion.div
              variants={highlightAnim}
              initial="rest"
              whileHover="hover"
              whileTap="hover"
              style={{ cursor: 'pointer' }}
            >
              <span className={classes.highlight}><FaUserTie /> Equipe Profissional</span>
            </motion.div>
          </Box>
        </Box>
      </div>
    </motion.section>
  );
}