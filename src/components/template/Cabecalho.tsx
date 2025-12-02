import BoasVindas from "./BoasVindas";
import MenuUsuario from "./MenuUsuario";
import Botao from "./Botaoenterprises";



export default function Cabecalho() {
    return (
        <div className={`
            flex justify-between items-center
            p-6 border-b border-zinc-900
            
        `}>
            <BoasVindas />
            <Botao />
            
            <MenuUsuario />
        </div>
    )
}