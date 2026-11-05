"use strict";

const snakeBoard = document.getElementById("snakeBoard");
if (snakeBoard) {
    const size = 20;
    const snakeCard = snakeBoard.closest(".play-card");
    let snake;
    let direction;
    let nextDirection;
    let food;
    let score;
    let running;
    let gameOver;
    const scoreNode = document.getElementById("snakeScore");
    const message = document.getElementById("snakeMessage");

    function placeFood() {
        let candidate;
        do {
            candidate = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
        } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));
        food = candidate;
    }

    function drawSnake() {
        snakeBoard.replaceChildren();
        snake.forEach((segment, index) => {
            const node = document.createElement("span");
            node.className = "snake-segment";
            node.style.left = `${segment.x * 5}%`;
            node.style.top = `${segment.y * 5}%`;
            if (index === 0) node.setAttribute("aria-label", "Snake head");
            snakeBoard.append(node);
        });
        const fruit = document.createElement("span");
        fruit.className = "snake-food";
        fruit.style.left = `${food.x * 5}%`;
        fruit.style.top = `${food.y * 5}%`;
        snakeBoard.append(fruit);
        scoreNode.textContent = String(score);
    }

    function resetSnake() {
        snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
        direction = { x: 1, y: 0 };
        nextDirection = direction;
        score = 0;
        running = false;
        gameOver = false;
        placeFood();
        message.textContent = "Focus the board and press an arrow key or WASD to start. Touch controls work too.";
        drawSnake();
    }

    function setDirection(name) {
        const directions = {
            up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
            left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
        };
        const requested = directions[name];
        if (!requested || gameOver || (requested.x === -nextDirection.x && requested.y === -nextDirection.y)) return;
        if (running && nextDirection !== direction) return;
        nextDirection = requested;
        running = true;
    }

    function stepSnake() {
        if (!running) return;
        direction = nextDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        const ate = head.x === food.x && head.y === food.y;
        const body = ate ? snake : snake.slice(0, -1);
        if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size ||
            body.some((segment) => segment.x === head.x && segment.y === head.y)) {
            running = false;
            gameOver = true;
            message.textContent = `Game over — you scored ${score}. Start a new game to try again.`;
            return;
        }
        snake.unshift(head);
        if (ate) {
            score += 10;
            if (snake.length === size * size) {
                running = false;
                gameOver = true;
                message.textContent = "Incredible — you filled the whole board!";
            } else {
                placeFood();
            }
        } else {
            snake.pop();
        }
        drawSnake();
    }

    snakeBoard.tabIndex = 0;
    snakeBoard.addEventListener("pointerdown", () => snakeBoard.focus());
    document.addEventListener("keydown", (event) => {
        const activeElement = document.activeElement;
        if (!snakeCard.contains(activeElement)) return;
        const keys = { ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" };
        const name = keys[event.key] || keys[event.key.toLowerCase()];
        if (name) {
            event.preventDefault();
            setDirection(name);
        }
    });
    document.querySelectorAll("[data-direction]").forEach((button) => {
        button.addEventListener("click", () => setDirection(button.dataset.direction));
    });
    document.getElementById("snakeReset").addEventListener("click", resetSnake);
    resetSnake();
    window.setInterval(stepSnake, 135);
}

