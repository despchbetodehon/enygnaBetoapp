import React from 'react';
import { Box, Typography, Grid, Paper, useMediaQuery, Tooltip } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  FaCar,
  FaMoneyBillWave,
  FaKey,
  FaAddressCard,
  FaRegFileAlt,
  FaFileSignature,
  FaBolt,
  FaFileInvoice,
  FaUserShield,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(8, 2),
    background: 'linear-gradient(120deg, #f4f6f9 60%, #e9ecef 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: '#2d5a3d',
    fontFamily: 'Montserrat, Poppins, sans-serif',
    fontWeight: 900,
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    textShadow: '0 2px 10px rgba(45,90,61,0.4)',
  },
  grid: {
    maxWidth: 1200,
    width: '100%',
    margin: '0 auto',
  },
  paper: {
    background: '#fff',
    borderRadius: 24,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    color: '#222',
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2.7),
    minHeight: 260,
    border: '2px solid rgba(33,243,172,0.15)',
    position: 'relative',
    transition: '0.25s',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.03)',
      boxShadow: '0 8px 35px rgba(45,90,61,0.2)',
      border: '2px solid rgba(141, 141, 141, 0.73)',
    },
  },
  icon: {
    fontSize: 54,
    marginBottom: theme.spacing(1),
    color: '#2d5a3d',
    filter: 'drop-shadow(0 0 6px rgba(45,90,61,0.5))',
  },
  label: {
    fontWeight: 800,
    fontSize: 20,
    color: '#000000',
    letterSpacing: 1.1,
    textAlign: 'center',
    textShadow: '0 0 6px rgba(0,0,0,0.4)',
  },
  desc: {
    color: '#555',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 400,
  },
}));

const servicos = [
  {
    icon: <FaCar />,
    title: 'Transferência',
    desc: 'Transferência de veículos rápida, segura e digital.',
  },
  {
    icon: <FaAddressCard />,
    title: 'Emissão de CRLV-e',
    desc: 'Receba seu documento digital de forma prática e segura.',
  },
  {
    icon: <FaRegFileAlt />,
    title: '2ª Via de CRV-e',
    desc: 'Emissão da segunda via do seu documento veicular digital.',
  },
  {
    icon: <FaFileSignature />,
    title: 'ATPV-e',
    desc: 'Geração de ATPV-e de forma rápida e online.',
  },
  {
    icon: <FaBolt />,
    title: 'Alteração de Dados',
    desc: 'Atualização de dados cadastrais e veiculares.',
  },
  {
    icon: <FaFileInvoice />,
    title: 'Primeiro Emplacamento',
    desc: 'Facilitamos todo o processo de emplacamento do seu veículo.',
  },
  {
    icon: <FaUserShield />,
    title: 'Certificado Digital',
    desc: 'Solicitação e emissão de certificados digitais.',
  },
  {
    icon: <FaMoneyBillWave />,
    title: 'Parcelamento de Débitos',
    desc: 'Negociação de débitos com parcelamento no boleto.',
  },
];

export default function Servicos() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    hover: { scale: 1.04 },
  };

  return (
    <section className={classes.root} id="servicos">
      <Typography className={classes.title} component="h2">
        Nossos Serviços
      </Typography>
      <Grid
        container
        spacing={isMobile ? 3 : 4}
        className={classes.grid}
        alignItems="stretch"
        justifyContent="center"
      >
        {servicos.map((serv, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={serv.title}>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12, delay: idx * 0.06 }}
            >
              <Paper elevation={6} className={classes.paper}>
                <Tooltip title={serv.title} arrow>
                  <span aria-label={serv.title}>
                    <span className={classes.icon}>{serv.icon}</span>
                  </span>
                </Tooltip>
                <Typography className={classes.label} component="h3">
                  {serv.title}
                </Typography>
                <Typography className={classes.desc}>{serv.desc}</Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </section>
  );
}