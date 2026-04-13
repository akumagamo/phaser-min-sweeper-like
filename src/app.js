const TILES = {
	COVERED: 12,
	BOMB: 11,
	SAVE: 0,
	MARKED: 13,
};

const TILES_SIZE = 24;
const OFFSET = 15;
const HEADER = 50;

const ROWS_COUNT = 16;
const COLS_COUNT = 16;

const FLASH_TIME_MS = 125;

const WIDTH = TILES_SIZE * ROWS_COUNT + 2 * OFFSET;
const HEIGHT = TILES_SIZE * COLS_COUNT + 2 * OFFSET + HEADER;

const gameState = {
	minesPlaced: false,
	minesCount: 40,
	markerCount: 40,
	hardMode: false,
	gameOver: false,
	startTime: 0,
	foundMines: 0,
	coveredTiles: 0,
};

class MainScene extends Phaser.Scene {
	preload() {
		this.load.svg("svg-tiles", "plain_tiles.svg", {
			width: TILES_SIZE * 9,
			height: TILES_SIZE * 2,
		});
	}

	createTextures() {
		// Button One
		let rt = this.make.renderTexture(
			{ width: TILES_SIZE, height: TILES_SIZE },
			false,
		);
		let img = this.add
			.image(100, 0, "svg-tiles")
			.setOrigin(0)
			.setVisible(false);
		rt.draw(img, -TILES_SIZE * 3, -TILES_SIZE);
		rt.saveTexture("box");
		rt.destroy();

		// Button Two
		rt = this.make.renderTexture(
			{ width: TILES_SIZE, height: TILES_SIZE },
			false,
		);
		rt.draw(img, -TILES_SIZE * 6, -TILES_SIZE);
		rt.saveTexture("box-inverted");
		rt.destroy();

		// Particle
		let graphics = this.make.graphics();
		graphics.fillStyle(0x00ff00);
		graphics.fillRect(0, 0, TILES_SIZE, TILES_SIZE);
		graphics.generateTexture("ptl", 16, 16);
	}

	createNormalButton(x, y, width, height) {
		return this.add
			.nineslice(x, y, "box", null, width, height, 6, 18, 6, 18)
			.setOrigin(0);
	}

	createInvertedButton(x, y, width, height) {
		return this.add
			.nineslice(x, y, "box-inverted", null, width, height, 6, 18, 6, 18)
			.setOrigin(0);
	}

	createBackground() {
		// OuterBorder
		this.createNormalButton(0, 0, config.width, config.height);

		// InnerBorder
		this.createInvertedButton(
			11,
			10 + 50,
			ROWS_COUNT * TILES_SIZE + 8,
			COLS_COUNT * TILES_SIZE + 8,
		);

		// Score
		this.mineScoreBoardBackground = this.createInvertedButton(
			11,
			OFFSET,
			80,
			35,
		);
		this.mineScoreBoard = this.add
			.text(OFFSET, OFFSET, "888")
			.setOrigin(0)
			.setFontStyle("bold")
			.setFontSize(28)
			.setAlpha(0.5)
			.setColor("0x0")
			.setFontFamily("Arial");

		// Timer
		this.playTimerBackground = this.createInvertedButton(
			WIDTH - 11,
			OFFSET,
			80,
			35,
		).setOrigin(1, 0);

		this.playTimer = this.add
			.text(OFFSET, OFFSET, "888")
			.setOrigin(0)
			.setFontStyle("bold")
			.setFontSize(28)
			.setAlpha(0.5)
			.setColor("0x0")
			.setFontFamily("Arial");
	}

	createMessageBox() {
		const width = 200;
		const height = 80;
		const offset = 5;
		this.messageBox = this.add.container(
			config.width / 2,
			config.height / 2,
		);
		this.messageBox.visible = false;
		let messageBoardShadow = this.add.rectangle(
			offset,
			offset,
			width,
			height,
			0x0,
			0.25,
		);
		this.messageBoardGameObject = this.add
			.rectangle(0, 0, width, height, 0xffffff)
			.setInteractive()
			.on(
				"pointerdown",
				(...args) => {
					args[args.length - 1].stopPropagation();
					this.closeMessageBox();
				},
				this,
			);

		this.messageBoardTextGameObject = this.add
			.text(0, 0, "You Won!!!")
			.setOrigin(0)
			.setColor("#000000")
			.setFontStyle("bold")
			.setFontSize(20);

		this.messageBox.add(messageBoardShadow);
		this.messageBox.add(this.messageBoardGameObject);
		this.messageBox.add(this.messageBoardTextGameObject);
	}

	setMessageBox(message) {
		this.messageBox.visible = true;
		this.messageBoardTextGameObject.setText(message);
		Phaser.Display.Align.In.Center(
			this.messageBoardTextGameObject,
			this.messageBoardGameObject,
		);
	}

	closeMessageBox() {
		this.messageBox.visible = false;
	}

