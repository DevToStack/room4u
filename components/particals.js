import { useCallback, useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load particles to reduce initial bundle size
const Particles = dynamic(() => import('react-tsparticles'), { ssr: false });

const HeroParticlesBackground = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    
    const particlesInit = useCallback(async (engine) => {
        const { loadSlim } = await import('tsparticles-slim');
        await loadSlim(engine);
        setIsLoaded(true);
    }, []);

    const options = useMemo(() => ({
        fullScreen: {
          enable: false, // Important: keep it scoped to hero
        },
        background: {
          color: {
            value: 'green',
          },
        },
        particles: {
          number: {
            value: 30,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ['#ffffff'], // varied theme tones
          },
          shape: {
            type: ['circle'], // multiple shapes
          },
          opacity: {
            value: 0.5,
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false,
            },
          },
          size: {
            value: { min: 4, max: 8 },
            random: true,
          },
          move: {
            enable: true,
            speed: 1,
            direction: 'none',
            random: false,
            straight: true,
            outModes: {
              default: 'out',
            },
          },
          links: {
            enable: true,
            distance:300,
            color: '#ffffff',
            opacity: 0.6,
            width: 2,
          },
          wobble: {
            enable: true,
            distance: 5,
            speed: 1,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab',
            },
          },
          modes: {
            grab: {
              distance: 300,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
      }), []);
      

    // Don't render particles on mobile for better performance
    const [isMobile, setIsMobile] = useState(false);
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return <div className="w-full h-full bg-neutral-900" />;
    }

    return (
        <Particles
            init={particlesInit}
            options={options}
            className="w-full h-full"
        />
    );
};

export default HeroParticlesBackground;
