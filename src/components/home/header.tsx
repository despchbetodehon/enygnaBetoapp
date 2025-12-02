import React, { useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Drawer,
  Box,
  useMediaQuery,
  Button,
  Divider,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaBuilding,
  FaUsers,
  FaHome,
} from 'react-icons/fa';

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: 'linear-gradient(120deg, #f4f6f9 60%, #e9ecef 100%)',
    boxShadow: '0 6px 22px rgba(0,0,0,0.06)',
    borderBottom: '2px solid rgba(33,243,172,0.15)',
    zIndex: theme.zIndex.drawer + 1,
  },
  toolbar: {
    minHeight: 78,
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    textDecoration: 'none',
  },
  logoImg: {
    width: 50,
    height: 50,
    borderRadius: 14,
    boxShadow: '0 0 20px rgba(45, 90, 61, 0.4)',
    border: '1.5px solid rgba(45,90,61,0.3)',
    background: '#fff',
    objectFit: 'cover',
  },
  navMainBtns: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  navBtn: {
    minWidth: 145,
    fontSize: 17,
    fontWeight: 700,
    color: '#222',
    letterSpacing: 1,
    borderRadius: 18,
    background: 'linear-gradient(120deg,#2d5a3d 40%,#000000 120%)',
    boxShadow: '0 0 18px rgba(45,90,61,0.12)',
    padding: theme.spacing(1.8, 2.3),
    margin: theme.spacing(0, 1),
    border: '1.7px solid rgba(45,90,61,0.2)',
    transition: '0.25s',
    textTransform: 'none',
    '&:hover': {
      color: '#191e20',
      background: 'linear-gradient(90deg,#000000 0%,#2d5a3d 100%)',
      boxShadow: '0 0 32px rgba(33,243,172,0.25)',
      transform: 'scale(1.04)',
    },
  },
  avatarBtn: {
    marginLeft: theme.spacing(2),
    boxShadow: '0 0 8px rgba(33,243,172,0.2)',
    border: '2px solid rgba(33,243,172,0.4)',
  },
  menuIcon: {
    color: '#2d5a3d',
    fontSize: 36,
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawerPaper: {
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(120deg,#f4f6f9 60%, #e9ecef 100%)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.breakpoints.up('sm')]: {
      width: 420,
      borderRadius: 24,
      margin: '24px 0',
      height: 'calc(100vh - 48px)',
    },
  },
  toolbarSpace: {
    minHeight: 80,
    [theme.breakpoints.down('sm')]: { minHeight: 55 },
  },
}));

export default function Header() {
  const classes = useStyles();
  const theme = useTheme();
  const [drawer, setDrawer] = useState(false);

  const usuario = {
    nome: 'Gustavo Martins',
    email: 'gustavodev@gmail.com',
    imagemUrl: '/betologo.jpg',
  };

  const mainButtons = [
    {
      label: 'Início',
      href: '/homebeto',
      icon: <FaHome style={{ marginRight: 12 }} />,
    },
    {
      label: 'Área Cliente',
      href: '/area-cliente',
      icon: <FaUserCircle style={{ marginRight: 12 }} />,
    },
    {
      label: 'Área Colaboradores',
      href: '/area-colaboradores',
      icon: <FaUsers style={{ marginRight: 12 }} />,
    },
    {
      label: 'Área Serviços',
      href: '/servicos',
      icon: <FaBuilding style={{ marginRight: 12 }} />,
    },
  ];

  const handleDrawer = () => setDrawer((p) => !p);

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Link href="/homebeto" className={classes.logo} aria-label="Início">
            <img src="/betologo.jpg" alt="Logo Beto Dehon" className={classes.logoImg} />
            <Typography variant="h5" style={{
              fontFamily: 'Montserrat, Poppins, sans-serif',
              color: '#2d5a3d',
              fontWeight: 900,
              letterSpacing: 2.2,
            }}>
              BETO DEHON
            </Typography>
          </Link>

          <Box className={classes.navMainBtns}>
            {mainButtons.map((btn) => (
              <Button
                key={btn.href}
                href={btn.href}
                className={classes.navBtn}
                startIcon={btn.icon}
                aria-label={btn.label}
                component={Link}
              >
                {btn.label}
              </Button>
            ))}
          </Box>

          <Box display="flex" alignItems="center">
            <IconButton
              onClick={handleDrawer}
              className={classes.menuIcon}
              aria-label="Abrir menu mobile"
              size="medium"
            >
              <FaBars />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <div className={classes.toolbarSpace} />

      <Drawer
        anchor="left"
        open={drawer}
        onClose={handleDrawer}
        classes={{ paper: classes.drawerPaper }}
        transitionDuration={400}
        ModalProps={{ keepMounted: true }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
          <Avatar src={usuario.imagemUrl} style={{ width: 70, height: 70, margin: 20, border: '2.7px solid #000000cc' }} alt={usuario.nome} />
          {mainButtons.map((btn) => (
            <Button
              key={btn.href}
              href={btn.href}
              startIcon={btn.icon}
              style={{
                minWidth: 220,
                fontSize: 23,
                fontWeight: 900,
                borderRadius: 32,
                background: 'linear-gradient(80deg,#2d5a3d 50%,#000000 160%)',
                color: '#ffffff',
                margin: "18px 0",
                padding: "22px 22px",
                border: '2px solid #2d5a3d99',
                boxShadow: '0 0 28px rgba(45,90,61,0.25)',
                letterSpacing: 1.7,
                textShadow: '0 1.2px 12px #fff8',
              }}
              fullWidth
              component={Link}
              onClick={handleDrawer}
              aria-label={btn.label}
            >
              {btn.label}
            </Button>
          ))}
          <Divider style={{ margin: "28px 0", background: "#2d5a3d44" }} />
          <Button
            startIcon={<FaSignOutAlt size={22} />}
            style={{
              background: 'linear-gradient(60deg,#000000 40%,#d73232 120%)',
              color: '#fff',
              fontWeight: 800,
              borderRadius: 22,
              fontSize: 18,
              minWidth: 160,
            }}
            onClick={() => alert("Sair do sistema")}
            aria-label="Sair"
          >
            Sair
          </Button>
        </Box>
      </Drawer>
    </>
  );
}