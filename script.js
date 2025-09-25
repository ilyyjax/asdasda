const pickle = document.getElementById('pickle');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const multiplierEl = document.getElementById('multiplier');
const gameArea = document.getElementById('game-area');
const colorPicker = document.getElementById('pickleColor');
const bgMusic = document.getElementById('bgMusic');
const flySound = document.getElementById('flySound');
const milestoneSound = document.getElementById('milestoneSound');

let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
highscoreEl.textContent = highscore;

let holding = false;
let pickleY = 20;
let objects = [];
let multiplier = 1;
let comboCounter = 0;
let trailActive = false;

// Start background music
bgMusic.volume = 0.3;
bgMusic.play();

// Color picker change
colorPicker.addEventListener('input', () => {
  pickle.style.background = colorPicker.value;
});

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    holding = true;
    flySound.loop = true;
    flySound.play();
  }
});

document.addEventListener('keyup', e => {
  if (e.code === 'Space') {
    holding = false;
    flySound.pause();
    score = 0;
    pickleY = 20;
    comboCounter = 0;
    multiplier = 1;
    multiplierEl.textContent = multiplier;
    pickle.style.bottom = pickleY + 'px';
    objects.forEach(obj => obj.remove());
    objects = [];
  }
});

function spawnCloud(y, speedFactor = 1) {
  const cloud = document.createElement('div');
  cloud.className = 'cloud';
  cloud.style.bottom = y + 'px';
  cloud.style.left = Math.random() * 500 + 'px';
  cloud.dataset.speed = speedFactor;
  gameArea.appendChild(cloud);
  objects.push(cloud);
}

function spawnBird(y) {
  const bird = document.createElement('div');
  bird.className = 'bird';
  bird.style.bottom = y + 'px';
  bird.style.left = Math.random() * 500 + 'px';
  gameArea.appendChild(bird);
  objects.push(bird);
}

function spawnParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + Math.random() * 20 - 10 + 'px';
    particle.style.bottom = y + Math.random() * 20 - 10 + 'px';
    gameArea.appendChild(particle);
    setTimeout(() => particle.remove(), 800);
  }
}

function activateTrail() {
  trailActive = true;
  const trailInterval = setInterval(() => {
    if (!trailActive) return clearInterval(trailInterval);
    spawnParticles(275, gameArea.clientHeight/2);
  }, 100);
  setTimeout(() => trailActive = false, 2000);
}

function gameLoop() {
  if (holding) {
    // Pickle squash/stretch
    pickle.style.transform = `scaleY(1.2) scaleX(0.8)`;

    pickleY += 3;
    comboCounter++;
    if (comboCounter % 20 === 0) multiplier++;
    multiplierEl.textContent = multiplier;

    score += multiplier;
    scoreEl.textContent = score;

    const gameHeight = gameArea.clientHeight;
    const pickleScreenPos = gameHeight / 2 - 40;
    pickle.style.bottom = pickleScreenPos + 'px';

    objects.forEach(obj => {
      let speed = obj.dataset.speed ? parseFloat(obj.dataset.speed) : 1;
      obj.style.bottom = parseFloat(obj.style.bottom) - 3 * speed + 'px';
      if (obj.className === 'bird') obj.style.left = parseFloat(obj.style.left) + Math.sin(Date.now()/200) * 0.5 + 'px';
    });

    objects = objects.filter(obj => {
      if (parseFloat(obj.style.bottom) + obj.offsetHeight < 0) {
        obj.remove();
        return false;
      }
      return true;
    });

    if (Math.random() < 0.03) spawnCloud(gameHeight + Math.random() * 200, Math.random() * 0.5 + 0.5);
    if (Math.random() < 0.015) spawnBird(gameHeight + Math.random() * 200);

    if (score % 500 < multiplier && !trailActive) {
      activateTrail();
      spawnParticles(275, pickleScreenPos + 40);
      milestoneSound.play();
    }

    if (score > highscore) {
      highscore = score;
      localStorage.setItem('highscore', highscore);
      highscoreEl.textContent = highscore;
    }

  } else {
    pickle.style.transform = `scaleY(1) scaleX(1)`;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
