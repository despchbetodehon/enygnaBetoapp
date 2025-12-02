
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
    fontSize: '12pt',
    '@media print': {
      boxShadow: 'none',
      margin: '0',
      padding: '10px',
      width: '100%',
      fontSize: '12pt',
      boxSizing: 'border-box',
      pageBreakBefore: 'auto',
    },
  },
  noPrint: {
    '@media print': {
      display: 'none !important',
    },
  },
  documentTitle: {
    fontSize: '18pt',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    textTransform: 'uppercase',
  },
  documentText: {
    fontSize: '12pt',
    lineHeight: 1.8,
    textAlign: 'justify',
    marginBottom: theme.spacing(2),
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
    fontSize: '12pt',
  },
  footer: {
    fontSize: '10pt',
    textAlign: 'center',
    marginTop: theme.spacing(4),
    fontStyle: 'italic',
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
  chassi: string;
  modelo: string;
  anoFabricacao: string;
  anoModelo: string;
  cor: string;
  combustivel: string;
  
  nomeProprietario: string;
  cpfProprietario: string;
  rgProprietario: string;
  nacionalidadeProprietario: string;
  dataNascimentoProprietario: string;
  nomePaiProprietario: string;
  nomeMaeProprietario: string;
  enderecoProprietario: string;
  complementoProprietario: string;
  municipioProprietario: string;
  estadoProprietario: string;
  cepProprietario: string;
  
  nomeProcurador: string;
  cpfProcurador: string;
  rgProcurador: string;
  nacionalidadeProcurador: string;
  estadoCivilProcurador: string;
  profissaoProcurador: string;
  enderecoProcurador: string;
  complementoProcurador: string;
  municipioProcurador: string;
  estadoProcuradorEnd: string;
  cepProcurador: string;
  
  dataCriacao: string | Timestamp;
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
    anoFabricacao: '',
    anoModelo: '',
    cor: '',
    combustivel: '',
    
    nomeProprietario: '',
    cpfProprietario: '',
    rgProprietario: '',
    nacionalidadeProprietario: 'brasileiro(a)',
    dataNascimentoProprietario: '',
    nomePaiProprietario: '',
    nomeMaeProprietario: '',
    enderecoProprietario: '',
    complementoProprietario: '',
    municipioProprietario: '',
    estadoProprietario: '',
    cepProprietario: '',
    
    nomeProcurador: '',
    cpfProcurador: '',
    rgProcurador: '',
    nacionalidadeProcurador: 'brasileiro',
    estadoCivilProcurador: '',
    profissaoProcurador: '',
    enderecoProcurador: '',
    complementoProcurador: '',
    municipioProcurador: '',
    estadoProcuradorEnd: '',
    cepProcurador: '',
    
    dataCriacao: '',
    signature: ''
  };

  // Carrega itens do Firebase
  useEffect(() => {
    const itemsCollectionRef = collection(db, 'Betodespachanteprocuracaoeletronica');
    
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
          item.nomeProprietario?.toLowerCase().includes(searchLower) ||
          (item.nomeProcurador?.toLowerCase().includes(searchLower)) ||
          (item.id?.toLowerCase().includes(searchLower)) ||
          (item.placa?.toLowerCase().includes(searchLower))
        );
      })
    : [];

  const currentItem = filteredItems.length > 0 ? filteredItems[0] : defaultItem;

  const formatDate = (date: string | Timestamp | undefined | null) => {
    if (!date) return format(new Date(), 'dd/MM/yyyy');

    let localDate;

    if (date instanceof Timestamp) {
      localDate = date.toDate();
    } else {
      localDate = new Date(date);
    }

    if (isNaN(localDate.getTime())) return format(new Date(), 'dd/MM/yyyy');

    return format(localDate, 'dd/MM/yyyy');
  };

  const sendWhatsApp = async (pdfURL: string) => { 
    const telefone = '5548988449379';
    const mensagemWhatsApp = `Olá! Sua procuração eletrônica foi gerada e está pronta. Você pode baixá-la aqui: ${pdfURL}`;
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
    const storageRef = ref(storage, `pdfs/procuracoes/procuracao_${Date.now()}.pdf`);
    await uploadBytes(storageRef, pdfBlob);
    const pdfURL = await getDownloadURL(storageRef);
    
    pdf.save(`Procuracao_${currentItem.id || 'documento'}.pdf`);
    await sendWhatsApp(pdfURL);
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
          label="Buscar por PLACA, PROPRIETÁRIO ou PROCURADOR"
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
            <Typography className={classes.documentTitle}>
              PROCURAÇÃO ELETRÔNICA
            </Typography>

            <Typography className={classes.documentText}>
              Eu, <strong>{currentItem.nomeProprietario || '[NOME DO PROPRIETÁRIO]'}</strong>, nacionalidade: {currentItem.nacionalidadeProprietario}, nascido(a) em {currentItem.dataNascimentoProprietario || '[DATA DE NASCIMENTO]'}, filho(a) de <strong>{currentItem.nomePaiProprietario || '[NOME DO PAI]'}</strong> e <strong>{currentItem.nomeMaeProprietario || '[NOME DA MÃE]'}</strong>, residente e domiciliado(a) em <strong>{currentItem.enderecoProprietario || '[ENDEREÇO]'}, {currentItem.municipioProprietario || '[MUNICÍPIO]'}/{currentItem.estadoProprietario || '[ESTADO]'}</strong>. Cédula de identidade n° <strong>{currentItem.rgProprietario || '[RG]'}</strong>, inscrito(a) no CPF sob o nº <strong>{currentItem.cpfProprietario || '[CPF]'}</strong>; por este instrumento nomeia(m) e constitui(em) seu(s) (sua(s)) bastante procurador(a)(es)(as), podendo agir em CONJUNTO ou ISOLADAMENTE, <strong>{currentItem.nomeProcurador || '[NOME DO PROCURADOR]'}</strong>, RG Nº <strong>{currentItem.rgProcurador || '[RG]'}</strong>, CPF Nº <strong>{currentItem.cpfProcurador || '[CPF]'}</strong>, nacionalidade {currentItem.nacionalidadeProcurador}, estado civil <strong>{currentItem.estadoCivilProcurador || '[ESTADO CIVIL]'}</strong>, profissão <strong>{currentItem.profissaoProcurador || '[PROFISSÃO]'}</strong>, residente na <strong>{currentItem.enderecoProcurador || '[ENDEREÇO]'}, {currentItem.municipioProcurador || '[MUNICÍPIO]'}/{currentItem.estadoProcuradorEnd || '[ESTADO]'}</strong>, com poderes para o fim especial de vender, transferir à quem lhe convier pelo preço e condições que ajustar o veículo de propriedade da Outorgante, com as seguintes características: marca/modelo: <strong>{currentItem.modelo || '[MARCA/MODELO]'}</strong>, placa: <strong>{currentItem.id || '[PLACA]'}</strong>, código RENAVAM: <strong>{currentItem.renavam || '[RENAVAM]'}</strong>, chassi: <strong>{currentItem.chassi || '[CHASSI]'}</strong>, combustível: <strong>{currentItem.combustivel || '[COMBUSTÍVEL]'}</strong>, ano fab.: <strong>{currentItem.anoFabricacao || '[ANO FAB.]'}</strong> ano mod.: <strong>{currentItem.anoModelo || '[ANO MOD.]'}</strong>, cor predominante: <strong>{currentItem.cor || '[COR]'}</strong>; podendo para isso ditos Procurador(es), receber o preço da venda, dar recibos e quitações, assinar requerimentos, termos de transferências e ou de repasse de bem, solicitar e retirar 2ª via de documentos - CRV e CRLV, emitir CRLV digital, endosso de documentação, efetuar vistorias, receber créditos de consórcios, solicitar colocação de placas e lacre, retirar documentos postados nos Correios, alterar endereço de postagem, solicitar remarcação de chassi e motor ou troca de motor, solicitar troca categoria ou combustível, requerer alteração de características e dados, solicitar intenção de venda (ATPV), realizar o cancelamento de intenção de venda (ATPV), solicitar etiquetas de identificação, solicitar baixa definitiva do veículo, comunicar venda junto aos órgãos competentes, cancelar comunicação de venda, cancelamento de processo de transferência, manter reserva de domínio, retirar reserva de domínio, usar o veículo em apreço, manejando o mesmo em qualquer parte do território nacional ou estrangeiro, ficando civil e criminalmente responsável por qualquer acidente, multas ou ocorrências que venha a ocorrer com o veículo, que na presente data passa a ser de total responsabilidade dos Outorgados, usar e gozar do veículo como coisa sua e sem interferência ou autorização de outros, requerer, perante qualquer autoridade alfandegária ou aduaneira de país estrangeiro, licença ou permissão e turismo, pelo tempo e prazo que julgar conveniente, podendo representar a Outorgante, junto as repartições públicas federais, estaduais, municipais, inclusive junto ao DETRAN e onde com esta apresentar-se, pagar taxas, multas e impostos, efetuar licenciamento, assinar termos de entrega e ou qualquer outro documento que for necessário em caso de apreensão do veículo, inclusive retirar/liberar o referido veículo, bem como representar perante qualquer instituição financeira, banco comercial, companhia de arrendamento mercantil ou administradora de consorcio para efetivar a quitação de financiamentos, leasings ou consórcios e a baixa/levantamento de qualquer gravame ou restrição, tais como alienação fiduciária em garantia ou reserva de domínio, assim como para efetuar a retirada do instrumento de liberação ou ainda assinar opção de compra, carta resposta, termo de rescisão contratual, termo de liquidação contratual de arrendamento mercantil ou documento equivalente, conforme o caso e se necessário for, representando e assinando o que preciso for para o referido fim, <strong>VEDADO SUBSTABELECER</strong>.
            </Typography>

            <Typography className={classes.documentText}>
              A procuração é outorgada em caráter irrevogável e irretratável.
            </Typography>

            <Typography className={classes.documentText}>
              Tubarão, {formatDate(currentItem.dataCriacao)}.
            </Typography>

            {currentItem.signature && (
              <div className={classes.signatureSection}>
                <img src={currentItem.signature} alt="Assinatura do Proprietário" style={{ maxWidth: '300px' }} />
              </div>
            )}

            <div className={classes.signatureSection}>
              <div className={classes.signatureBlock}>
                ASSINATURA
              </div>
            </div>

            <Typography className={classes.footer}>
              PROCURAÇÃO VÁLIDA CONFORME PORTARIA Nº 0656/DETRAN/PROJUR/2022 de 15/12/2022 Art. 2º e LEI Nº 14.063, DE 23 DE SETEMBRO DE 2020
            </Typography>
          </div>

          <Button 
            onClick={() => {
              if (filteredItems.length > 0) {
                const item = filteredItems[0];
                const telefone = '5548988449379';
                const mensagem = `Olá! Preenchi a Procuração Eletrônica e a placa é ${item.id}.`;
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
                const mensagem = `Olá! Preenchi a Procuração Eletrônica e a placa é ${item.id}.`;
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

          <Button
            onClick={generatePDF}
            variant="contained"
            size="large"
            className={`${classes.downloadButton} ${classes.noPrint}`}
            style={{ marginLeft: '10px' }}
          >
            Gerar PDF
          </Button>
        </Paper>
      )}

      {searchText && searchText.length >= 4 && filteredItems.length === 0 && (
        <Paper className={classes.paper} style={{ textAlign: 'center', padding: '40px' }}>
          <Typography variant="h6" style={{ color: '#666' }}>
            Nenhuma procuração encontrada para "{searchText}"
          </Typography>
          <Typography variant="body2" style={{ color: '#999', marginTop: '10px' }}>
            Verifique se a placa, nome do proprietário ou procurador estão corretos.
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
