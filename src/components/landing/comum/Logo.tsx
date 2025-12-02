import { motion } from 'framer-motion';


export default function Logo() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2 }}
            className="text-3xl"
        >
            <span className="font-black">ENY-GNA</span>
            <span className="text-zinc-400 font-thin">Social</span>
            <span className="font-black">EnterPrises</span>
        </motion.div>
    )
}
