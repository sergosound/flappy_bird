document.addEventListener('DOMContentLoaded', () => {
    createCanvas()
});

function createCanvas() {
    let lastXPipe = 550;
    const imgBackground = new Image();
    imgBackground.src = 'background.png';
    const imgBird = new Image();
    imgBird.src = 'bird.svg';
    const imgPipe = new Image();
    imgPipe.src = 'pipe.svg';
    const imgPipeTop = new Image();
    imgPipeTop.src = 'pipeTop.svg';
    const canvasXSize = 668;
    const canvasYSize = 500;
    const pipes = generatePipeChordsObject(150);
    const pipesChords = { top: [], bottom: [] };
    const birdChords = {};
    const globalTimeout = 10;
    let ctx, imgW, imgH;
    let dx;
    let x, xp;
    let y;
    let gravity;
    let timeInTheAir;
    let gameInterval, clickInterval, upInterval, downInterval;
    let lastYBirdPosition;
    let pause = true;

    init();
    console.log('000', pipes)

    function init() {
        addEvents();
        imgBackground.onload = function() {
            imgW = imgBackground.width;
            imgH = imgBackground.height;
            const canvas = document.getElementById('game');
            canvas.width = canvasXSize;
            canvas.height = canvasYSize;
            ctx = canvas.getContext('2d');
            ctx.font = '48px serif';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'start';
        }
        startOnLoad();
    }

    function start() {
        setVariables();
        gameInterval = setInterval(draw, globalTimeout);
    }

    function startOnLoad() {
        const interval = setInterval(() => {
            setVariables();
            draw();
            bounce();
            clearInterval(interval);
        }, 100);
    }

    function setVariables() {
        dx = 1;
        x = 0;
        xp = 0;
        y = 0;
        lastXPipe = 550;
        gravity = 0.1;
        timeInTheAir = 0;
        lastYBirdPosition = 150;
    }

    function draw() {
        if (ctx) {
            createUI();
        }
    }

    function createBackground() {
        if (Math.abs(Math.abs(x) - canvasXSize) <= dx) {
            dx += 1;
            x = 0;
        }

        ctx.drawImage(imgBackground, x + canvasXSize - 1, y, imgW, imgH);
        ctx.drawImage(imgBackground, x, y, imgW, imgH);
        x -= dx;
        xp -= dx;
    }

    function createBird() {
        const ix = 150;
        const iy = 150 + gravity;
        lastYBirdPosition = iy;

        if (iy <= 0) {
            drawBird(imgBird, ix, 0);
            stop();
        } else if (iy >= canvasYSize - imgBird.height) {
            const stopYPosition = canvasYSize - imgBird.height;
            drawBird(imgBird, ix, stopYPosition);
            stop();
        } else {
            drawBird(imgBird, ix, iy);
        }
    }

    function createPipe() {
        const ix = canvasXSize - 100 + xp;
        if (ix <= 0) {
            // remove Pipe
        }
        pipes.forEach((pair, index) => {
            pair.forEach(pipe => {
                const img = pipe.placement === 'top' ? imgPipeTop : imgPipe;
                setPipeChords(img.width, img.height, pipe.x + xp, pipe.y, index, pipe.placement);
                ctx.drawImage(img, pipe.x + xp, pipe.y, img.width, img.height);
            })
        });
    }

    function createUI() {
        ctx.clearRect(0,0,0,0);
        createBackground();
        createPipe();
        createBird();
        createScore();
        intersectionCheck();

        if (pause) {
            ctx.fillText('Tap SPACE', 100, 100);
        }
    }

    function drawBird(img, x, y) {
        setBirdChords(img, x, y);
        ctx.drawImage(img, x, y, img.width, img.height);
    }

    function bounce() {
        timeInTheAir = 0;
        clearInterval(clickInterval);
        clickInterval = setInterval(() => {
            timeInTheAir += 0.1;
        }, globalTimeout)
        up(down);
    }

    function up(down) {
        clearInterval(upInterval);
        upInterval = setInterval(() => {
            if (timeInTheAir >= 3) {
                clearInterval(upInterval);
                down();
                return;
            }
            gravity -= 5 - timeInTheAir;
        }, globalTimeout);
    }

    function down() {
        clearInterval(downInterval);
        downInterval = setInterval(() => {
            gravity += 0.8 * timeInTheAir
        }, globalTimeout);
    }

    function addEvents() {
        document.addEventListener('keydown', (event) => {
            if (pause) {
                pause = false;
                start();
                return;
            }
            if (event.code === 'Space') {
                bounce();
            }
        });
    }

    function stop() {
        pause = true;
        [gameInterval, clickInterval, upInterval, downInterval].forEach((interval) => clearInterval(interval));
    }

    function intersectionCheck() {
        check(pipesChords.top);
        check(pipesChords.bottom);
    }

    function check(pipes) {
        Object.entries(pipes).forEach(([name, pipe]) => {
            const xIntersection = pipe.x <= birdChords.x + birdChords.w;
            const yIntersection = pipe.y <= birdChords.y + birdChords.h;
            const birdAfterPipe = birdChords.x > pipe.x + pipe.w;
            const birdDownPipe = birdChords.y < pipe.y + pipe.h;

            if (xIntersection && yIntersection && !birdAfterPipe && birdDownPipe) {
                stop();
            }
        });
    }

    function createScore() {
        ctx.fillText(dx, canvasXSize - 65, canvasYSize - 450);
    }

    function setPipeChords(w, h, x, y, index, placement) {
        if (!pipesChords[placement][index]) {
            pipesChords[placement][index] = {}
        }
        const pipe = pipesChords[placement][index];

        pipe.x = x;
        pipe.y = y;
        pipe.w = w;
        pipe.h = h;

        // ctx.fillRect(x, y, w, h);
        // ctx.beginPath();
        // ctx.arc(x, y, 5, 0, Math.PI * 2, true);
        // ctx.moveTo(1102, 75);
        // ctx.stroke();
    }

    function setBirdChords(img, x, y) {
        birdChords.x = x;
        birdChords.y = y;
        birdChords.w = img.width;
        birdChords.h = img.height;

        // ctx.fillRect(x, y, img.width, img.height);
        // ctx.beginPath();
        // ctx.arc(x, y, 5, 0, Math.PI * 2, true);
        // ctx.moveTo(1102, 75);
        // ctx.stroke();
    }

    function generatePairPipeChords() {
        const freeSpace = canvasYSize - (imgBird.height + 150);
        const size = freeSpace / 2;
        const topPipeHeight = getBetweenNumber(100, size);
        const bottomPipeHeight = getBetweenNumber(100, size);

        const top = { x: lastXPipe, y: -topPipeHeight , placement: 'top' };
        const bottom = { x: lastXPipe, y: canvasYSize - bottomPipeHeight, placement: 'bottom' };

        lastXPipe += getBetweenNumber(100, 300) + 150;

        return [top, bottom];
    }

    function generatePipeChordsObject(length) {
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(generatePairPipeChords());
        }
        return result;
    }

    function getBetweenNumber(min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }
}
