'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { jwtDecode } from 'jwt-decode';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import Config from '../../../Config';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';


const schema = zod.object({
  username: zod.string().min(1, { message: 'Username is required' }), 
  password: zod.string().min(1, { message: 'Password is required' }),
});
interface UserData {
  nome: string;
  email: string;
  numero_telefone: string;
  endereco: string;
  status: string;
}

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '', password: '' };

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const baseUrl = Config.getApiUrl();
  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [openResetDialog, setOpenResetDialog] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState('');
  const [resetError, setResetError] = React.useState('');


  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await localStorage.getItem('userData');

        
      } catch (error) {
        console.error('Erro ao recuperar dados:', error);

      }
    };

    fetchUserData();
  }, []);
  const handleOpenResetDialog = () => {
    setOpenResetDialog(true);
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetEmail('');
    setResetMessage('');
    setResetError('');
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetError('Por favor, insira seu e-mail');
      return;
    }

    try {
      setResetLoading(true);
      setResetError('');
      setResetMessage('');

      const response = await axios.post(
        `${baseUrl}api/password-reset/`,
        { email: resetEmail },
        { headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" } }
      );

      if (response.status === 200) {
        setResetMessage('E-mail de redefinição enviado. Verifique sua caixa de entrada.');
      }
    } catch (error) {
      console.error("Erro ao solicitar redefinição:", error);
      setResetError(error.response?.data?.error || 'Erro ao solicitar redefinição de senha');
    } finally {
      setResetLoading(false);
    }
  };


  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
  
      try {
        const response = await axios.post(
          `${baseUrl}api/token/`,
          {
            username: values.username, // Enviando 'username' corretamente
            password: values.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
  
        console.log('Response Status:', response.status);
  
        if (response.status !== 200) {
          console.error('Erro da API:', response.data);
          setError('root', { type: 'server', message: response.data.detail || 'Erro no login.' });
          return;
        }
  
        const data = response.data;
        console.log('Resposta da API login:', data);
  
        const decodedToken = jwtDecode(data.access);
        console.log('Token decodificado:', decodedToken);
  
        if (decodedToken.is_funcionario_posto) {
          await fetchUserData(data.access);
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          localStorage.setItem('custom-auth-token', data.access);
          await checkSession?.();
          
        } else {
          setError('root', { type: 'server', message: 'Usuário não autorizado.' });
        }
      } catch (error: any) {
        console.error('Erro de conexão:', error.message);
        setError('root', { type: 'server', message: 'Erro de conexão com o servidor.' });
      } finally {
        setIsPending(false);
      }
    },
    [checkSession, router, setError]
  );
  
  const fetchUserData = async (token: string) => {
    console.log("Iniciando requisição para buscar dados do usuário...");
  
    try {
      const response = await axios.get(`${baseUrl}api/user/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
  
      // Verifique se a resposta da API é válida e contém os dados esperados
      if (response.status === 200 && response.data) {
        console.log("Resposta da requisição:", response);
        const data = response.data;
        console.log('Dados do usuário:', data);
  
        // Armazena os dados do usuário no estado
        setUserData(data);
  
        // Armazena os dados no localStorage
        await localStorage.setItem('userData', JSON.stringify(data));
      } else {
        console.error('Resposta da API inesperada:', response);
      }
  
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Erro na requisição axios:', error.response?.data || error.message);
      } else {
        console.error('Erro desconhecido:', error);
      }
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
        <Controller
            control={control}
            name="username" // Alterado para 'username'
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>Username</InputLabel> {/* Alterado para 'Username' */}
                <OutlinedInput {...field} label="Username" type="text" />
                {errors.username && <FormHelperText>{errors.username.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => setShowPassword(true)}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password && <FormHelperText>{errors.password.message}</FormHelperText>}
              </FormControl>
            )}
          />
          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>
          {errors.root && <Alert color="error">{errors.root.message}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </form>

       {/* Password Reset Dialog */}
       <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter your email address to receive a password reset link
          </Typography>
          
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {resetError}
            </Alert>
          )}
          
          {resetMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {resetMessage}
            </Alert>
          )}
          
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={resetLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} disabled={resetLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            color="primary" 
            disabled={resetLoading}
          >
            {resetLoading ? 'Sending...' : 'Send Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