const tileBoard = document.getElementById("tileBoard");
if (tileBoard) {
    let tiles;
    let score = 0;
    let finished = false;
    const scoreNode = document.getElementById("tileScore");
    const message = document.getElementById("tileMessage");

    function addTile() {
        const empty = tiles.map((value, index) => value === 0 ? index : -1).filter((index) => index >= 0);
        if (empty.length) tiles[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
    }

    function drawTiles() {
        tileBoard.replaceChildren();
        tiles.forEach((value, index) => {
            const cell = document.createElement("div");
            cell.className = "tile-cell";
            cell.setAttribute("role", "gridcell");
            cell.dataset.value = String(value || "");
            cell.textContent = value ? String(value) : "";
            cell.setAttribute("aria-label", value ? `Tile ${value}` : `Empty cell ${index + 1}`);
            tileBoard.append(cell);
        });
        scoreNode.textContent = String(score);
    }

    function resetTiles() {
        tiles = Array(16).fill(0);
        score = 0;
        finished = false;
        message.textContent = "Use arrow keys or swipe to slide the tiles.";
        addTile();
        addTile();
        drawTiles();
    }

    function hasMoves() {
        return tiles.some((value) => !value) || tiles.some((value, index) =>
            (index % 4 < 3 && value === tiles[index + 1]) || (index < 12 && value === tiles[index + 4]));
    }

    function moveTiles(name) {
        if (finished) return;
        const before = tiles.slice();
        for (let line = 0; line < 4; line++) {
            const indexes = Array.from({ length: 4 }, (_, offset) => {
                if (name === "left") return line * 4 + offset;
                if (name === "right") return line * 4 + (3 - offset);
                if (name === "up") return offset * 4 + line;
                return (3 - offset) * 4 + line;
            });
            const values = indexes.map((index) => tiles[index]).filter(Boolean);
            for (let i = 0; i < values.length - 1; i++) {
                if (values[i] === values[i + 1]) {
                    values[i] *= 2;
                    score += values[i];
                    values.splice(i + 1, 1);
                }
            }
            while (values.length < 4) values.push(0);
            indexes.forEach((index, offset) => { tiles[index] = values[offset]; });
        }
        if (tiles.every((value, index) => value === before[index])) return;
        addTile();
        drawTiles();
        if (tiles.includes(2048)) {
            message.textContent = "You made 2048! Keep going or start a fresh board.";
        } else if (!hasMoves()) {
            finished = true;
            message.textContent = `No moves left — final score ${score}. Start a new game to play again.`;
        }
    }

    tileBoard.tabIndex = 0;
    tileBoard.addEventListener("keydown", (event) => {
        const keys = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
        if (keys[event.key]) {
            event.preventDefault();
            moveTiles(keys[event.key]);
        }
    });
    let touchStart;
    tileBoard.addEventListener("pointerdown", (event) => { touchStart = { x: event.clientX, y: event.clientY }; });
    tileBoard.addEventListener("pointerup", (event) => {
        if (!touchStart) return;
        const dx = event.clientX - touchStart.x;
        const dy = event.clientY - touchStart.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) moveTiles(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
        touchStart = null;
    });
    document.getElementById("tileReset").addEventListener("click", resetTiles);
    resetTiles();
}

const memoryBoard = document.getElementById("memoryBoard");
if (memoryBoard) {
    const symbols = ["✦", "◈", "✿", "☾", "❋", "♧"];
    let firstCard = null;
    let locked = false;
    let turns = 0;
    let matched = 0;
    const message = document.getElementById("memoryMessage");
    const turnNode = document.getElementById("memoryTurns");

    function resetMemory() {
        firstCard = null;
        locked = false;
        turns = 0;
        matched = 0;
        turnNode.textContent = "0";
        message.textContent = "Choose a card to reveal its symbol.";
        const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        memoryBoard.replaceChildren(...cards.map((symbol) => {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "memory-card is-hidden";
            card.textContent = "?";
            card.dataset.symbol = symbol;
            card.setAttribute("aria-label", "Hidden card");
            card.addEventListener("click", () => flipCard(card));
            return card;
        }));
    }

    function flipCard(card) {
        if (locked || !card.classList.contains("is-hidden")) return;
        card.classList.remove("is-hidden");
        card.textContent = card.dataset.symbol;
        card.setAttribute("aria-label", `Card ${card.dataset.symbol}`);
        if (!firstCard) {
            firstCard = card;
            return;
        }
        turns++;
        turnNode.textContent = String(turns);
        if (firstCard.dataset.symbol === card.dataset.symbol) {
            firstCard.classList.add("is-matched");
            card.classList.add("is-matched");
            firstCard.disabled = true;
            card.disabled = true;
            firstCard = null;
            matched++;
            if (matched === symbols.length) message.textContent = `Garden complete in ${turns} turns. Lovely work!`;
        } else {
            locked = true;
            const previous = firstCard;
            firstCard = null;
            window.setTimeout(() => {
                for (const hidden of [previous, card]) {
                    hidden.classList.add("is-hidden");
                    hidden.textContent = "?";
                    hidden.setAttribute("aria-label", "Hidden card");
                }
                locked = false;
            }, 750);
        }
    }

    document.getElementById("memoryReset").addEventListener("click", resetMemory);
    resetMemory();
}
