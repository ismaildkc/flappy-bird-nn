# Flappy Bird with Neural Network

This repository contains a Flappy Bird game implementation that uses a neural network for intelligent gameplay. The project leverages the power of artificial intelligence to train a neural network to play the game autonomously.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

## Introduction
Flappy Bird is a popular side-scrolling game where the player controls a bird, attempting to fly between columns of green pipes without hitting them. In this project, a neural network is trained to play Flappy Bird by itself. The neural network learns through a process of trial and error, gradually improving its performance.

## Features
- **Neural Network Training**: Uses a simple neural network to learn and play the game.
- **Visualization**: See the neural network in action as it learns to navigate the pipes.
- **User Interface**: Basic UI to start and stop the game, and visualize the training process.

## Installation
To get started with this project, simply clone the repository:

```bash
git clone https://github.com/ismaildkc/flappy-bird-nn.git
cd flappy-bird-nn
```

## Usage
To run the Flappy Bird game with the neural network, open the `index.html` file in your web browser.

## How It Works
The neural network is trained using a genetic algorithm. Here's a high-level overview of the process:

1. **Initialization**: A population of neural networks is created with random weights.
2. **Evaluation**: Each neural network in the population is evaluated by letting it play the game.
3. **Selection**: The best-performing networks are selected to create the next generation.
4. **Crossover and Mutation**: The selected networks are combined and slightly mutated to create new networks.
5. **Iteration**: Steps 2-4 are repeated for a number of generations until the neural network learns to play the game effectively.

## Contributing
Contributions are welcome! If you have ideas to improve the project or find bugs, feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/my-new-feature`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/my-new-feature`).
5. Create a new Pull Request.

## Credits
- This project is based on the neural network tutorial by (https://www.youtube.com/watch?v=c6y21FkaUqw).

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Enjoy the project and have fun watching the neural network learn to play Flappy Bird! If you have any questions or need further assistance, feel free to contact me.