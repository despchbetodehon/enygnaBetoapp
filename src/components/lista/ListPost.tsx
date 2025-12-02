import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Colecao from '../../logic/firebase/db/Colecao';
import { Item } from './Item';
import styles from './ListPost.module.css';
import Autenticacao, { MonitorarUsuario, CancelarMonitoramento } from '../../logic/firebase/auth/Autenticacao';

const autenticacao = new Autenticacao();

const useStyles = makeStyles((theme) => ({
  form: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

interface ListPostProps {
  setItems: (items: Item[]) => void;
}

const ListPost: React.FC<ListPostProps> = ({ setItems }) => {
  const classes = useStyles();
  const [newItem, setNewItem] = useState<Item>({
    nome: '',
    quantidade: 0,
    localCompra: '',
    concluido: false,
    userId: '',
  });

  const handleAddItem = async () => {
    try {
      const usuarioLogado = autenticacao.obterUsuarioLogado();
  
      if (usuarioLogado) {
        // Salvar o novo item no Firestore com o ID do usuário logado
        const colecao = new Colecao();
        const itemSalvo = await colecao.salvar('items', {
          ...newItem,
          userId: (await usuarioLogado)?.id || '',
        });
        const adaptedItemSalvo: Item = {
          nome: itemSalvo.nome,
          quantidade: itemSalvo.quantidade,
          localCompra: itemSalvo.localCompra,
          concluido: itemSalvo.concluido,
          userId: itemSalvo.userId,
        };
    
        setNewItem({
          nome: '',
          quantidade: 0,
          localCompra: '',
          concluido: false,
          userId: '',
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar o item:', error);
    }
  };
  

  return (
    <div className={`${styles.container} ${classes.form} `}>
      <Paper className={classes.form}>
        <Typography variant="h5" align="center" gutterBottom>
          Lista de Compras
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Nome do Item"
              value={newItem.nome}
              onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Quantidade"
              type="number"
              value={newItem.quantidade}
              onChange={(e) =>
                setNewItem({ ...newItem, quantidade: parseInt(e.target.value, 10) || 0 })
              }
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Local de Compra"
              value={newItem.localCompra}
              onChange={(e) => setNewItem({ ...newItem, localCompra: e.target.value })}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Button onClick={handleAddItem} variant="contained" color="primary" size="large" fullWidth>
          Adicionar Item
        </Button>
      </Paper>
    </div>
  );
};

export default ListPost;