	createBoard() {
		let emptyMapSizeData = "1"
			.repeat(ROWS_COUNT)
			.split("")
			.map((r) =>
				"1"
					.repeat(COLS_COUNT)
					.split("")
					.map((_) => TILES.COVERED),
			);

		const map = this.make.tilemap({
			data: emptyMapSizeData,
			tileWidth: TILES_SIZE,
			tileHeight: TILES_SIZE,
		});

		const tileset = map.addTilesetImage(
			"svg-tiles",
			null,
			TILES_SIZE,
			TILES_SIZE,
			0,
			0,
		);
		this.mainLayer = map
			.createLayer(0, tileset, OFFSET, OFFSET + HEADER)
			.setInteractive();

		console.info(this.mainLayer, map, tileset);

		console.info(emptyMapSizeData);
	}

	createStartButton() {
		this.button = this.add
			.nineslice(WIDTH / 2, OFFSET, "box", null, 80, 35, 6, 18, 6, 18)
			.setOrigin(0.5, 0)
			.setInteractive()
			.on(
				"pointerdown",
				(...args) => {
					args[args.length - 1].stopPropagation();
					this.button.setTexture("box-inverted");
					setTimeout((_) => this.button.setTexture("box"), 200);
					this.restartGame();
				},
				this,
			);

		this.buttonText = this.add
			.text(OFFSET, OFFSET, "Start")
			.setOrigin(0)
			.setAlpha(0.5)
			.setColor("0x0")
			.setFontFamily("Arial")
			.setFontStyle("bold")
			.setFontSize(20);
		Phaser.Display.Align.In.Center(this.buttonText, this.button);
	}

	create() {
		this.createTextures();
		this.createBackground();
		this.createBoard();
		this.createStartButton();
		this.createMessageBox();

		this.input.mouse.disableContextMenu();
		this.input.on(
			"pointerdown",
			(pointer) => {
				this.handleClicks(pointer);
			},
			this,
		);

		this.meinTimer = this.time.addEvent({
			delay: 1000,
			callback: () => this.updateTimer(),
			callbackScope: this,
			loop: true,
			paused: true,
		});

		this.restartGame();
	}

	updateTimer() {
		if (!gameState.gameOver && gameState.startTime != 0) {
			let seconds = parseInt((Date.now() - gameState.startTime) / 1000);
			if (seconds < 1000) {
				this.setTimer(seconds);
			}
		}
	}

	setupMap(tile) {
		gameState.minesPlaced = true;
		let tiles = this.mainLayer.getTilesWithin();
		let mines = this.placeMines(
			tiles.filter((t) => gameState.hardMode || t != tile),
		);

		this.calculateMines(mines);
		gameState.minesGameObjects = mines;
	}

	restartGame() {
		let tiles = this.mainLayer.getTilesWithin();
		gameState.gameOver = false;
		gameState.minesPlaced = false;

		gameState.foundMines = 0;
		gameState.markerCount = gameState.minesCount;
		gameState.coveredTiles = ROWS_COUNT * COLS_COUNT;

		this.setScore(gameState.minesCount);
		this.setTimer("000");
		this.closeMessageBox();

		gameState.startTime = 0;

		for (let tile of tiles) {
			tile.properties.isBomb = false;
			tile.properties.isMarked = false;
			delete tile.properties.count;
			tile.index = TILES.COVERED;
		}
	}

	handleClicks(pointer) {
		if (gameState.gameOver) {
			return;
		}
		const tile = this.mainLayer.getTileAtWorldXY(
			pointer.worldX,
			pointer.worldY,
		);

		if (tile) {
			if (!gameState.minesPlaced) {
				this.setupMap(tile);
				this.meinTimer.paused = false;
				gameState.startTime = Date.now();
			}
			if (tile.index == TILES.COVERED) {
				if (pointer.button == 2) {
					tile.properties.isMarked = true;
					tile.index = TILES.MARKED;
					if (tile.properties.isBomb) {
						gameState.foundMines++;
					}
					gameState.markerCount--;
					this.setScore(gameState.markerCount);
				} else {
					this.uncover(tile);
				}
			} else if (tile.index == TILES.MARKED) {
				if (pointer.button == 2) {
					tile.properties.isMarked = false;
					tile.index = TILES.COVERED;
					if (tile.properties.isBomb) {
						gameState.foundMines--;
					}
					gameState.markerCount++;
					this.setScore(gameState.markerCount);
				}
			} else if (tile.properties.count > 0) {
				this.numberClick(tile);
			}

			if (this.hasWon()) {
				this.won();
			}
		}
	}

	hasWon() {
		return (
			gameState.foundMines == gameState.minesCount &&
			this.mainLayer.filterTiles((tile) => tile.index === TILES.COVERED)
				.length == 0
		);
	}

	lost() {
		this.setMessageBox("You have Lost!");
		this.meinTimer.paused = true;
		gameState.gameOver = true;
		gameState.minesGameObjects.forEach((m) => {
			m.index = TILES.BOMB;
		});
	}

