document.addEventListener('DOMContentLoaded', () => {
    createCanvas();
});

// const persons = ['Anton', 'Oleg', 'Sergey', 'Nazar', 'Andrey', 'Alina', 'Evegeniy', 'Vokzal', 'Romantu4na_Zdobu4', 'Angel_Predohranitel\''];
const persons = ['A', 'B'];

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
    const drawInterval = 10;
    let completeWidth = 0;
    let ctx, imgW, imgH;
    let dx;
    let x, xp;
    let y;
    let gravity;
    let timeInTheAir;
    let gameInterval, clickInterval, upInterval, downInterval, jumpsIITimeout;
    let lastYBirdPosition;
    let pause = true;
    let evoIndex = 0;
    const maxEvoCount = 300;
    const maxPersonCount = persons.length;
    let personIndex = 0;
    let firstStart = true;
    let isII = true;
    let completedWidth = 0;
    let clicksCount = 0;
    const evolutionStatus = (() => {
        const result = [];
        for (let i = 0; i < maxEvoCount; i++) {
            const onceEvo = {};
            for (let j = 0; j < maxPersonCount; j++) {
                onceEvo[j] = {
                    name: persons[j],
                    result: 0,
                    clicks: [],
                }
            }
            result.push(onceEvo);
        }
        return result;
    })();
    const bestPerson = {
        result: 0,
        clicks: [],
    };
    const lastBestPerson = {
        result: 0,
        clicks: [],
    };
    const bestResults = {

    }

    init();
    console.log('+||+ evo statuc', evolutionStatus)

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
        gameInterval = setInterval(draw, drawInterval);
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
            if (evoIndex > maxEvoCount) {
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

        if (!pause) {
            completedWidth++;
            evolutionStatus[evoIndex][personIndex].result = completedWidth;
        }
    }

    function createBird() {
        const ix = 150;
        const iy = 300 + gravity;
        lastYBirdPosition = iy;

        if (iy <= 0) {
            drawBird(imgBird, ix, 0);
            if (!pause) {
                stop();
            }
        } else if (iy >= canvasYSize - imgBird.height) {
            const stopYPosition = canvasYSize - imgBird.height;
            drawBird(imgBird, ix, stopYPosition);
            if (!pause) {
                stop();
            }
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
        }, drawInterval)
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
        }, drawInterval);
    }

    function down() {
        clearInterval(downInterval);
        downInterval = setInterval(() => {
            gravity += 0.8 * timeInTheAir
        }, drawInterval);
    }

    function addEvents() {
        document.addEventListener('keydown', (event) => {
            if (pause) {
                pause = false;
                start();
                // return;
            }

            if (event.code === 'Enter') {
                createII();
                jumpsII();
            }
            if (event.code === 'Space') {
                bounce();
            }
        });
    }

    function stop() {
        if (!pause) {
            pause = true;
            x = 0;
            dx = 0;
            [gameInterval, clickInterval, upInterval, downInterval].forEach((interval) => clearInterval(interval));
            if (isII) {
                if (firstStart) {
                    firstStart = false;
                }
                if (evoIndex < maxEvoCount) {
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
                if (!pause) {
                    stop();
                }
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
        $table.innerHTML = html + `<div class="item"><span class="evolution">Evolution ${evoIndex}</span></div>`;
    }

    function startII() {
        if (evoIndex > maxEvoCount) {
            stop();
            return;
        }
        clicksCount = 0;
        start();
        jumpsII();
        // updateEvoExpire();
        if (!firstStart) {
            personIndex++;
            completedWidth = 0;
            // clicksCount = 0;
        }
        if (personIndex === maxPersonCount) {
            personIndex = 0;
            evoIndex++;
            console.log('+||+ before +||+', evolutionStatus);
            updateEvoExpire();
            console.log('+||+ after +||+', evolutionStatus);
            // checkBestResult();
        }
        // updateEvoExpire();
    }

    function createII() {
        const interval = setTimeout(() => {
            startII();
            clearInterval(interval);
        }, 1000);
    }

    function updateEvoExpire() {
        if (evoIndex > maxEvoCount || evoIndex === 0) {
            return;
        }

        // console.log('==evo==', evolutionStatus[evoIndex - 1][personIndex].clicks, evolutionStatus[evoIndex][personIndex].clicks)


        // if (evolutionStatus[evoIndex][personIndex].clicks.length > 2) {
        //     evolutionStatus[evoIndex][personIndex].clicks = evolutionStatus[evoIndex - 1][personIndex].clicks.slice(0,  -1);
        // } else {
        //     evolutionStatus[evoIndex][personIndex].clicks = evolutionStatus[evoIndex - 1][personIndex].clicks;
        // }
        Object.entries(evolutionStatus[evoIndex]).forEach(([_, score], index) => {
            // old
            // const { clicks: oldClicks, result: oldResult } = evolutionStatus[evoIndex - 1][index];
            //
            // if (evoIndex >= 2) {
            //     const { clicks: veryOldClicks, result: veryOldResult } = evolutionStatus[evoIndex - 2][index];
            //     if (veryOldResult > oldResult) {
            //         score.clicks = veryOldClicks.slice(0,  -1);
            //         return;
            //     }
            // }
            //
            // if (oldClicks.length > 2) {
            //     score.clicks = oldClicks.slice(0,  -1);
            // } else {
            //     score.clicks = oldClicks;
            // }
            // new
            evolutionStatus.forEach(person => {
                const currentPerson = person[index];
                if (currentPerson.result > bestPerson.result) {
                    console.log('+||+ best', currentPerson.result);
                    bestPerson.result = currentPerson.result;
                    bestPerson.clicks = currentPerson.clicks;

                    if (bestResults[currentPerson.result] === 'undefined') {
                        bestResults[currentPerson.result] = 1;
                    } else {
                        bestResults[currentPerson.result]++;
                    }
                }
                if (currentPerson.result > lastBestPerson.result && lastBestPerson.result < bestPerson.result) {
                    lastBestPerson.result = currentPerson.result;
                    lastBestPerson.clicks = currentPerson.clicks;
                }
            });

            if (bestResults[bestPerson.result] >= 5) {
                bestResults[bestPerson.result] = 0;
                score.clicks = bestPerson.clicks.slice(0,  -2);
            }
            else if (bestPerson.result - lastBestPerson.result < 50) {
                score.clicks = bestPerson.clicks.slice(0,  -1);
            } else {
                score.clicks = bestPerson.clicks;
            }
        });
        // if (evoIndex !== 0) {
        //     console.log('+ evolutionStatus +++', evoIndex,
        //         evolutionStatus[evoIndex][personIndex].clicks.length,
        //         evolutionStatus[evoIndex - 1][personIndex].clicks.length
        //     );
        // }
    }

    function jumpsII() {
        if (evoIndex > maxEvoCount) {
            return;
        }
        if (evoIndex === 0) {
            const jumpMs = getBetweenNumber(100, 1000);
            clearTimeout(jumpsIITimeout);
            jumpsIITimeout = setTimeout(() => {
                if (!pause) {
                    evolutionStatus[evoIndex][personIndex].clicks.push(jumpMs);
                    bounce();
                    jumpsII();
                }
            }, jumpMs);
        } else {
            const { result, clicks } = evolutionStatus[evoIndex - 1][personIndex];
            // console.log('||+||', clicks.length, clicksCount);
            console.log('||==||', clicks.length < clicksCount, clicks.length, clicksCount);
            if (clicks.length < clicksCount) {
                // generate new clicks
                const jumpMs = getBetweenNumber(100, 1000);
                clearTimeout(jumpsIITimeout);
                jumpsIITimeout = setTimeout(() => {
                    if (!pause) {
                        console.log('||=|| generate new click', clicksCount);
                        evolutionStatus[evoIndex][personIndex].clicks.push(jumpMs);
                        bounce();
                        jumpsII();
                        clicksCount++;
                    }
                }, jumpMs);
            } else {
                // use previous clicks
                jumpsIITimeout = setTimeout(() => {
                    if (!pause) {
                        console.log('||=|| use previous click', clicksCount, clicks[clicksCount], evoIndex, evolutionStatus[evoIndex - 1][personIndex].clicks, evolutionStatus[evoIndex][personIndex].clicks);
                        bounce();
                        jumpsII();
                        clicksCount++;
                    }
                }, clicks[clicksCount]);
            }
        }
    }

    function checkBestResult() {

    }
}
