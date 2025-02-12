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
import Config from '@/components/Config';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Snackbar, Alert } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

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

  const baseUrl ="http://localhost:8000/";
  const mediaUrl="http://localhost:8000";

  const [openModal, setOpenModal] = React.useState(false);
  const [modalType, setModalType] = React.useState<'entregar' | 'receber' | 'negar' | 'devolver'>('entregar'); 
  // 'entregar', 'receber', 'negar' ou 'devolver'
  
  const [error, setError] = React.useState<string | null>(null);  // Estado para mensagens de erro

  // Função para buscar os lances da API
  const fetchLances = async (postoId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/posto/${postoId}/lances/`);  // Fazendo requisição à API
      setLances(response.data.lances);  // Armazena os lances no estado
      console.log(response.data.lances);
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
      formData.append('imagem', {
        uri: imagem,
        name: 'produto.jpg',
        type: 'image/jpeg',
      } as any);
    }

    try {
      const res = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Resposta da API:', res);
      if (res.status !== 200) {
        const errorResponse = await res.data;
        setError(errorResponse?.error || 'Erro desconhecido');
        return;
      }
      const registro_id=res.data.registro.id;
      gerarFaturaPosto(registro_id);

      setOpenModal(false);  // Fecha o modal após sucesso
      alert('Registro realizado com sucesso!');

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
  const gerarFaturaPosto = async (registroId) => {
    try {
      const apiUrl = `${baseUrl}api/registro-posto/${registroId}/`;
      window.open(apiUrl, '_blank');  // Abre a URL em uma nova aba
  
      // Ou, se você quiser redirecionar para a página diretamente:
      // window.location.href = apiUrl;
      
      // Optional: Alert if necessary
      // Alert.alert("Fatura gerada com sucesso", `Fatura gerada com o ID: ${registroId}`);
    } catch (error) {
      console.error('Erro ao gerar fatura:', error);
      alert( "Não foi possível gerar a fatura.");
    }
  };
  
  
  // Função para registrar entrega
  const registrarEntrega = async () => {
    console.log('Tentando registrar entrega');
    const url = `${baseUrl}api/posto/entregar-produto/`;
    await enviarRegistroProduto(url);
  };

  // Função para registrar recebimento
  const registrarRecebimento = async () => {
    const url = `${baseUrl}api/posto/receber-produto/`;
    await enviarRegistroProduto(url);
  };
  const registrarNegacao = async () => {
    console.log('Tentando registrar entrega');
    const url = `${baseUrl}api/posto/negar-produto/`;
    await enviarRegistroProduto(url);
  };
  const registrarDevolucao = async () => {
    console.log('Tentando registrar entrega');
    const url = `${baseUrl}api/posto/devolver-produto/`;
    await enviarRegistroProduto(url);
  };
  const handleEnviarCodigo = async (lanceId: string) => {
    try {
      const res = await axios.post(`${baseUrl}api/enviar-codigo/`, { lance_id: lanceId, tipo: 'entrega' });
      alert(res.data.message);
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      alert("Erro ao enviar código.");
    }
  };
  
  const handleConfirmarCodigo = async (lanceId: string, codigo: string) => {
    try {
      const res = await axios.post(`${baseUrl}api/confirmar-codigo/${lanceId}/`, { codigo_verificacao: codigo });
      alert(res.data.message);
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
              <TableCell>Produto</TableCell>
              <TableCell>Posto</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Descrição</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLances.map((lance) => (
              <TableRow hover key={lance.id}>
                <TableCell>{lance.id}</TableCell>
                <TableCell><Button onClick={() => handleOpenModal('entregar', lance.id, lance.produto)}>
          {lance.produto.nome}
        </Button></TableCell>
                <TableCell>{lance.posto.nome}</TableCell>
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
      <Button 
        onClick={() => handleOpenModal('entregar', lance.id)} 
        color="primary"
      >
        Entregar Produto
      </Button>
    )}
  </>
)}

{lance.status_pos_pagamento === "recusado" && (
    <Button 
      onClick={() => handleOpenModal('devolver', lance.id)} 
      color="warning"
    >
      Devolver
    </Button>
  )}
</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={noop}
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

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
    {produtoInfo && (
      <Box>
        <Typography variant="h6">Produto: {produtoInfo.nome}</Typography>
        <Typography variant="body1">Descrição: {produtoInfo.descricao}</Typography>
        <Typography variant="body1">Preço: {produtoInfo.preco}</Typography>
        <Divider sx={{ my: 2 }} />

        {/* Exibir imagens do produto usando a URL da mídia */}
        {produtoInfo.imagens && produtoInfo.imagens.length > 0 && (
          <Box sx={{ my: 2 }}>
            <Typography variant="body1">Imagens do Produto:</Typography>
            <img
              src={`${mediaUrl}${produtoInfo.imagens[0].imagem}`}  // Aqui usamos o caminho correto da imagem
              alt="Imagem do Produto"
              style={{ maxWidth: '100%', marginTop: '10px' }}
            />
          </Box>
        )}
      </Box>
    )}

    {/* Exibir campos de condições, observações e imagem apenas para ações de "entregar" ou "receber" */}
    {(modalType === 'entregar' || modalType === 'receber' || modalType==='negar'  || modalType==='devolver') && (
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
