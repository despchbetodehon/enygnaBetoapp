import AutenticacaoContext from "@/data/contexts/AutenticacaoContext";

import { IconArrowRight, IconVideo } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useContext } from "react";

export default function Slogan() {

const { loginGoogle } = useContext (AutenticacaoContext)


  const transition = {
    duration: 1.5,
    ease: "easeInOut",
  };

  const fadeInVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  const slideInVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col justify-center gap-5">
      <motion.div
        className={`
          flex flex-col items-center md:items-start text-4xl lg:text-6xl
          text-white font-light
        `}
        initial="initial"
        animate="animate"
        variants={fadeInVariants}
        transition={transition}
      >
        <div className="flex gap-2.5">
          <div className={`relative`}>
            <motion.span
              className={`
                absolute bottom-1 left-0 w-full
                border-b-8 border-purple-500
                -rotate-2
              `}
              initial="initial"
              animate="animate"
              variants={slideInVariants}
              transition={transition}
            ></motion.span>
            <motion.span
              className="relative"
              initial="initial"
              animate="animate"
              variants={slideInVariants}
              transition={transition}
            >
              Melhor
            </motion.span>
          </div>
          <motion.div
            initial="initial"
            animate="animate"
            variants={slideInVariants}
            transition={transition}
          >
            maneira
          </motion.div>
        </div>
        <div className="flex gap-2.5">
          <motion.span
            initial="initial"
            animate="animate"
            variants={slideInVariants}
            transition={transition}
          >
            de
          </motion.span>
          <motion.span
            initial="initial"
            animate="animate"
            variants={slideInVariants}
            transition={transition}
          >
            organizar
          </motion.span>
        </div>
        <div className="flex gap-2.5">
          <motion.span
            initial="initial"
            animate="animate"
            variants={slideInVariants}
            transition={transition}
          >
            seu
          </motion.span>
          <motion.span
            className={`
              flex items-center p-1
              relative text-black
            `}
            initial="initial"
            animate="animate"
            variants={slideInVariants}
            transition={transition}
          >
            <motion.span
              className="absolute -rotate-1 top-0.5 left-0 w-full h-5/6 bg-yellow-300 rounded-sm"
              initial="initial"
              animate="animate"
              variants={slideInVariants}
              transition={transition}
            />
            <motion.span
              className="relative rotate-2 z-20"
              initial="initial"
              animate="animate"
              variants={slideInVariants}
              transition={transition}
            >
              Status
            </motion.span>
          </motion.span>
        </div>
      </motion.div>
      <motion.div
        className="text-sm lg:text-lg font-thin text-zinc-100 text-center sm:text-left"
        initial="initial"
        animate="animate"
        variants={fadeInVariants}
        transition={transition}
      >
       
       Plataforma Social Empresarial que qualifica sua vida!
       Focada em finanças e status empresarial e profissional!
       Abrindo as porta para nova onda de briquis em permutas empresariais!
       

  </motion.div>
  <div className="flex justify-center sm:justify-start items-center gap-2">
    <motion.div
      className={`
        flex items-center gap-2 cursor-pointer
        bg-gradient-to-r from-indigo-600 to-cyan-600
        text-white px-5 py-2.5 rounded-md
      `}
      onClick={loginGoogle}
      initial="initial"
      animate="animate"
      variants={fadeInVariants}
      transition={transition}
    >
      <motion.span
        className="font-thin md:text-sm text-base"
        initial="initial"
        animate="animate"
        variants={slideInVariants}
        transition={transition}
      >
    
        Iniciar <span className="hidden sm:inline">Agora</span>
      </motion.span>
      <IconArrowRight className="hidden lg:inline" stroke={1} />
    </motion.div>
    <motion.div
      className={`
        flex items-center gap-2 cursor-pointer
        text-zinc-300 px-5 py-2.5
      `}
      initial="initial"
      animate="animate"
      variants={fadeInVariants}
      transition={transition}
    >
      <IconVideo stroke={1} />
      <motion.span
        className="font-thin md:text-sm text-base"
        initial="initial"
        animate="animate"
        variants={slideInVariants}
        transition={transition}
      >
        <span className="hidden sm:inline">Assista o</span> Vídeo
      </motion.span>
    </motion.div>
  </div>
</div>
);
}