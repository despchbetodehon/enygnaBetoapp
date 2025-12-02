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
    valordevenda:  string;
   bairrocomprador: string,
    dataCriacao: string | Timestamp;

    nomevendedor: string,
    cpfvendedor: string,
    enderecovendedor: string,
    complementovendedor: string,
    municipiovendedor: string,
    emailvendedor: string,
    
    nomecomprador: string,
    cpfcomprador: string,
    enderecocomprador: string,
    complementocomprador: string,
    municipiocomprador: string,
    emailcomprador: string,
   celtelcomprador: string,
   celtelvendedor: string,
   cepvendedor: string;
    cepcomprador: string;
    tipo: string;
    cnpjempresa: string;
    nomeempresa: string;
    signature?: string; 
 
  
 
  

}

const Produtoset: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (newItem: Item) => {
    setItems([...items, newItem]);
  };

  return (
    <>
  
    
      <ListPost setItems={(items) => addItem} />
      <ItemList items={items} />
     
    </>
  );
};

export default Produtoset;
