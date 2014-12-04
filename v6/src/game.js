/*
	Craynor the Conqueror - an HTML5 game using Crafty (http://www.craftyjs.com)
	Copyright (C) 2014 

*/

"use strict";

var game = {
	// This defines our grid's size and the size of each of its tiles
	TILE_WIDTH  : 32,	// height and width of a single tile
	TILE_HEIGHT : 32,
	GRID_WIDTH  : 32,	// height and width of game, eg. number of tiles
	GRID_HEIGHT : 20,

	GAME_FONT: 'yoster',

	GRID : new Array(this.GRID_WIDTH),

	GAMELEVEL: 0,

	MUSIC_ON: true,
	SFX_ON: true,

	CHARLEVELS: [
		{ level: 0, xp_treshold: 0, max_health: 5, max_mana: 0 },
		{ level: 1, xp_treshold: 10, max_health: 20, max_mana: 0 },
		{ level: 2, xp_treshold: 30, max_health: 25, max_mana: 10 },
		{ level: 3, xp_treshold: 70, max_health: 30, max_mana: 20 },
		{ level: 4, xp_treshold: 150, max_health: 35, max_mana: 30 },
		{ level: 5, xp_treshold: 310, max_health: 40, max_mana: 40 },
		{ level: 6, xp_treshold: 630, max_health: 45, max_mana: 50 },
		{ level: 7, xp_treshold: 1270, max_health: 50, max_mana: 60 },
		{ level: 8, xp_treshold: 2550, max_health: 55, max_mana: 70 },
		{ level: 9, xp_treshold: 5110, max_health: 60, max_mana: 80 },
		{ level: 10, xp_treshold: 10230, max_health: 65, max_mana: 90 },
		{ level: 11, xp_treshold: 20470, max_health: 70, max_mana: 100 },
		{ level: 12, xp_treshold: 40950, max_health: 75, max_mana: 120 },
	],

	ENEMY: {
		DemonLord: { maxHealth: 10, maxMana: 5, dmg: 2, def: 0, xp: 1, aggroRange: 3, speed: 1 },
		DemonLordBlue: { maxHealth: 25, maxMana: 25, dmg: 4, def: 3, xp: 5, aggroRange: 2, speed: 1 },
		DemonLordYellow: { maxHealth: 50, maxMana: 50, dmg: 6, def: 6, xp: 10, aggroRange: 2, speed: 2 },
		DemonLordBlack: { maxHealth: 100, maxMana: 100, dmg: 8, def: 8, xp: 100, aggroRange: 2, speed: 1 },
	},

	PLAYER: false, // player not initialized

	// Statistical data
	MOBS_KILLED: 0,
	DMG_DEALT: 0,

	// The total width of the game screen. 
	width: function() { return this.TILE_WIDTH * this.GRID_WIDTH; },

	// The total height of the game screen. 
	height: function() { return this.TILE_HEIGHT * this.GRID_HEIGHT; },

	// TODO: this was only for testing purposes, to be completed
	drawSoundButtons: function () {
		var sfxImagePath = (game.SFX_ON == true) ? './assets/images/sound_on.png' : './assets/images/sound_off.png';
		var sfxImage = Crafty.e("2D, DOM, Image, Keyboard")
			.image(sfxImagePath)
			.attr({x: (game.GRID_WIDTH-1)*game.TILE_WIDTH-2, y: 2, h: 32, w: 32, z:10})
			.bind('KeyDown', function(evt) {
				if (evt.key == Crafty.keys["N"]) {
					if (game.SFX_ON == true) {
						game.SFX_ON = false;
						sfxImage.image("./assets/images/sound_off.png");
					} else {
						sfxImage.image("./assets/images/sound_on.png");
						game.SFX_ON = true;
					}
				}
			});

		Crafty.e('2D, DOM, Text').text('N').textFont({size:'15px', family: game.GAME_FONT}).textColor('#9D9D9D').css({'font-size':'15px'}).attr({ x: 948, y: 11, w: 50});

		var musicImagePath = (game.MUSIC_ON == true) ? './assets/images/music_on.png' : './assets/images/music_off.png';
		var musicImage = Crafty.e("2D, DOM, Image, Keyboard")
			.image(musicImagePath)
			.attr({x: (game.GRID_WIDTH-1)*game.TILE_WIDTH-2, y: 30, h: 32, w: 32, z:10})
			.bind('KeyDown', function(evt) {
				if (evt.key == Crafty.keys["M"]) {
					if (game.MUSIC_ON == true) {
						game.MUSIC_ON = false;
						Crafty.audio.pause('thevillage');
						musicImage.image("./assets/images/music_off.png");
					} else {
						musicImage.image("./assets/images/music_on.png");
						Crafty.audio.unpause('thevillage');
						game.MUSIC_ON = true;
					}
				}
			});

		Crafty.e('2D, DOM, Text').text('M').textFont({size:'15px'}).textColor('#9D9D9D').css({'font-size':'15px'}).attr({ x: 948, y: 39, w: 50});
	},

	init: function() {
		$('#divOverlay').width(this.GRID_WIDTH*this.TILE_WIDTH);
		$('#divOverlay').height(this.GRID_HEIGHT*this.TILE_HEIGHT);
		// initialize the game grid
		for (var i = 0; i < game.GRID_WIDTH; i++) {
			this.GRID[i] = new Array(game.GRID_HEIGHT);
		}
	},

	initPlayer: function (x, y) {
		if (!game.PLAYER) {
			game.PLAYER = Crafty.e('PlayerCharacter').at(x, y);
			game.GRID[game.PLAYER.grid_x][game.PLAYER.grid_y] = game.PLAYER;

			// setting defaults to the PLAYER as defined in CHARLEVELS
			game.PLAYER.level = 1;
			game.PLAYER.maxHealth = game.CHARLEVELS[game.PLAYER.level].max_health;
			game.PLAYER.health = game.CHARLEVELS[game.PLAYER.level].max_health;
			game.PLAYER.maxMana = game.CHARLEVELS[game.PLAYER.level].max_mana;

			// drawing
			$('#charLevel').text(game.PLAYER.level);
			$('#charHPValue').text(game.PLAYER.maxHealth);
			$('#charDmg').text(game.PLAYER.dmg);
			$('#charDef').text(game.PLAYER.def);
			$('#charCurrentHP').css("height", game.PLAYER.health/game.PLAYER.maxHealth*100+"%");
			$('#charCurrentXP').css("height", ((game.PLAYER.curr_xp-game.CHARLEVELS[game.PLAYER.level-1].xp_treshold)/(game.CHARLEVELS[game.PLAYER.level].xp_treshold-game.CHARLEVELS[game.PLAYER.level-1].xp_treshold))*100+"%");

			// console.log(game.PLAYER);

		} else {
			// game.PLAYER = Crafty.e('PlayerCharacter').at(x, y);
			// TODO: instead of making a new Player and copy the values, try using the old one and redraw it
			var newPlayer = Crafty.e('PlayerCharacter').at(x, y);

			newPlayer.level = game.PLAYER.level;
			newPlayer.maxHealth = game.PLAYER.maxHealth;
			newPlayer.health = game.PLAYER.health;
			newPlayer.maxMana = game.PLAYER.maxMana;
			newPlayer.curr_xp = game.PLAYER.curr_xp;
			newPlayer.dmg = game.PLAYER.dmg;
			newPlayer.def = game.PLAYER.def;

			game.PLAYER = newPlayer;
			game.GRID[game.PLAYER.grid_x][game.PLAYER.grid_y] = newPlayer;

			$('#charLevel').text(game.PLAYER.level);
			$('#charHPValue').text(game.PLAYER.health);
			$('#charCurrentHP').css("height", game.PLAYER.health/game.PLAYER.maxHealth*100+"%");
			$('#charCurrentXP').css("height", ((game.PLAYER.curr_xp-game.CHARLEVELS[game.PLAYER.level-1].xp_treshold)/(game.CHARLEVELS[game.PLAYER.level].xp_treshold-game.CHARLEVELS[game.PLAYER.level-1].xp_treshold))*100+"%");

		}
	},


	// Initialize and start our game
	start: function() {
		// Start crafty and set a background
		Crafty.init(game.width(), game.height());
		Crafty.background('rgb(87, 109, 20) url(./assets/images/texture_grass.jpg)');
		game.init();

		Crafty.scene('Loading');
	}
}
