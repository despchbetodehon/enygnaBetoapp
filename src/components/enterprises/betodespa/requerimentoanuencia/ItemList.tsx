
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
    marginTop: theme.spacing(5),
    
  },
  title2: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: theme.spacing(7),
    margin: theme.spacing(7),
    
    
  },
  title3: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: theme.spacing(7),
    margin: theme.spacing(7),
    
    
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
    marginBottom: theme.spacing(1),
    paddingLeft: '10px',
    background: 'rgba(201, 201, 201, 0.58)',
    marginTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
  field3: {
    fontSize: '0.7rem',
    marginBottom: theme.spacing(1),
  },
  field2: {
    fontSize: '1.3rem',
    marginBottom: theme.spacing(2),
    textAlign: 'justify',
    lineHeight: 1.6,
  },
  signatureSection: {
    marginTop: theme.spacing(8),
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    width: '100%',
  },
  signatureBlock: {
    textAlign: 'center',
    width: 'auto',
    borderTop: '2px solid #000',
    paddingTop: theme.spacing(1),
    margin: '0 auto',
    fontSize: '0.9rem',
    minWidth: '300px',
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
  signatureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing(4),
    marginTop: theme.spacing(8),
    width: '100%',
    justifyContent: 'center',
  },
  signatureItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  signatureImage: {
    maxWidth: '200px',
    maxHeight: '80px',
    marginBottom: theme.spacing(1),
  },
  vehicleInfo: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  vehicleItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
    fontSize: '1.1rem',
  },
  bulletPoint: {
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
  },
}));

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

interface ItemListProps {
  items: Item[];
}

