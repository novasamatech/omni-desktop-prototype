import React, { ChangeEvent, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import omni from '../../../assets/omni.svg';
import Button from '../ui/Button';
import InputText from '../ui/Input';
import ErrorMessage from '../ui/ErrorMessage';
import { useMatrix } from './Providers/MatrixProvider';
import { Routes } from '../../common/constants';

type LoginForm = {
  matrixId: string;
  password: string;
};

const Login: React.FC = () => {
  const history = useHistory();
  const { matrix, setIsLoggedIn } = useMatrix();

  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const [isLoginFailed, setIsLoginFailed] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginForm>({
    mode: 'onChange',
    defaultValues: {
      matrixId: '',
      password: '',
    },
  });

  const handleLogin: SubmitHandler<LoginForm> = async ({
    matrixId,
    password,
  }) => {
    setIsLoginInProgress(true);

    try {
      await matrix.loginWithCreds(matrixId, password);
      setIsLoggedIn(true);
      history.push(Routes.WALLETS);
    } catch (error) {
      setIsLoginFailed(true);
    }

    setIsLoginInProgress(false);
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void,
  ) => {
    if (isLoginFailed) {
      setIsLoginFailed(false);
    }
    onChange(event.target.value.trim());
  };

  const handleSkip = () => {
    history.push(Routes.WALLETS);
  };

  return (
    <div className="h-screen flex flex-col items-center mx-auto">
      <header className="flex flex-col items-center pt-14">
        <img className="w-16 h-16" src={omni} alt="Omni logo" />
        <h1 className="mt-5 mb-3 font-bold text-3xl">
          Welcome to Omni Enterprise!
        </h1>
        <div className="text-xl">Let&apos;s start by login to Matrix</div>
      </header>
      <form
        className="flex flex-col mt-14 mb-3 gap-4 w-[300px]"
        onSubmit={handleSubmit(handleLogin)}
      >
        <Controller
          name="matrixId"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <InputText
              className="w-full"
              label="Matrix ID"
              disabled={isLoginInProgress}
              invalid={isLoginFailed}
              value={value}
              onChange={(e) => handleInputChange(e, onChange)}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{ required: true }}
          render={({ field: { value, onChange } }) => (
            <InputText
              className="w-full"
              label="Password"
              type="password"
              disabled={isLoginInProgress}
              invalid={isLoginFailed}
              value={value}
              onChange={(e) => handleInputChange(e, onChange)}
            />
          )}
        />
        <ErrorMessage visible={isLoginFailed} italic={false}>
          Wrong Matrix ID or Password, please try again
        </ErrorMessage>
        <Button
          size="lg"
          type="submit"
          disabled={!isValid}
          isLoading={isLoginInProgress}
        >
          Login
        </Button>
      </form>
      <footer className="mt-auto pb-10 w-max">
        <Button className="w-[300px] mx-auto" size="lg" onClick={handleSkip}>
          Skip login
        </Button>
        <div className="text-xs mt-4 text-gray-400">
          By skipping this step, some multisig features will not be available
        </div>
      </footer>
    </div>
  );
};

export default Login;
