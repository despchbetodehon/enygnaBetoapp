import React from 'react';
import Head from 'next/head';

import Land from '@/components/home/land';
import Servicos from '@/components/home/servicos';
import Sobre from '@/components/home/sobre';
import { Box, Container, Typography, Paper, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    width: '100%',
    overflowX: 'hidden',
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: theme.spacing(2),
  },
  title: {
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
  },
  content: {
    marginTop: theme.spacing(4),
  },
}));

const BetoHome: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Typography variant="h3" className={classes.title}>
                Bem-vindo ao Beto Despachante
              </Typography>
              <Typography variant="h6">
                Serviços automotivos com qualidade e eficiência
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h5" className={classes.title}>
                Serviços Disponíveis
              </Typography>
              <Typography variant="body1">
                • Transferência de veículos<br/>
                • Requerimentos diversos<br/>
                • Documentação digital<br/>
                • Consultoria automotiva
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper className={classes.paper}>
              <Typography variant="h5" className={classes.title}>
                Atendimento
              </Typography>
              <Typography variant="body1">
                Segunda a Sexta: 8h às 18h<br/>
                Sábado: 8h às 12h<br/>
                Domingo: Fechado
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};


export default function Home() {
  return (
    <>
      <Head>
        <title>Despachante Beto Dheon | Documentação Veicular</title>
        <meta
          name="description"
          content="Despachante Beto Dheon - Soluções em documentação veicular no Brasil e no exterior. Atendimento ágil, digital e seguro!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/betologo.jpg" />
      </Head>

  
      <Land />
      <Servicos />
      <Sobre />
     
    </>
  );
}