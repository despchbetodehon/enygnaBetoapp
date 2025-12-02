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


    valordevenda:  string;
   bairroempresa: string,
    cargo3:string,
   cargo:string,
   nomesocio1: string,
    cpfsocio1: string,
    enderecosocio1: string,
    complementosocio1: string,
    municipiosocio1: string,
    emailsocio1: string,
    cepsocio1: string;
    celtelsocio1: string,
    cargo2:string,
   nomesocio2: string,
   nomesocio3: string,
    cpfsocio2: string,
    cpfsocio3: string,
    enderecosocio2: string,
    complementosocio2: string,
    municipiosocio2: string,
    emailsocio2: string,
    cepsocio2: string;
    celtelsocio2: string,
    dataCriacao: string | Timestamp;
    nomeempresa: string,
    cpfempresa: string,
    enderecoempresa: string,
    complementoempresa: string,
    municipioempresa: string,
    emailempresa: string,
   celtelempresa: string,

    cepempresa: string;
    tipo: string;
    cnpjempresa: string;



    signature?: string; 



}



export default Item;
