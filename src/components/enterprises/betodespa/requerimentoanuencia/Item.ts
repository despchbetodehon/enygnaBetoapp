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
    chassi:string,
    modelo:string,

  cnpjsolicitante:string,
  nomesolicitante:string,
    valordevenda:  string;
   bairroempresa: string,
    cargo3:string,
   cargo:string,
   cargo2:string,
   cargo4:string,
   cargo5:string,
   nomesocio1: string,
   nomesocio2: string,
   nomesocio3: string,
   nomesocio4: string,
   nomesocio5: string,
    cpfsocio1: string,
    cpfsocio2: string,
    cpfsocio3: string,
    cpfsocio4: string,
    cpfsocio5: string,
    enderecosocio1: string,
    enderecosocio2: string,
    complementosocio1: string,
    complementosocio2: string,
    municipiosocio1: string,
    municipiosocio2: string,
    emailsocio1: string,
    emailsocio2: string,
    cepsocio1: string;
    cepsocio2: string;
    celtelsocio1: string,
    celtelsocio2: string,
    dataCriacao: string | Timestamp;
    nomeempresa: string,
    cpfempresa: string,
    enderecoempresa: string,
    complementoempresa: string,
    municipioempresa: string,
    emailempresa: string,
   celtelempresa: string,
  
    cepvendedor: string;
    cepempresa: string;
    tipo: string;
    cnpjempresa: string;
    celtelvendedor: string;

    
    signature?: string; 
 
  

}
    


export default Item;