const ItemList: React.FC<ItemListProps> = ({ items: propsItems }) => {
  const classes = useStyles();
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const defaultItem: Item = {
    id: '',
    cliente: '',
    status: '',
    quantidade: 0,
    imagemUrls: [],
    concluido: false,
    placa: '',
    renavam: '',
    crv: '',
    chassi: '',
    modelo: '',
    valordevenda: '',
    bairroempresa: '',
    cargo: '',
    cargo2: '',
    cargo3: '',
    cargo4: '',
    cargo5: '',
    cnpjsolicitante: '',
    nomesolicitante: '',
    nomesocio1: '',
    nomesocio2: '',
    nomesocio3: '',
    nomesocio4: '',
    nomesocio5: '',
    cpfsocio1: '',
    cpfsocio2: '',
    cpfsocio3: '',
    cpfsocio4: '',
    cpfsocio5: '',
    enderecosocio1: '',
    enderecosocio2: '',
    complementosocio1: '',
    complementosocio2: '',
    municipiosocio1: '',
    municipiosocio2: '',
    emailsocio1: 'b3certificacao@gmail.com',
    emailsocio2: 'b3certificacao@gmail.com',
    celtelsocio1: '',
    celtelsocio2: '',
    cepsocio1: '',
    cepsocio2: '',
    nomeempresa: '',
    cpfempresa: '',
    enderecoempresa: '',
    complementoempresa: '',
    municipioempresa: '',
    emailempresa: 'b3certificacao@gmail.com',
    celtelempresa: '',
    cepvendedor: '',
    cepempresa: '',
    tipo: '',
    cnpjempresa: '',
    celtelvendedor: '',
    dataCriacao: '',
    signature: ''
  };

  // Carrega itens do Firebase
  useEffect(() => {
    const itemsCollectionRef = collection(db, 'Betodespachanteanuencia');
    
    const unsubscribe = onSnapshot(itemsCollectionRef, (querySnapshot) => {
      const fetchedItems: Item[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as Item);
      });
      setAllItems(fetchedItems);
    });

    return () => unsubscribe();
  }, []);

  // Combina itens do Firebase com itens das props
  const combinedItems = [...allItems, ...propsItems];

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredItems = searchText.length >= 4
    ? combinedItems.filter((item) => {
        const searchLower = searchText.toLowerCase();
        return (
          item.nomesocio1?.toLowerCase().includes(searchLower) ||
          (item.nomeempresa?.toLowerCase().includes(searchLower)) ||
          (item.id?.toLowerCase().includes(searchLower)) ||
          (item.renavam?.toLowerCase().includes(searchLower))
        );
      })
    : [];

  const currentItem = filteredItems.length > 0 ? filteredItems[0] : defaultItem;

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

  const sendWhatsApp = async (pdfURL: string) => { 
    const telefone = '5548988449379';
    const mensagemWhatsApp = `Olá! Seu documento foi gerado e está pronto. Você pode baixá-lo aqui: ${pdfURL}`;
    const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagemWhatsApp)}`;
    window.open(linkWhatsApp, '_blank');
  };

  const generatePDF = async () => {
    const input = document.getElementById('pdf-content');
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    const pdfBlob = pdf.output('blob');
    const storageRef = ref(storage, `pdfs/documento_${Date.now()}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    const pdfURL = await getDownloadURL(storageRef);
    
    pdf.save(`Requerimento_${currentItem.id || 'documento'}.pdf`);
    await sendWhatsApp(pdfURL);
  };

  const getResponsaveis = () => {
    const responsaveis = [];
    
    if (currentItem.nomesocio1) {
      responsaveis.push({
        nome: currentItem.nomesocio1,
        cpf: currentItem.cpfsocio1,
        cargo: currentItem.cargo || 'Responsável Legal'
      });
    }
    
    if (currentItem.nomesocio2) {
      responsaveis.push({
        nome: currentItem.nomesocio2,
        cpf: currentItem.cpfsocio2,
        cargo: currentItem.cargo2 || 'Responsável Legal'
      });
    }
    
    if (currentItem.nomesocio3) {
      responsaveis.push({
        nome: currentItem.nomesocio3,
        cpf: currentItem.cpfsocio3,
        cargo: currentItem.cargo3 || 'Responsável Legal'
      });
    }
    
    if (currentItem.nomesocio4) {
      responsaveis.push({
        nome: currentItem.nomesocio4,
        cpf: currentItem.cpfsocio4,
        cargo: currentItem.cargo4 || 'Responsável Legal'
      });
    }
    
    if (currentItem.nomesocio5) {
      responsaveis.push({
        nome: currentItem.nomesocio5,
        cpf: currentItem.cpfsocio5,
        cargo: currentItem.cargo5 || 'Responsável Legal'
      });
    }

    return responsaveis;
  };

  const renderSociosText = () => {
    const responsaveis = getResponsaveis();

    if (responsaveis.length === 0) {
      return 'representado neste ato por seu representante legal';
    }

    if (responsaveis.length === 1) {
      const resp = responsaveis[0];
      return `representado neste ato por seu ${resp.cargo.toLowerCase()}, ${resp.nome}, CPF: ${resp.cpf}`;
    }

    if (responsaveis.length === 2) {
      const [resp1, resp2] = responsaveis;
      return `representado neste ato por seu ${resp1.cargo.toLowerCase()}, ${resp1.nome}, CPF: ${resp1.cpf}, e ${resp2.cargo.toLowerCase()} ${resp2.nome}, CPF: ${resp2.cpf}`;
    }

    // Para 3 ou mais responsáveis
    const ultimoResp = responsaveis[responsaveis.length - 1];
    const outrosResps = responsaveis.slice(0, -1);
    
    const outrosTexto = outrosResps.map(resp => 
      `${resp.cargo.toLowerCase()} ${resp.nome}, CPF: ${resp.cpf}`
    ).join(', ');
    
    return `representado neste ato por ${outrosTexto}, e ${ultimoResp.cargo.toLowerCase()} ${ultimoResp.nome}, CPF: ${ultimoResp.cpf}`;
  };

  const renderSignatureBlocks = () => {
    const responsaveis = getResponsaveis();

    if (responsaveis.length === 0) return null;

    return (
      <div className={classes.signatureGrid}>
        {responsaveis.map((resp, index) => (
          <div key={index} className={classes.signatureItem}>
            {currentItem.signature && (
              <img 
                src={currentItem.signature} 
                alt={`Assinatura de ${resp.nome}`} 
                className={classes.signatureImage}
              />
            )}
            <div className={classes.signatureBlock}>
              ________________________________
              <br />{resp.nome}
              <br />CPF: {resp.cpf}
              <br />({resp.cargo.toUpperCase()})
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: A4;
          margin: 20mm 10mm;
        }
  
        body {
          margin: 0;
          padding: 0;
        }
  
        .printContent {
          visibility: visible;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: auto;
          min-height: 100vh;
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
          label="Buscar por PLACA RENAVAM VENDEDOR empresa"
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

      {searchText && filteredItems.length > 0 && (
        <Paper className={classes.paper}>
          <div id="pdf-content">
            <div className={classes.header}>
              <Typography className={classes.title}>Detran</Typography>
              <Typography className={classes.subtitle}>Departamento Estadual de Trânsito</Typography>
            </div>
            
            <Typography className={classes.title3} style={{ textAlign: 'center' }}>
              Termo de Anuência – Baixa Permanente de Veículo
            </Typography>
            
            <Typography className={classes.field2} style={{ marginTop: '30px' }}>
              A <strong>empresa {currentItem.nomeempresa || '[Nome da Empresa]'}</strong>, inscrita no CNPJ sob o nº <strong>{currentItem.cnpjempresa || '[CNPJ]'}</strong>, com sede localizada à:
            </Typography>

            <Typography className={classes.field2}>
              <strong>CEP:</strong> {currentItem.cepempresa || '[CEP]'}
              <br /><strong>Endereço:</strong> {currentItem.enderecoempresa || '[Endereço]'}
              <br /><strong>Bairro:</strong> {currentItem.bairroempresa || '[Bairro]'}
              <br /><strong>Município:</strong> {currentItem.municipioempresa || '[Município]'}
              <br /><strong>Estado:</strong> {currentItem.complementoempresa || '[Estado]'}
            </Typography>

            <Typography className={classes.field2}>
              {renderSociosText()}, vem por meio deste, declarar que está ciente e anuente com a solicitação de baixa permanente do veículo no qual possui CRV preenchido, conforme dados abaixo:
            </Typography>
            
            <div className={classes.vehicleInfo}>
              <div className={classes.vehicleItem}>
                <span className={classes.bulletPoint}>•</span>
                <strong>Placa:</strong> {currentItem.id || '[Placa]'}
              </div>
              <div className={classes.vehicleItem}>
                <span className={classes.bulletPoint}>•</span>
                <strong>Marca/Modelo:</strong> {currentItem.modelo || '[Marca/Modelo]'}
              </div>
              <div className={classes.vehicleItem}>
                <span className={classes.bulletPoint}>•</span>
                <strong>Chassi:</strong> {currentItem.chassi || '[Chassi]'}
              </div>
              <div className={classes.vehicleItem}>
                <span className={classes.bulletPoint}>•</span>
                <strong>Renavam:</strong> {currentItem.renavam || '[Renavam]'}
              </div>
            </div>
            
            <Typography className={classes.field2}>
              A empresa declara ainda que a baixa do referido veículo será realizada conforme as normas e procedimentos vigentes estabelecidos pelo DETRAN/SC, estando ciente de que, uma vez efetuada a baixa permanente, o veículo não poderá retornar à circulação.
            </Typography>
            
            <Typography className={classes.field2} style={{ marginTop: '30px' }}>
              <strong>Nestes termos, pede deferimento.</strong>
            </Typography>

            <Typography className={classes.field2} style={{ marginTop: '20px', textAlign: 'right' }}>
              <strong>{(currentItem.municipioempresa || '[Município]').toUpperCase()}, {formatDate(currentItem.dataCriacao).replace(/\//g, ' DE ').replace(/(\d{2}) DE (\d{2}) DE (\d{4})/, '$1 DE $2 DE $3').replace(/01 DE/g, 'JANEIRO DE').replace(/02 DE/g, 'FEVEREIRO DE').replace(/03 DE/g, 'MARÇO DE').replace(/04 DE/g, 'ABRIL DE').replace(/05 DE/g, 'MAIO DE').replace(/06 DE/g, 'JUNHO DE').replace(/07 DE/g, 'JULHO DE').replace(/08 DE/g, 'AGOSTO DE').replace(/09 DE/g, 'SETEMBRO DE').replace(/10 DE/g, 'OUTUBRO DE').replace(/11 DE/g, 'NOVEMBRO DE').replace(/12 DE/g, 'DEZEMBRO DE')}</strong>
            </Typography>
            
            {renderSignatureBlocks()}
            
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <Typography className={classes.field3}>b3certificacao@gmail.com</Typography>
            </div>
          </div>

          <Button 
            onClick={() => {
              if (filteredItems.length > 0) {
                const item = filteredItems[0];
                const telefone = '5548988449379';
                const mensagem = `Olá. Preenchi a Anuência e a placa é ${item.id}.`;
                const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
                window.open(linkWhatsApp, '_blank');
              }
            }}
            variant="contained"
            size="large"
            className={`${classes.downloadButton} ${classes.noPrint}`}
          >
            Enviar Despachante
          </Button>
          
          <Button
            onClick={() => {
              if (filteredItems.length > 0) {
                const item = filteredItems[0];
                const telefone = '5548988749403';
                const mensagem = `Olá. Preenchi a Anuência e a placa é ${item.id}.`;
                const linkWhatsApp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
                window.open(linkWhatsApp, '_blank');
              }
            }}
            variant="contained"
            size="large"
            className={`${classes.downloadButton} ${classes.noPrint}`}
            style={{ marginLeft: '10px' }}
          >
            Enviar Digital
          </Button>
        </Paper>
      )}

      {searchText && searchText.length >= 4 && filteredItems.length === 0 && (
        <Paper className={classes.paper} style={{ textAlign: 'center', padding: '40px' }}>
          <Typography variant="h6" style={{ color: '#666' }}>
            Nenhum documento encontrado para "{searchText}"
          </Typography>
          <Typography variant="body2" style={{ color: '#999', marginTop: '10px' }}>
            Verifique se a placa, renavam, nome do vendedor ou empresa estão corretos.
          </Typography>
        </Paper>
      )}

      {searchText && searchText.length < 4 && searchText.length > 0 && (
        <Paper className={classes.paper} style={{ textAlign: 'center', padding: '40px' }}>
          <Typography variant="h6" style={{ color: '#666' }}>
            Digite pelo menos 4 caracteres para buscar
          </Typography>
        </Paper>
      )}
    </div>
  );
};

export default ItemList;
