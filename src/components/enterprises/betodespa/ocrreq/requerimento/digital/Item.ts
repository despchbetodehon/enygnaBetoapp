import { Timestamp } from 'firebase/firestore';

interface Item {
  id:string,
    cliente: string,
    
    status: string,
    quantidade: number;
    imagemUrls: string[],
    concluido: false,
    placa: string,
    renavam: string,
    crv: string,
    valordevenda:  string;
   bairrocomprador: string,
    

    nomevendedor: string,
    cpfvendedor: string,
    enderecovendedor: string,
    complementovendedor: string,
    municipiovendedor: string,
    emailvendedor: string,
    dataCriacao: string | Timestamp;
    nomecomprador: string,
    cpfcomprador: string,
    enderecocomprador: string,
    complementocomprador: string,
    municipiocomprador: string,
    emailcomprador: string,
   celtelcomprador: string,
   cepvendedor: string;
    cepcomprador: string;
    tipo: string;
    cnpjempresa: string;
    nomeempresa: string;

    celtelvendedor: string,
    signature?: string; 
 
  

}
    


export default Item;
