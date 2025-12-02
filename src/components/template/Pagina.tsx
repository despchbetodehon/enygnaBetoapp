import { motion } from "framer-motion";
import ForcarAutenticacao from "../autenticacao/ForcarAutenticacao";

interface PaginaProps {
  externa?: boolean;
  children: any;
  className?: string;
}



const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export default function Pagina(props: PaginaProps) {
  function renderizar() {
    return (
      <motion.div
        className={`
          flex flex-col min-h-screen
          bg-transparent
          ${props.className ?? ""}
        `}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {props.children}
      </motion.div>
    );
  }

  return props.externa ? (
    renderizar()
  ) : (
    <ForcarAutenticacao>
      {renderizar()}
    </ForcarAutenticacao>
  );
}
