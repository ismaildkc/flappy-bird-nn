import { useRef, useEffect } from "react";
import { NeuralNetwork } from './lib/nn';

function App() {
  const TOTAL_BIRDS = 500;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const PIPE_WIDTH = 80;
  const MIN_PIPE_HEIGHT = 40;
  const SPACE_BETWEEN_PIPES = 360;
  const SPACE = 180;
  const FPS = 960;

  const canvasRef = useRef(null);
  const pipes = useRef([]);
  const birds = useRef([]);
  const deadBirds = useRef([]);
  let frameCount = 0;
  let loop;

  class Bird {
    constructor(ctx, brain) {
      this.ctx = ctx;
      this.x = 150;
      this.y = 150;
      this.width = PIPE_WIDTH;
      this.gravity = 0;
      this.velocity = 0.1;
      this.age = 0;
      this.fitness = 0;
      this.isDead = false;
      if (brain) {
        this.brain = brain.copy();
        this.mutate();
      } else {
        this.brain = new NeuralNetwork(5, 20, 2);
      }
    }

    draw() {
      this.ctx.fillStyle = "red";
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, 10, 0, Math.PI * 2, true);
      this.ctx.fill();
    }

    update(pipeX, spaceStartY, spaceEndY) {
      this.age += 1;
      this.gravity += this.velocity;
      this.gravity = Math.min(4, this.gravity);
      this.y += this.gravity;

      if (this.y < 0) {
        this.y = 0;
      } else if (this.y > CANVAS_HEIGHT) {
        this.y = CANVAS_HEIGHT;
      }

      this.think(pipeX, spaceStartY, spaceEndY);
    }

    think(pipeX, spaceStartY, spaceEndY) {
      const inputs = [
        Math.abs((this.x - pipeX) / CANVAS_WIDTH),
        (spaceStartY / CANVAS_HEIGHT),
        (spaceEndY / CANVAS_HEIGHT),
        (this.y / CANVAS_HEIGHT),
        (this.gravity / 10),
      ];

      // range 0, 1
      const output = this.brain.predict(inputs);
      if (output[0] < output[1]) {
        this.jump();
      }
    }

    mutate() {
      this.brain.mutate((x) => {
        if (Math.random() < 0.1) {
          const offset = (Math.random() - 0.5) * 0.1;
          return x + offset;
        }
        return x;
      });
    }

    jump() {
      this.gravity = -3;
    }
  }

  class Pipe {
    constructor(ctx, height, space) {
      this.ctx = ctx;
      this.isDead = false;
      this.x = CANVAS_WIDTH;
      this.y = height ? CANVAS_HEIGHT - height : 0;
      this.width = PIPE_WIDTH;
      this.height = height || MIN_PIPE_HEIGHT + Math.random() * (CANVAS_HEIGHT - space - MIN_PIPE_HEIGHT * 2);
    }

    draw() {
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
      this.x -= 1;
      if (this.x + PIPE_WIDTH < 0) {
        this.isDead = true;
      }
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        birds.current[0].jump();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    startGame();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(loop);
    };
  }, []);

  const startGame = () => {
    frameCount = 0;
    const ctx = getCtx();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    pipes.current = generatePipes(ctx);
    birds.current = generateBirds(ctx);
    deadBirds.current = [];
    clearInterval(loop);
    loop = setInterval(gameLoop, 1000 / FPS);
  };

  const getCtx = () => canvasRef.current.getContext("2d");

  const generatePipes = (ctx) => {
    const firstPipe = new Pipe(ctx, null, SPACE);
    const secondPipeHeight = CANVAS_HEIGHT - firstPipe.height - SPACE;
    const secondPipe = new Pipe(ctx, secondPipeHeight, SPACE);
    return [firstPipe, secondPipe];
  };

  const generateBirds = (ctx) => {
    const birds = [];
    const elites = selectElites(5);
    for (let i = 0; i < TOTAL_BIRDS; i += 1) {
      // const brain = deadBirds.current.length ? pickOne().brain : null;
      const brain = (elites.length > 0 && i < elites.length) ? elites[i].brain : pickOne().brain;
      const newBird = new Bird(ctx, brain);
      birds.push(newBird);
    }
    return birds;
  };

  const selectElites = (count) => {
    if (deadBirds.current.length === 0) return [];
    deadBirds.current.sort((a, b) => b.fitness - a.fitness);
    return deadBirds.current.slice(0, count);
  };

  const gameLoop = () => {
    update();
    draw();
  };

  const update = () => {
    frameCount++;
    const ctx = getCtx();
    if (frameCount % SPACE_BETWEEN_PIPES === 0) {
      const newPipes = generatePipes(ctx);
      pipes.current.push(...newPipes);
    }
    
    // update pipes positions
    pipes.current.forEach((pipe) => pipe.update());
    
    // delete off-screen pipes
    pipes.current = pipes.current.filter(pipe => !pipe.isDead);

    // update pipes positions
    birds.current.forEach((bird) => {
      const nextPipe = getClosestPipe(bird);
      const spaceStartY = nextPipe?.y + nextPipe?.height;
      bird.update(nextPipe.x, spaceStartY, spaceStartY + SPACE);
    });

    // delete dead birds
    birdIsDead();
    deadBirds.current.push(...birds.current.filter(bird => bird.isDead));
    birds.current = birds.current.filter(bird => !bird.isDead);

    if (birds.current.length === 0) {
      let totalAge = 0;
      // calculate cumulative age
      deadBirds.current.forEach(bird => totalAge += bird.age);

       // calculate fitness ratio
      deadBirds.current.forEach(bird => bird.fitness = bird.age / totalAge);
      startGame();
    }
  };

  const pickOne = () => {
    if (deadBirds.current.length === 0) {
      // İlk nesil için rastgele bir beyin oluşturun
      return new Bird(getCtx(), null);
    }
    let index = 0;
    let r = Math.random();
    while (r > 0 && index < deadBirds.current.length) {
      r -= deadBirds.current[index].fitness;
      index += 1;
    }
    index -= 1;
    return deadBirds.current[index];
  };

  const getClosestPipe = (bird) => {
    for (let i = 0; i < pipes.current.length; i++) {
      if (pipes.current[i].x > bird.x) {
        return pipes.current[i];
      }
    }
    return null;
  };

  // detect collisions
  const birdIsDead = () => {
    birds.current.forEach((bird) => {
      pipes.current.forEach((pipe) => {
        if (
          bird.y <= 0 || bird.y >= CANVAS_HEIGHT || (
            bird.x >= pipe.x &&
            bird.x <= pipe.x + pipe.width &&
            bird.y >= pipe.y &&
            bird.y <= pipe.y + pipe.height
          )
        ) {
          bird.isDead = true;
        }
      });
    });
  };

  const draw = () => {
    const ctx = getCtx();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    pipes.current.forEach((pipe) => pipe.draw());
    birds.current.forEach((bird) => bird.draw());
  };

  return (
    <div id="app">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      ></canvas>
    </div>
  );
}

export default App;
