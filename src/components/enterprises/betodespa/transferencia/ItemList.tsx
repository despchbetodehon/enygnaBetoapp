import React, { useEffect, useState } from 'react';
import { Typography, Button, Paper, TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { collection, getFirestore, getDocs, onSnapshot } from 'firebase/firestore';

import { app } from '@/logic/firebase/config/app';
import jsPDF from 'jspdf';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import html2canvas from 'html2canvas';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

const db = getFirestore(app);
const storage = getStorage(app);

const useStyles = makeStyles((theme) => ({
  paper: {
    // Estilos gerais
    padding: theme.spacing(4),
    margin: 'auto',
    maxWidth: '1077px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #ccc',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    '@media print': {
      boxShadow: 'none',
      margin: '0',
      padding: '10px',
      width: '100%',
      fontSize: '20pt',
      boxSizing: 'border-box',
      pageBreakBefore: 'auto',
    },
  },
  


  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  header: {
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    fontSize: '1.0rem',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '1.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title2: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: '0.8rem',
    marginTop: theme.spacing(1),
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    background: 'rgba(124, 124, 124, 0.58)',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    textAlign: 'center',
    borderBottom: '2px solid #000',
    paddingBottom: theme.spacing(1),
  },
  sectionTitle3: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid #ccc',
    paddingBottom: theme.spacing(0),
  },
  sectionTitle4: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2),
    borderBottom: '1px solid #ccc',
    paddingBottom: theme.spacing(0),
  },
  field: {
    fontSize: '1.1rem',
    
    marginBottom: theme.spacing(0),
    paddingLeft: '10px',
    background: 'rgba(201, 201, 201, 0.58)',
  },
  field3: {
    fontSize: '0.7rem',
    marginBottom: theme.spacing(1),
  },
  field2: {
    fontSize: '1.3rem',
    marginBottom: theme.spacing(1),
  },
  signatureSection: {
    marginTop: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  signatureBlock: {
    textAlign: 'center',
    width: 'auto',
    borderTop: '2px solid #000',
    paddingTop: theme.spacing(0),
    margin: '0 auto',
  },
  searchField: {
    marginBottom: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
  downloadButton: {
    marginTop: theme.spacing(1),
    backgroundColor: '#4CAF50',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
}));

interface Item {
  id: string;
  cliente: string;
  status: string;
  quantidade: number;
  imagemUrls: string[];
  concluido: false;
  placa: string;
  renavam: string;
  crv: string;
  dataCriacao: string | Timestamp;
  valordevenda: string;
  nomevendedor: string;
  cpfvendedor: string;
  enderecovendedor: string;
  complementovendedor: string;
  municipiovendedor: string;
  bairrocomprador: string,
  
  emailvendedor: string;
  nomecomprador: string;
  cpfcomprador: string;
  enderecocomprador: string;
  complementocomprador: string;
  municipiocomprador: string;
  emailcomprador: string;
  celtelcomprador: string;
  cepvendedor: string;
  cepcomprador: string;
  tipo: string;
  cnpjempresa: string;
  nomeempresa: string;
  celtelvendedor: string;
  signature?: string;
}

interface ItemListProps {
  items: Item[];
}

const CatalagoList: React.FC<ItemListProps> = () => {
  const classes = useStyles();
  const [items, setItems] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Item[]>([]);

  useEffect(() => {
    const itemsCollectionRef = collection(db, 'BetodespachanteTransferenciaArquivos');
    
    const unsubscribe = onSnapshot(itemsCollectionRef, (querySnapshot) => {
        const fetchedItems: Item[] = [];
        querySnapshot.forEach((doc) => {
            fetchedItems.push({ id: doc.id, ...doc.data() } as Item);
        });
        setItems(fetchedItems);
    });

    return () => unsubscribe(); // Cleanup ao desmontar o componente
}, []);


  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredItems = searchText.length >= 4
  ? items.filter((item) => {
      const searchLower = searchText.toLowerCase();
      return (
        item.nomevendedor.toLowerCase().includes(searchLower) ||
        item.nomecomprador.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.renavam.toLowerCase().includes(searchLower)
      );
    })
  : [];

  const formatDate = (date: string | Timestamp | undefined | null) => {
    if (!date) return 'Data inválida';

    let localDate;

    if (date instanceof Timestamp) {
      localDate = date.toDate();
    } else {
      localDate = new Date(date);
    }

    if (isNaN(localDate.getTime())) return 'Data inválida';

    const offsetMs = localDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(localDate.getTime() - offsetMs - 3 * 3600000);

    return format(adjustedDate, 'dd/MM/yyyy');
  };

  const handlePrint = () => {
    window.print();
  };

 


  const sendWhatsApp = async (pdfURL: string) => { 
    const telefone = '5548988449379'; // WhatsApp fixo

    const mensagemWhatsApp = `Olá! Seu documento foi gerado e está pronto. Você pode baixá-lo aqui: ${pdfURL}`;
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagemWhatsApp)}`;

    window.open(linkWhatsApp, '_blank'); // Abre o WhatsApp automaticamente
};


  const generatePDF = async () => {
    const input = document.getElementById('pdf-content'); // Captura o formulário
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Converter para Blob e gerar URL
    const pdfBlob = pdf.output('blob');
const storageRef = ref(storage, `pdfs/documento_${Date.now()}.pdf`);
await uploadBytes(storageRef, pdfBlob);
const pdfURL = await getDownloadURL(storageRef);
sendWhatsApp(pdfURL);

    

    // Salvar PDF localmente
    pdf.save(`Requerimento_${newItem.length > 0 ? newItem[0].id : 'documento'}.pdf`);


    // Enviar para o WhatsApp
    await sendWhatsApp(pdfURL);
  };
  
  useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          @page {
            size: A4;
            margin: 20mm 10mm; /* Reduzindo a margem superior e lateral */
          }
    
          body {
            margin: 0;
            padding: 0;
          }
    
          .printContent {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0; /* Garante que o conteúdo comece no topo */
            width: 100%;
            height: auto;
            min-height: 100vh; /* Garante que o conteúdo ocupe toda a página */
            background: white !important;
          }
          
          .printContent * {
            visibility: visible;
          }
    
          .noPrint {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    
      return () => {
        document.head.removeChild(style);
      };
    }, []);

  
  return (
    <div>
      <div className={classes.noPrint} style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <TextField
          label="Buscar por PLACA RENAVAM VENDEDOR COMPRADOR"
          value={searchText}
          onChange={handleSearchInputChange}
          variant="outlined"
          margin="normal"
          className={classes.searchField}
          InputProps={{
            style: {
              backgroundColor: 'white',
            },
          }}
          style={{ width: '50%' }}
        />
      </div>

      {searchText && (
        <Paper className={classes.paper}>
          <div id="pdf-content">
            <div className={classes.header}>
              <Typography className={classes.title2}>Estado de Santa Catarina</Typography>
              <Typography className={classes.subtitle}>Secretaria de Estado de Segurança Pública</Typography>
              <Typography className={classes.subtitle}>Departamento Estadual de Trânsito</Typography>
              <Typography className={classes.subtitle}>Diretoria de Veículo</Typography>
            </div>

            <Typography className={classes.title} style={{ textAlign: 'center' }}>
              Requerimento de Intenção de Venda
            </Typography>

            {filteredItems.length === 0 ? (
              <Typography className={classes.subtitle}>Nenhum item encontrado.</Typography>
            ) : (
              filteredItems.map((item) => (
                <div key={item.placa}>
                  <Typography className={classes.sectionTitle}>Identificação do Veículo</Typography>
                  <Typography className={classes.field}><strong>Placa:</strong> {item.id}</Typography>
                  <Typography className={classes.field}><strong>Renavam:</strong> {item.renavam}</Typography>
                  <Typography className={classes.field}><strong>CRV:</strong> {item.crv}</Typography>
                  <Typography className={classes.field}><strong>Valor de Venda:</strong> R$ {item.valordevenda}</Typography>


                 <Typography className={classes.sectionTitle}>Identificação do Vendedor</Typography>
                  <Typography className={classes.field}><strong>Nome:</strong> {item.nomevendedor}</Typography>
                  <Typography className={classes.field}><strong>CPF/CNPJ:</strong> {item.cpfvendedor}</Typography>
                  <Typography className={classes.field}><strong>E-mail:</strong> {item.emailvendedor}</Typography>

                  <Typography className={classes.sectionTitle}>Identificação do Comprador</Typography>
                  <Typography className={classes.field}><strong>Nome:</strong> {item.nomecomprador}</Typography>
                  <Typography className={classes.field}><strong>CPF/CNPJ:</strong> {item.cpfcomprador}</Typography>
                   <Typography className={classes.field}><strong>CEP:</strong> {item.cepcomprador}</Typography>
                   <Typography className={classes.field}><strong>Endereço:</strong> {item.enderecocomprador}</Typography>
                   <Typography className={classes.field}><strong>Bairro:</strong> {item.bairrocomprador}</Typography>
                   <Typography className={classes.field}><strong>Município:</strong> {item.municipiocomprador}</Typography>
                  <Typography className={classes.field}><strong>Estado:</strong> {item.complementocomprador}</Typography>
                 
                 
                 
                  <Typography className={classes.field}><strong>E-mail:</strong> {item.emailcomprador}</Typography>
                  <Typography className={classes.field}><strong>CEL/TEL:</strong> {item.celtelcomprador}</Typography>

                  <Typography className={classes.sectionTitle}></Typography>
                  <Typography className={classes.field2} style={{ marginTop: '20px' }}>
                    Eu <strong>VENDEDOR</strong>, com base na Resolução do CONTRAN nº 809, de 15 de dezembro 2020,
                    informo ao Departamento Estadual de Trânsito de Santa Catarina (DETRAN-SC) a,
                    <strong>INTENÇÃO DE VENDA</strong> em {formatDate(item.dataCriacao)}, para o <strong>COMPRADOR</strong> conforme indicado acima.
                  </Typography>
                  {item.signature && (
                    <div className={classes.signatureSection}>
                      <img src={item.signature} alt="Assinatura do Cliente" style={{ maxWidth: '100%' }} />
                    </div>
                  )}

                  <div className={classes.signatureSection}>
                    <div className={classes.signatureBlock}>
                      Assinatura do Vendedor ou Responsável
                    </div>
                  </div>

                  <Typography className={classes.sectionTitle4}>b3certificacao@gmail.com</Typography>
                  <Typography className={classes.sectionTitle3}>Documentação Básica</Typography>
                  <Typography className={classes.field3}>Pessoa Física: Cópia da CNH ou RG/CPF</Typography>
                  <Typography className={classes.field3}>Pessoa Jurídica: Cópia do ato constitutivo e Cartão CNPJ</Typography>
                  <Typography className={classes.field3}>Obs: Cópia autenticada de procuração e cópia da CNH ou RG/CPF do procurador caso solicitado por terceiro.</Typography>
                </div>
              ))
            )}
          </div>
         
         
     
          
          <Button 
  onClick={() => {
    if (filteredItems.length > 0) {
      const item = filteredItems[0]; // Pega o primeiro item encontrado
      const telefone = '5548988449379';
      const mensagem = `Olá . Preenchi a Intenção de Venda e a placa é ${item.id}.`;
      const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
      
      window.open(linkWhatsApp, '_blank'); // Abre o WhatsApp automaticamente
    }
  }}
  variant="contained"
  size="large"
  className={`${classes.downloadButton} ${classes.noPrint}`}>

  Enviar Despachante
</Button>
           <Button
  onClick={() => {
    if (filteredItems.length > 0) {
      const item = filteredItems[0]; // Pega o primeiro item encontrado
      const telefone = '5548988749403';
      const mensagem = `Olá . Preenchi a Intenção de Venda e a placa é ${item.id}.`;
      const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
      
      window.open(linkWhatsApp, '_blank'); // Abre o WhatsApp automaticamente
    }
  }}
  variant="contained"
  size="large"
  className={`${classes.downloadButton} ${classes.noPrint}`}
>
  Enviar Digital
</Button>

        </Paper>
      )}
    </div>
  );
};

export default CatalagoList;
