document.addEventListener('DOMContentLoaded', () => {
    createCanvas();
});

const persons = ['Anton', 'Oleg', 'Sergey', 'Nazar', 'Andrey', 'Alina', 'Evegeniy', 'Vokzal', 'Romantu4na_Zdobu4', 'Angel_Predohranitel\''];

function createCanvas() {
    const $table = document.querySelector('.table');
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
    let completeWidth = 0;
    let ctx, imgW, imgH;
    let dx;
    let x, xp;
    let y;
    let gravity;
    let timeInTheAir;
    let gameInterval, clickInterval, upInterval, downInterval;
    let lastYBirdPosition;
    let pause = true;
    const evolutionStatus = (() => {
        const onceEvo = (() => {
            const result = {};
            for (let i = 0; i < 10; i++) {
                result[i] = {
                    name: persons[i],
                    result: 0,
                }
            }
            return result;
        })();
        const result = [];
        for (let i = 0; i < 10; i++) {
            result.push(onceEvo);
        }
        return result;
    })();
    let evoIndex = 0;
    let personIndex = 0;
    let firstStart = true;
    let isII = true;
    let completedWidth = 0;

    init();

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
        pause = false;
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
        completeWidth = 0;
    }

    function draw() {
        if (isII) {
            if (evoIndex >= 10) {
                return;
            }
        }
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

        completedWidth++;
        evolutionStatus[evoIndex][personIndex].result = completedWidth;
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
        renderTableScore(evolutionStatus, evoIndex);

        if (pause) {
            ctx.fillText('Tap SPACE', 100, 100);
            // if (isII) {
            //     if (firstStart) {
            //         firstStart = false;
            //     } else {
            //         if (evoIndex <= 1) {
            //             console.log('+=', pause,evoIndex)
            //             createII();
            //         }
            //     }
            // }
        }
    }

    function drawBird(img, x, y) {
        setBirdChords(img, x, y);
        ctx.drawImage(img, x, y, img.width, img.height);
        // evolutionStatus[evoIndex][personIndex].result = x;
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
            if (event.code === 'Enter') {
                createII();
            }
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
        x = 0;
        dx = 0;
        [gameInterval, clickInterval, upInterval, downInterval].forEach((interval) => clearInterval(interval));
        if (isII) {
            if (firstStart) {
                firstStart = false;
            } else {
                if (evoIndex <= 10) {
                    // console.log('+=', pause,evoIndex)
                    createII();
                }
            }
        }
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

    function renderTableScore(data, evoIndex) {
        let html = '';
        Object.entries(data[evoIndex]).forEach(([_, { name, result }]) => {
            html += `
                <div class="item">
                    <span>${name}:</span>
                    <span>${result}</span>
                </div>
            `
        });
        $table.innerHTML = html + 'evo ' + evoIndex;
    }

    function startII() {
        if (evoIndex >= 10) {
            stop();
            return;
        }
        start();
        if (!firstStart) {
            personIndex++;
            completedWidth = 0;
        }
        if (personIndex === 10) {
            // console.log('+=+', evoIndex, personIndex)
            personIndex = 0;
            evoIndex++;
            resetEvoScore();
        }
    }

    function createII() {
        // console.log('createII');
        const interval = setTimeout(() => {
            startII();
            clearInterval(interval);
        }, 1000);
    }

    function resetEvoScore() {
        Object.entries(evolutionStatus[evoIndex]).forEach(([_, score]) => {
            score.result = 0;
        });
    }
}
