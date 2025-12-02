import React, { useEffect, useState, ReactNode } from 'react';
import { Typography, TextField, Button, Grid, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { collection, getFirestore, onSnapshot, deleteDoc, doc, updateDoc, getDocs, where, query } from 'firebase/firestore';
import { app } from '../../logic/firebase/config/app';
import Colecao from '../../logic/firebase/db/Colecao';
import Autenticacao from '../../logic/firebase/auth/Autenticacao';

import { motion, useMotionTemplate, useSpring } from 'framer-motion';
import Usuario from '../../logic/core/usuario/Usuario';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 auto',
    marginTop: theme.spacing(4),
    maxWidth: '500px',
  },
  item: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  concluido: {
    backgroundColor: '#D1FFD0',
  },
  pendente: {
    backgroundColor: '#FFD1D1',
    animation: 'pulse 1s infinite',
  },
  button: {
    backgroundColor: '#00FF00',
    color: 'black',
  },
  buttonPendente: {
    backgroundColor: '#FF0000',
    color: 'black',
  },
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 },
  },
}));

const db = getFirestore(app);
const itemsCollectionRef = collection(db, 'items');

interface Item {
  id: string;
  nome: string;
  quantidade: number;
  localCompra: string;
  concluido: boolean;
  userId: string;
}

interface ItemListProps {
  items: Item[];
}

interface CardProps {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  const mouseX = useSpring(0, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(0, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: any) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const maskImage = useMotionTemplate`radial-gradient(240px at ${mouseX}px ${mouseY}px, white, transparent)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <div
      onMouseMove={onMouseMove}
      className="overflow-hidden relative duration-700 border rounded-xl hover:bg-zinc-800/10 group md:gap-8 hover:border-zinc-400/50 border-zinc-600"
    >
      <div className="pointer-events-none">
        <div className="absolute inset-0 z-0 transition duration-1000 [mask-image:linear-gradient(black,transparent)]" />
        <motion.div
          className="absolute inset-0 z-10 bg-gradient-to-br opacity-100 via-zinc-100/10 transition duration-1000 group-hover:opacity-50"
          style={style}
        />
        <motion.div
          className="absolute inset-0 z-10 opacity-0 mix-blend-overlay transition duration-1000 group-hover:opacity-100"
          style={style}
        />
      </div>
      {children}
    </div>
  );
};

const ItemList: React.FC<ItemListProps> = ({ items }) => {
  const classes = useStyles();
  const [updatedItems, setUpdatedItems] = useState<Item[]>(items);

  return (
    <div className="justify-center container mx-auto p-15">
      <Paper className={classes.root}>
        <Typography variant="h5" align="center" gutterBottom>
          Lista
        </Typography>
        {updatedItems.map((item) => (
          <Card key={item.id}>
            <Grid container spacing={4} className={`${classes.item} ${item.concluido ? classes.concluido : classes.pendente}`}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Nome"
                  value={item.nome}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  type="number"
                  label="Quantidade"
                  value={item.quantidade}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Local"
                  value={item.localCompra}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Card>
        ))}
      </Paper>
    </div>
  );
};

export default ItemList;
