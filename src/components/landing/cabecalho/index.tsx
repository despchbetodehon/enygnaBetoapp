import { motion } from "framer-motion";
import Area from "../comum/Area";
import Logo from "../comum/Logo";
import Menu from "./Menu";

const Cabecalho = () => {
  const fadeInAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <Area className="bg-gradient-to-r from-black via-slate-900 fixed z-50">
      <div className="flex items-center justify-between h-20">
        <motion.div
          className="animated-element"
          initial="hidden"
          animate="visible"
          variants={fadeInAnimation}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-2"> {/* Centralizar a logo e adicionar margem inferior */}
            <Logo />
          </div>
        </motion.div>
        <motion.div
          className="animated-element"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Menu />
        </motion.div>
      </div>
    </Area>
  );
};

export default Cabecalho;
