import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Area from '../comum/Area';
import Logoo from '../comum/Inicio';
import RedesSociais from './RedeSociais';

export default function Rodape() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Define a threshold value for when to add the class
      const scrollThreshold = 100;
      setIsScrolled(scrollPosition > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    initial: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 5.5,
        delay: 0.2,
      },
    },
  };

  const textVariants = {
    initial: {
      y: 20,
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 5.5,
        delay: 0.4,
      },
    },
  };

  const LogooVariants = {
    initial: {
      scale: 0.8,
    },
    visible: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        duration: 5.5,
        damping: 20,
      },
    },
  };

  return (
    <Area className={`bg-gradient-to-r from-black via-slate-900 py-20 ${isScrolled ? 'scrolled' : ''}`}>
      <motion.div
        className="flex flex-col items-center md:items-start"
        initial="initial"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={LogooVariants}>
          <Logoo />
        </motion.div>
        <motion.div className="mt-3 text-zinc-400 text-center md:text-left" variants={textVariants}>
          <div>Plataforma financeira</div>
          <div className="flex gap-1.5">
            que{' '}
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-400">
              simplifica
            </span>{' '}
            sua vida
          </div>
        </motion.div>
      </motion.div>
      <motion.div
        className="flex flex-col md:flex-row md:justify-between items-center mt-14"
        initial="initial"
        animate="visible"
        variants={containerVariants}
      >
        <RedesSociais />
        <motion.p className="text-zinc-100 mt-7 md:mt-0 text-center" variants={textVariants}>
          <span className="font-bold">
            Eny-gna<span className="text-red-500">(Global Network Architecture)</span>Lab.
          </span>{' '}
          ® {new Date().getFullYear()} - Todos os direitos reservados ENY - GNA (Global Network Architecture)
        </motion.p>
      </motion.div>
    </Area>
  );
}

