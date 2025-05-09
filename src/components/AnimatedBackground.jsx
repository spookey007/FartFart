import React, { useEffect, useRef } from 'react';

const AnimatedBackground = ({ isActive }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let confetti = [];
    let poppers = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 100;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`; // Gold to orange colors
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class Confetti {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.gravity = 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
      }
    }

    class PartyPopper {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        this.size = 20;
        this.speedY = -2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 2 - 1;
        this.lastConfettiTime = 0;
        this.confettiInterval = 200;
      }

      update(currentTime) {
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (currentTime - this.lastConfettiTime > this.confettiInterval) {
          for (let i = 0; i < 5; i++) {
            confetti.push(new Confetti(this.x, this.y));
          }
          this.lastConfettiTime = currentTime;
        }

        if (this.y < -this.size) {
          this.y = canvas.height;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        // Draw party popper
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size/2, 0);
        ctx.lineTo(-this.size/2, 0);
        ctx.closePath();
        ctx.fill();

        // Draw streamers
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            (Math.random() - 0.5) * 50,
            this.size,
            (Math.random() - 0.5) * 100,
            this.size * 2
          );
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      confetti = [];
      poppers = [];
      
      // Restored original particle count
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
      
      // Added more poppers for more festive effect
      for (let i = 0; i < 5; i++) {
        poppers.push(new PartyPopper());
      }
    };

    const animate = (currentTime) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#FFD700');
      gradient.addColorStop(0.5, '#FFA500');
      gradient.addColorStop(1, '#FFD700');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Update and draw confetti
      confetti = confetti.filter(c => c.y < canvas.height);
      confetti.forEach(c => {
        c.update();
        c.draw();
      });

      // Update and draw party poppers
      poppers.forEach(popper => {
        popper.update(currentTime);
        popper.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    init();
    animationFrameId = requestAnimationFrame(animate);

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default AnimatedBackground; 