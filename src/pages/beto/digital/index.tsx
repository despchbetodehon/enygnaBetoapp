import Link from 'next/link';
import { FaShoppingCart, FaStore, FaPhone, FaTachometerAlt, FaChartPie } from 'react-icons/fa';
import { makeStyles } from '@material-ui/core';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

const useStyles = makeStyles({
  menuWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #1a2e35 0%, #1a1a2e 100%)', // Gradiente escuro com tons de verde e azul
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    filter: 'brightness(0.19) blur(10px)',
  },
  menuContainer: {
    width: '90%',
    maxWidth: '500px',
    background: 'rgba(255, 255, 255, 0.1)', // Fundo semi-transparente
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)', // Sombra mais suave
    backdropFilter: 'blur(15px)',
    position: 'relative',
    zIndex: 1,
  },
  menuItem: {
    color: '#00ff88', // Verde neon moderno
    fontSize: '18px',
    background: 'rgba(0, 0, 0, 0.32)',
    padding: '15px 25px',
    borderRadius: '15px',
    width: '100%',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(0, 255, 136, 0.1)', // Fundo verde neon ao passar o mouse
      boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)', // Brilho neon ao passar o mouse
    },
  },
  copyButton: {
    background: 'transparent',
    border: '1px solid #00ff88',
    color: '#00ff88',
    borderRadius: '10px',
    fontSize: '0.75rem',
    padding: '5px 10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#00ff88',
      color: '#1a1a2e',
    },
  },
  textEffect: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(247, 247, 247, 0.3), transparent)',
    animation: '$shineEffect 20s infinite',
  },
  '@keyframes shineEffect': {
    '0%': { left: '-100%' },
    '100%': { left: '100%' }
  }
});

const BotoesNavegacao = () => {
  const classes = useStyles();
  const videoRef = useRef<HTMLVideoElement | null>(null); // TIPAGEM CORRETA

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      const handleLoadedMetadata = () => {
        video.playbackRate = 0.4; // Reduz a velocidade para 40%
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  const copyToClipboard = (path: string) => {
    const baseUrl = 'https://enygna-enterprises.com.br';
    navigator.clipboard.writeText(`${baseUrl}${path}`).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
    });
  };

  return (
    <div className={classes.menuWrapper}>
      <video ref={videoRef} autoPlay loop muted className={classes.videoBackground}>
        <source src="/betovideo.mp4" type="video/mp4" />
      </video>

      <motion.div 
        className={classes.menuContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {[
             { href: '/beto/requerimento', icon: <FaStore />, label: 'Intenção de Venda loja' },
          { href: '/beto/requerimento/digital', icon: <FaStore />, label: 'Intenção de Venda Digital' },
          { href: '/beto/dashboard/digital', icon: <FaChartPie />, label: 'Painel de Controle Digital' }
        ].map((item, index) => (
          <motion.div 
            key={index} 
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }} // Efeito de hover mais suave
            whileTap={{ scale: 0.95 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Link href={item.href} className={classes.menuItem}>
                {item.icon} {item.label}
                <motion.div 
                  className={classes.textEffect}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              </Link>
              <button
                className={classes.copyButton}
                onClick={() => copyToClipboard(item.href)}
                aria-label={`Copy ${item.label} URL`}
              >
                Copy
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default BotoesNavegacao;
