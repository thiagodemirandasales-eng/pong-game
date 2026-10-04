const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const paddleWidth = 14;
const paddleHeight = 110;
const ballSize = 12;
const paddleSpeed = 8;
const computerSpeed = 5.2;

const leftPaddle = {
  x: 20,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0,
};

const rightPaddle = {
  x: canvas.width - 20 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0,
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: ballSize,
  vx: 5,
  vy: 3,
};

let playerScore = 0;
let computerScore = 0;

const keys = {
  ArrowUp: false,
  ArrowDown: false,
};

let mouseY = canvas.height / 2;

function resetBall(direction) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
  const speed = 5.5;
  ball.vx = direction * speed * Math.cos(angle);
  ball.vy = speed * Math.sin(angle);
}

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function handlePlayerInput() {
  const userMove = (keys.ArrowUp ? -1 : 0) + (keys.ArrowDown ? 1 : 0);
  leftPaddle.dy = userMove * paddleSpeed;

  const mouseTarget = mouseY - leftPaddle.height / 2;
  leftPaddle.y += (mouseTarget - leftPaddle.y) * 0.18;

  if (userMove !== 0) {
    leftPaddle.y += leftPaddle.dy;
  }
}

function updateComputer() {
  const targetY = ball.y - rightPaddle.height / 2;
  const diff = targetY - rightPaddle.y;
  const move = Math.abs(diff) < computerSpeed ? diff : Math.sign(diff) * computerSpeed;
  rightPaddle.y += move;
}

function clampPaddle(paddle) {
  if (paddle.y < 0) {
    paddle.y = 0;
  }

  if (paddle.y + paddle.height > canvas.height) {
    paddle.y = canvas.height - paddle.height;
  }
}

function collidesWithPaddle(paddle, ballObj) {
  return (
    ballObj.x - ballObj.size / 2 < paddle.x + paddle.width &&
    ballObj.x + ballObj.size / 2 > paddle.x &&
    ballObj.y - ballObj.size / 2 < paddle.y + paddle.height &&
    ballObj.y + ballObj.size / 2 > paddle.y
  );
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.size / 2 <= 0 || ball.y + ball.size / 2 >= canvas.height) {
    ball.vy *= -1;
    ball.y = Math.max(ball.size / 2, Math.min(canvas.height - ball.size / 2, ball.y));
  }

  if (collidesWithPaddle(leftPaddle, ball)) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.size / 2;
    const relativeIntersectY = (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    const bounceAngle = relativeIntersectY * (Math.PI / 3);
    const speed = Math.hypot(ball.vx, ball.vy) + 0.2;
    ball.vx = speed * Math.cos(bounceAngle);
    ball.vy = speed * Math.sin(bounceAngle);
  }

  if (collidesWithPaddle(rightPaddle, ball)) {
    ball.x = rightPaddle.x - ball.size / 2;
    const relativeIntersectY = (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    const bounceAngle = relativeIntersectY * (Math.PI / 3);
    const speed = Math.hypot(ball.vx, ball.vy) + 0.2;
    ball.vx = -speed * Math.cos(bounceAngle);
    ball.vy = speed * Math.sin(bounceAngle);
  }

  if (ball.x - ball.size / 2 <= 0) {
    computerScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.size / 2 >= canvas.width) {
    playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function gameLoop() {
  handlePlayerInput();
  updateComputer();
  clampPaddle(leftPaddle);
  clampPaddle(rightPaddle);
  updateBall();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();

  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  mouseY = relativeY;
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);
