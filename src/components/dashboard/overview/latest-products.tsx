'use client';
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { DotsThreeVertical as DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/ssr/DotsThreeVertical';
import dayjs from 'dayjs';
import Config from '@/components/Config';
import axios from 'axios';
interface Product {
  id: string;
  image?: string;
  name: string;
  created_at: string;
}

export function LatestProducts(): React.JSX.Element {
  const [latestProducts, setLatestProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [postoId, setPostoId] = React.useState<string | null>(null);
  const [produtoInfo, setProdutoInfo] = React.useState<any>(null);

  const mediaUrl = Config.getApiUrlMedia();
  const [openModal, setOpenModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'entregar' | 'receber'>('entregar'); // 'entregar' ou 'receber'

  const fetchLatestProducts = async (postoId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://fad7-154-71-159-172.ngrok-free.app/api/posto/registro/${postoId}/`,{
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      setLatestProducts(response.data.latest || []);  // Armazena os últimos produtos
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao buscar os últimos produtos:', error);
      setError('Erro ao carregar os últimos produtos, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.posto?.id;
      if (postoId) {
        setPostoId(postoId);
        fetchLatestProducts(postoId);
      }
    }
  }, []);
  const handleOpenModal = (produto: Product) => {
    setProdutoInfo(produto); // Define todas as informações do produto no modal
    setOpenModal(true);
  };

  return (
    <Card>
      <CardHeader title="Últimos Produtos" />
      <Divider />
      {loading ? (
        <p>Carregando...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <List>
          {latestProducts.map((product, index) => (
            <ListItem divider={index < latestProducts.length - 1} key={product.id}>
                <ListItemAvatar>
                {product.transacao?.lance?.produto?.imagens?.[0]?.imagem ? (
                  <Box
                    component="img"
                    src={`${mediaUrl}${product.transacao.lance.produto.imagens[0].imagem}`}
                    sx={{ borderRadius: 1, height: '48px', width: '48px', objectFit: 'cover' }}
                    alt={product.transacao.lance.produto.nome}
                  />
                ) : (
                  <Box
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'var(--mui-palette-neutral-200)',
                      height: '48px',
                      width: '48px',
                    }}
                  />
                )}
              </ListItemAvatar>
              <ListItemText
                primary={product.transacao.lance.produto.nome}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`Publicado em ${dayjs(product.created_at).format('DD/MM/YYYY')}`}
                secondaryTypographyProps={{ variant: 'body2' }}
                onClick={() => handleOpenModal(product.transacao.lance.produto)}              />
              <IconButton edge="end">
                <DotsThreeVerticalIcon weight="bold" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          Ver Todos
        </Button>

        <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalhes do Produto</DialogTitle>
        <DialogContent>
          {produtoInfo && (
            <>
              <Typography variant="h6">Produto: {produtoInfo.name}</Typography>
              <Typography variant="body1">Descrição: {produtoInfo.descricao || 'N/A'}</Typography>
              <Typography variant="body1">Preço: {produtoInfo.preco || 'N/A'}</Typography>
              {produtoInfo.imagens && produtoInfo.imagens.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <Typography variant="body1">Imagens:</Typography>
                  {produtoInfo.imagens.map((img, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <img
                        src={`${mediaUrl}${img.imagem}`}
                        alt={`Imagem ${index + 1}`}
                        style={{ maxWidth: '100%', borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
      </CardActions>
    </Card>
  );
}