	won() {
		this.setMessageBox("You Won!!!");
		this.meinTimer.paused = true;
		gameState.gameOver = true;
		const particles = this.add.particles(
			config.width / 2,
			config.height / 2,
			"ptl",
			{
				speed: 100,
				scale: { start: 0.1, end: 1.25 },
				lifespan: 900,
				gravityY: 10,
				duration: 900,
			},
		);
	}

	setScore(value) {
		let v = `000${value}`;
		let startIdx = v.length - 3;
		v = v.substring(startIdx);

		Phaser.Display.Align.In.Center(
			this.mineScoreBoard.setText(`${v}`),
			this.mineScoreBoardBackground,
		);
	}

	setTimer(value) {
		let v = `000${value}`;
		let startIdx = v.length - 3;
		v = v.substring(startIdx);
		Phaser.Display.Align.In.Center(
			this.playTimer.setText(`${v}`),
			this.playTimerBackground,
		);
	}

	numberClick(tile) {
		if (tile.properties.count == 0) {
			return;
		}

		let selectedTiles = [
			this.mainLayer.getTileAt(tile.x - 1, tile.y - 1),
			this.mainLayer.getTileAt(tile.x, tile.y - 1),
			this.mainLayer.getTileAt(tile.x + 1, tile.y - 1),
			this.mainLayer.getTileAt(tile.x - 1, tile.y),
			this.mainLayer.getTileAt(tile.x + 1, tile.y),
			this.mainLayer.getTileAt(tile.x - 1, tile.y + 1),
			this.mainLayer.getTileAt(tile.x, tile.y + 1),
			this.mainLayer.getTileAt(tile.x + 1, tile.y + 1),
		];

		let marks = selectedTiles.reduce((p, tile) => {
			if (tile && tile.index == TILES.MARKED) {
				p++;
			}
			return p;
		}, 0);

		if (marks == tile.properties.count) {
			selectedTiles.forEach((t) => {
				if (t && !gameState.gameOver) {
					this.uncover(t);
				}
			});
		} else {
			selectedTiles.forEach((t) => {
				if (!gameState.gameOver && t && t.index == TILES.COVERED) {
					t.tint = 0xcdcdcd;
					setTimeout((_) => (t.tint = 0xffffff), FLASH_TIME_MS);
				}
			});
		}
	}

	placeMines(cells) {
		let mines = [];
		for (let idx = 0; idx < gameState.minesCount; idx++) {
			let pick = Phaser.Utils.Array.RemoveRandomElement(cells);
			pick.properties.isBomb = true;
			mines.push(pick);
		}
		return mines;
	}

	calculateMines(mines) {
		for (let rowIdx = 0; rowIdx < 16; rowIdx++) {
			for (let colIdx = 0; colIdx < 16; colIdx++) {
				let count = mines.filter(
					(m) =>
						m.x >= colIdx - 1 &&
						m.x <= colIdx + 1 &&
						m.y >= rowIdx - 1 &&
						m.y <= rowIdx + 1,
				);

				let tile = this.mainLayer.getTileAt(colIdx, rowIdx);
				if (tile.properties.isBomb) {
					continue;
				}
				tile.properties.count = count.length;
			}
		}
	}

	uncover(tile) {
		if (tile.properties.isMarked) {
			return;
		}

		if (tile.properties.isBomb) {
			this.lost();
		} else {
			this.clearFields([tile]);
		}
	}

	clearFields(tiles) {
		let current = tiles.pop();

		if (!current) {
			return;
		}

		let hardStop = current.properties.count > 0;

		if (current.index == TILES.COVERED) {
			current.index = current.properties.count;

			let newTiles = [
				this.mainLayer.getTileAt(current.x - 1, current.y - 1),
				this.mainLayer.getTileAt(current.x, current.y - 1),
				this.mainLayer.getTileAt(current.x + 1, current.y - 1),
				this.mainLayer.getTileAt(current.x - 1, current.y),
				this.mainLayer.getTileAt(current.x + 1, current.y),
				this.mainLayer.getTileAt(current.x - 1, current.y + 1),
				this.mainLayer.getTileAt(current.x, current.y + 1),
				this.mainLayer.getTileAt(current.x + 1, current.y + 1),
			];

			for (let newTile of newTiles) {
				if (
					newTile &&
					newTile.index == TILES.COVERED &&
					!newTile.isBomb &&
					!newTile.properties.isMarked
				) {
					if (newTile.properties.count == 0) {
						tiles.push(newTile);
					} else {
						if (!hardStop) {
							newTile.index = newTile.properties.count;
						}
					}
				}
			}
		}
		if (tiles.length > 0) {
			this.clearFields([...tiles]);
		}
	}
}

const config = {
	width: WIDTH,
	height: HEIGHT,
	parent: "app",
	scene: [MainScene],
};

new Phaser.Game(config);
