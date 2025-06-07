'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import axios from 'axios';  // Para consumir a API
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Snackbar, Alert } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Config from "../../../../Config";
import { fetchWithToken } from '../../../../authService';
function noop(): void {
  // do nothing
}

interface Lance {
  id: string;
  status: string;
  preco: number;
  usuario: string;
  produto: string;
  posto: string;
  descricao: string;
  date: string;  // Data do lance
}

interface LancesTableProps {
  count?: number;
  page?: number;
  rowsPerPage?: number;
}

export function CustomersTable({
  count = 0,
  page = 0,
  rowsPerPage = 10,
}: LancesTableProps): React.JSX.Element {
  const [lances, setLances] = React.useState<Lance[]>([]);  // Estado para armazenar lances
  const [loading, setLoading] = React.useState(false);  // Estado para controlar o carregamento
  const [searchTerm, setSearchTerm] = React.useState('');
  const [postoId, setPostoId] = React.useState<string | null>(null);
  const [funcionarioId, setFuncionarioId] = React.useState<string | null>(null);
  const [lanceId, setLanceId] = React.useState<string | null>(null);
  const [condicoesSelecionadas, setCondicoesSelecionadas] = React.useState<string[]>([]);
  const [observacoes, setObservacoes] = React.useState<string>('');
  const [imagem, setImagem] = React.useState<File | null>(null);
  const [produtoInfo, setProdutoInfo] = React.useState<any>(null);
  const [selectedImage, setSelectedImage] = React.useState(null);

  const baseUrl = Config.getApiUrl();
  const mediaUrl = Config.getApiUrlMedia();

  const [openModal, setOpenModal] = React.useState(false);
  const [openModalProduct, setOpenModalProduct] = React.useState(false);

  const [modalType, setModalType] = React.useState<'Entregar' | 'Receber' | 'Negar' | 'Devolver'>('Entregar');
  // 'entregar', 'receber', 'negar' ou 'devolver'

  const [error, setError] = React.useState<string | null>(null);  // Estado para mensagens de erro

  // Função para buscar os lances da API
  const fetchLances = async (postoId: string) => {
    setLoading(true);
    try {
      const response = await fetchWithToken(`api/posto/${postoId}/lances/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true",
        },
      });  // Fazendo requisição à API
      const data = await response.json();
      setLances(data.lances);  // Armazena os lances no estado
      console.log(data.lances);
    } catch (error) {
      console.error('Erro ao buscar os lances:', error);
      setError('Erro ao carregar os lances, tente novamente mais tarde.'); // Exibe o erro na interface
    } finally {
      setLoading(false);
    }
  };
  const condicoes = ['É recondicionado?', 'É selado?', 'Está danificado?', 'Está com garantia?'];  // Lista de condições

  const toggleCondicao = (condicao: string) => {
    setCondicoesSelecionadas((prevSelected) => {
      if (prevSelected.includes(condicao)) {
        return prevSelected.filter(item => item !== condicao);
      } else {
        return [...prevSelected, condicao];
      }
    });
  };

  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.posto?.id;
      if (postoId) {
        setPostoId(postoId);
        setFuncionarioId(userData.id)
        fetchLances(postoId);
      }
    }
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredLances = lances.filter((lance) =>
    (lance.produto?.nome && lance.produto.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lance.posto?.nome && lance.posto.nome.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Função base para envio dos dados
  const enviarRegistroProduto = async (url: string) => {
    console.log('Enviando dados para a API...');
    console.log('Dados:', {
      postoId,
      funcionarioId,
      lanceId,
      condicoesSelecionadas,
      observacoes,
      imagem,
    });

    if (!postoId || !funcionarioId || !lanceId || condicoesSelecionadas.length === 0) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const formData = new FormData();
    formData.append('posto_id', postoId);
    formData.append('funcionario_id', funcionarioId);
    formData.append('lance_id', lanceId);
    formData.append('estado_produto', condicoesSelecionadas.join(', '));
    formData.append('observacoes', observacoes);

    if (imagem) {
      formData.append('imagem', imagem); // Apenas envie o File diretamente
    }

    try {
      const res = await fetchWithToken(url, {
        method: 'POST',
        headers: {

          "ngrok-skip-browser-warning": "true",
        },
        body: formData
      });
      const data = await res.json();

      console.log('Resposta da API:', res);
      if (res.status !== 200) {
        const errorResponse = await data;
        setError(errorResponse?.error || 'Erro desconhecido');
        return;
      }
      const registro_id = data.registro.id;
      gerarFaturaPosto(registro_id);

      setOpenModal(false);  // Fecha o modal após sucesso
      alert('Registro realizado com sucesso!');
      window.location.reload();

    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      setError('Erro ao enviar os dados, tente novamente mais tarde.'); // Exibe o erro na interface
      setOpenModal(false);
    }
  };

  const handleOpenModal = (type: 'entregar' | 'receber', lanceId: string, produto: any) => {
    setModalType(type);
    setLanceId(lanceId);
    setProdutoInfo(produto);  // Armazenar as informações do produto no estado
    setOpenModal(true);  // Abre o modal
  };
  const handleOpenModalProduct = (type: 'entregar' | 'receber', lanceId: string, produto: any) => {
    setModalType(type);
    setLanceId(lanceId);
    setProdutoInfo(produto);  // Armazenar as informações do produto no estado
    setOpenModalProduct(true);  // Abre o modal
  };
  const gerarFaturaPosto = async (registroId) => {
    try {
      const apiUrl = `${baseUrl}api/registro-posto/${registroId}/`;
      window.open(apiUrl, '_blank');  // Abre a URL em uma nova aba


    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      alert("Não foi possível gerar a fatura.");
    }
  };


  // Função para registrar entrega
  const registrarEntrega = async () => {
    console.log('Tentando registrar entrega');
    const url = `api/posto/entregar-produto/`;
    await enviarRegistroProduto(url);
  };

  // Função para registrar recebimento
  const registrarRecebimento = async () => {
    console.log('Tentando registrar recebimento');

    const url = 'api/posto/receber-produto/';
    console.log(url);
    await enviarRegistroProduto(url);
  };
  const registrarNegacao = async () => {
    console.log('Tentando registrar entrega');
    const url = `api/posto/negar-produto/`;
    await enviarRegistroProduto(url);
  };
  const registrarDevolucao = async () => {
    console.log('Tentando registrar entrega');
    const url = `api/posto/devolver-produto/`;
    await enviarRegistroProduto(url);
  };
  const handleEnviarCodigo = async (lanceId: string, tipo?: string) => {
    try {
      const res = await fetchWithToken(`api/enviar-codigo/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(
          { lance_id: lanceId, tipo: tipo || "entrega" },
        )
      });
      const data = await res.json();
      alert(data.message);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      alert("Erro ao enviar código.");
    }
  };

  const handleConfirmarCodigo = async (lanceId: string, codigo: string, tipo?: string) => {
    try {
      const res = await fetchWithToken(`api/confirmar-codigo/${lanceId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(
          { codigo_verificacao: codigo, tipo: tipo || "" },
        )
      });
      const data = await res.json();
      alert(data.message);
      window.location.reload()
    } catch (error) {
      console.error("Erro ao confirmar código:", error);
      alert("Erro ao confirmar código.");
    }
  };

  const handleAbrirModalConfirmacao = (lanceId: string) => {
    const codigo = prompt("Digite o código de verificação:");
    if (codigo) {
      handleConfirmarCodigo(lanceId, codigo);
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <OutlinedInput
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            placeholder="Pesquisar lance"
            startAdornment={
              <InputAdornment position="start">
                <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
              </InputAdornment>
            }
            sx={{ maxWidth: '500px' }}
          />
        </Box>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow>
              <TableCell>Lance</TableCell>
              <TableCell>Imagem</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Gaveta</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLances.map((lance) => (
              <TableRow hover key={lance.id}>
                <TableCell>{lance.id}</TableCell>
                <TableCell>
                  <img
                    src={`${mediaUrl}${lance?.produto?.imagens[0]?.imagem}`}
                    alt="Imagem do Produto"
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginTop: '10px'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenModalProduct('entregar', lance.id, lance.produto)}>
                    {lance.produto.nome}
                  </Button>
                </TableCell>
                <TableCell>{lance.numero_gaveta}</TableCell>
                <TableCell>{lance.status_pos_pagamento}</TableCell>
                <TableCell>{lance.quantidade}</TableCell>
                <TableCell>{lance.preco}</TableCell>
                <TableCell>{dayjs(lance.created_at).format('MMM D, YYYY')}</TableCell>
                <TableCell>{lance.descricao}</TableCell>
                <TableCell>
                  {lance.status_pos_pagamento
                    === "espera" && (
                      <Button
                        onClick={() => handleOpenModal('receber', lance.id)}
                        color="secondary"
                      >
                        Receber
                      </Button>
                    )}
                  {lance.status_pos_pagamento === "recebido" && (
                    <>
                      {!lance.codigo_verificado ? (
                        <>
                          <Button
                            onClick={() => handleEnviarCodigo(lance.id)}
                            color="secondary"
                          >
                            Enviar Código
                          </Button>
                          <Button
                            onClick={() => handleAbrirModalConfirmacao(lance.id)}
                            color="warning"
                          >
                            Confirmar Código
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleOpenModal('entregar', lance.id)}
                            color="primary"
                          >
                            Entregar Produto
                          </Button>
                          <Button
                            onClick={() => handleOpenModal('negar', lance.id)}
                            color="error"
                          >
                            Negar
                          </Button>
                        </>
                      )}

                    </>
                  )}

                  {lance.status_pos_pagamento === "recusado" && (
                    <>
                      {lance.codigo_verificado_devolucao ? (
                        <>
                          <Button
                            onClick={() => handleEnviarCodigo(lance.id, 'devolucao')}
                            color="secondary"
                          >
                            Enviar Código
                          </Button>
                          <Button
                            onClick={() => handleAbrirModalConfirmacao(lance.id, 'devolucao')}
                            color="warning"
                          >
                            Confirmar Código
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => handleOpenModal('devolver', lance.id)}
                          color="warning"
                        >
                          Devolver
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Exibindo erros usando Snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}


      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {modalType === 'entregar' && 'Registrar Entrega'}
          {modalType === 'receber' && 'Registrar Recebimento'}
          {modalType === 'negar' && 'Registrar Negação'}
          {modalType === 'devolver' && 'Registrar Devolução'}
        </DialogTitle>
        <DialogContent>
          {/* Exibir as informações do produto */}
          {/* Exibir campos de condições, observações e imagem apenas para ações de "entregar" ou "receber" */}
          {(modalType === 'entregar' || modalType === 'receber' || modalType === 'negar' || modalType === 'devolver') && (
            <>
              <Typography variant="h6">Condições do Produto</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {condicoes.map((condicao) => (
                  <FormControlLabel
                    key={condicao}
                    control={
                      <Checkbox
                        checked={condicoesSelecionadas.includes(condicao)}
                        onChange={() => toggleCondicao(condicao)}
                        name={condicao}
                      />
                    }
                    label={condicao}
                  />
                ))}
              </Box>

              {/* Observações */}
              <TextField
                fullWidth
                label="Observações"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                margin="normal"
                multiline
                rows={4}
              />

              {/* Imagem */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagem(e.target.files ? e.target.files[0] : null)}
                style={{ marginTop: 10 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">Cancelar</Button>
          <Button
            onClick={() => {
              if (modalType === 'entregar') registrarEntrega();
              if (modalType === 'receber') registrarRecebimento();
              if (modalType === 'negar') registrarNegacao();
              if (modalType === 'devolver') registrarDevolucao();
            }}
            color="primary"
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openModalProduct}
        onClose={() => setOpenModalProduct(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src="https://i1.sndcdn.com/artworks-XesNnyIwzKt1jGVh-4cyTzw-t500x500.jpg"
              alt="Foto do Vendedor"
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Délcio Paiva
              </Typography>
              <Typography variant="subtitle2">
                Vendedor
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider/>

        <DialogContent>
          {produtoInfo && (
            <Box>
              <Typography variant="h6">Produto: {produtoInfo?.nome}</Typography>
              <Typography variant="body1">Descrição: {produtoInfo.descricao}</Typography>
              <Typography variant="body1">Preço: {produtoInfo.preco}</Typography>

              {produtoInfo.imagens && produtoInfo.imagens.length > 0 && (
                <Box>
                  <Typography variant="body1">Imagens do Produto:</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      mt: 2,
                      justifyContent: 'center'
                    }}
                  >
                    {produtoInfo.imagens.map((imagem, index) => (
                      <img
                        key={index}
                        src={`${mediaUrl}${imagem.imagem}`}
                        alt={`Imagem ${index + 1} do Produto`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '270px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImage(imagem)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <DialogContent>
          {selectedImage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <img
                src={`${mediaUrl}${selectedImage.imagem}`}
                alt="Imagem ampliada do Produto"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "8px",
                  objectFit: "contain",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Exibindo erro se ocorrer algum problema */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Card>
  );
}
