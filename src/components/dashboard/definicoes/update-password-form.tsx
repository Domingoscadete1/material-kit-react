'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { fetchWithToken } from '../../../../authService';

export function UpdatePasswordForm() {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ text: 'As senhas não coincidem', type: 'error' });
      setLoading(false);
      return;
    }

    if (formData.new_password.length < 6) {
      setMessage({ text: 'A senha deve ter pelo menos 6 caracteres', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('userData')).user_id.id;
      console.log(localStorage.getItem('userData'));

      const response = await fetchWithToken(`api/user-password-set/${userId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          confirm_password: formData.new_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao atualizar senha');
      }

      setMessage({ text: 'Senha atualizada com sucesso', type: 'success' });
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Atualizar senha" title="Senha" />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>Senha atual</InputLabel>
              <OutlinedInput
                label="Senha atual"
                name="current_password"
                type="password"
                value={formData.current_password}
                onChange={handleChange}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Nova senha</InputLabel>
              <OutlinedInput
                label="Nova senha"
                name="new_password"
                type="password"
                value={formData.new_password}
                onChange={handleChange}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Confirmar nova senha</InputLabel>
              <OutlinedInput
                label="Confirmar nova senha"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </FormControl>
            {message.text && (
              <div style={{ color: message.type === 'error' ? 'red' : 'green' }}>
                {message.text}
              </div>
            )}
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}