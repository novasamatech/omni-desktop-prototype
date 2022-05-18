import React from 'react';
import omni from '../../../assets/omni.svg';
import spinner from '../../../assets/spinner.svg';

const SplashScreen: React.FC = () => {
  return (
    <main className="h-screen w-[500px] flex flex-col justify-center items-center mx-auto">
      <header className="flex flex-col items-center">
        <img className="w-16 h-16" src={omni} alt="Omni logo" />
        <h1 className="mt-5 mb-3 font-bold text-3xl">
          Welcome to Omni Enterprise!
        </h1>
      </header>

      <img
        className="animate-spin w-8 h-8 mt-14 brightness-0"
        src={spinner}
        alt=""
      />
    </main>
  );
};

export default SplashScreen;
