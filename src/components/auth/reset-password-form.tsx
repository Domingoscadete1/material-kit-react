'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Config from '../../../config'; // Ajuste o caminho conforme necessário

const schema = zod.object({ 
  email: zod.string().min(1, { message: 'Email is required' }).email() 
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string>('');
  const router = useRouter();
  const baseUrl = Config.getApiUrl();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setSuccessMessage('');
      
      try {
        const response = await axios.post(
          `${baseUrl}api/password-reset/`,
          { email: values.email },
          { 
            headers: { 
              'Content-Type': 'application/json',
              "ngrok-skip-browser-warning": "true" 
            } 
          }
        );

        if (response.status === 200) {
          setSuccessMessage('Password reset link sent to your email!');
          // Opcional: redirecionar após alguns segundos
          // setTimeout(() => router.push('/login'), 3000);
        } else {
          setError('root', { 
            type: 'server', 
            message: response.data.error || 'Failed to send reset link' 
          });
        }
      } catch (error: any) {
        console.error('Reset password error:', error);
        setError('root', { 
          type: 'server', 
          message: error.response?.data?.error || 'An error occurred. Please try again.' 
        });
      } finally {
        setIsPending(false);
      }
    },
    [baseUrl, setError, router]
  );

  return (
    <Stack spacing={4}>
      <Typography variant="h5">Reset password</Typography>
      <Typography variant="body1" color="text.secondary">
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} fullWidth>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          
          {errors.root ? (
            <Alert severity="error">{errors.root.message}</Alert>
          ) : null}
          
          {successMessage ? (
            <Alert severity="success">{successMessage}</Alert>
          ) : null}
          
          <Button 
            disabled={isPending} 
            type="submit" 
            variant="contained" 
            size="large"
            fullWidth
          >
            {isPending ? 'Sending...' : 'Send recovery link'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}