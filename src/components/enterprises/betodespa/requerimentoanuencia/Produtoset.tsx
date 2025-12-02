
import React, { useState } from 'react';
import ListPost from './ListPost';
import ItemList from './ItemList';
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
  valordevenda: string;
  bairroempresa: string,
  cargo:string,
  cargo2:string,
  cargo3:string,
  cargo4:string,
  cargo5:string,
  cnpjsolicitante:string,
    nomesolicitante:string,
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
  celtelsocio1: string,
  celtelsocio2: string,
  cepsocio1: string;
  cepsocio2: string;
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
  celtelvendedor: string,
  signature?: string; 
}

const Produtoset: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (newItem: Item) => {
    setItems(prevItems => [...prevItems, newItem]);
  };

  const updateItems = (value: React.SetStateAction<Item[]>) => {
    setItems(value);
  };

  return (
    <>
      <ListPost setItems={updateItems} />
      <ItemList items={items} />
    </>
  );
};

export default Produtoset;
