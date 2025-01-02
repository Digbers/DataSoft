import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { useTheme } from '../context/ThemeContext';
const ParticlesComponent = () => {
  const particlesInit = useCallback(async (engine) => {
    // Load the full tsparticles package
    await loadFull(engine);
  }, []);
  const { theme } = useTheme();
  let themeColor = theme === 'light' ? '#000000' : '#ffffff';

  const particlesOptions = {
    background: {
      color: "transparent",
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: [themeColor], // Rojo, verde y azul
      },
      links: {
        color: themeColor,
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  return <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />;
};

export default ParticlesComponent;
