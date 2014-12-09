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

	SETTINGS: { 
		volume: 10, 		// 0 off to 10
		difficulty: 2, 	 	// 1 easy, 2 medium, 3 hard
		isMusicOn: false,
		isSFXOn: true,
		sfxImage: {},
		musicImage: {},
		},
	
	MENU: {
		isDrawn: false,
		index: 0,
		Background: {},
		Elements: {
			Resume:		{},
			Save:  		{},
			Load:  		{},
			ToggleMusic:{},
			ToggleSFX:	{},
			Volume: 	{},
			Difficulty: {},
			Exit: 		{},
		},
		Values: {
			ToggleMusic:{},
			ToggleSFX:	{},
			Volume: 	{},
			Difficulty: {},
		},
		
		// Map must be in the same order, and number of elements as game.MENU.Elements
		Map: [
		 // Resume
		 function() {
			 if(arguments[0] == "ENTER") {
				game.MENU.index = 0;
				game.showMenu();

			 }
			 },			 
		 // Save
		 function() {
			 if(arguments[0] == "ENTER") {console.log("Save!");}
			 },			 
		 // Load
		 function() { 
			 if(arguments[0] == "ENTER") {console.log("Load!");}
			 },			 
		 // Toggle Music
		 function() { 
			game.SETTINGS.isMusicOn = !game.SETTINGS.isMusicOn;
	 		var musicImagePath = (game.SETTINGS.isMusicOn == true) ? './assets/images/music_on.png' : './assets/images/music_off.png';
			game.SETTINGS.musicImage.image(musicImagePath);
			game.MENU.Values.ToggleMusic.text(game.SETTINGS.isMusicOn);
			if (game.SETTINGS.isMusicOn) { Crafty.audio.unpause('thevillage'); } else {Crafty.audio.pause('thevillage'); }
		 },		 
		 // Toggle SFX
		 function() {
			game.SETTINGS.isSFXOn = !game.SETTINGS.isSFXOn;
	 		var sfxImagePath = (game.SETTINGS.isSFXOn == true) ? './assets/images/sound_on.png' : './assets/images/sound_off.png';
			game.SETTINGS.sfxImage.image(sfxImagePath);
			game.MENU.Values.ToggleSFX.text(game.SETTINGS.isSFXOn);
		 },
		 // Volume
		 function() {
			if(arguments[0] == "LEFT_ARROW") {if(game.SETTINGS.volume > 0) {game.SETTINGS.volume -= 1;}}
			else if (arguments[0] == "RIGHT_ARROW") {if(game.SETTINGS.volume < 10) {game.SETTINGS.volume += 1;}}
			game.MENU.Values.Volume.text(game.SETTINGS.volume);
		 },	 
		 // Difficulty
		 function() { if(arguments[0] == "LEFT_ARROW") {if(game.SETTINGS.difficulty > 1) {game.SETTINGS.difficulty -= 1;}}
			else if (arguments[0] == "RIGHT_ARROW") {if(game.SETTINGS.difficulty < 3) {game.SETTINGS.difficulty += 1;}}
			game.MENU.Values.Difficulty.text(game.SETTINGS.difficulty);
		 },
		 // Exit
		 function() { 
		 	game.MENU.isDrawn = false;
			Crafty.scene('GameOver'); 
		},
		],
	},

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
		{ level: 13, xp_treshold: 81910, max_health: 80, max_mana: 125 },
		{ level: 14, xp_treshold: 163830, max_health: 85, max_mana: 130 },
		{ level: 15, xp_treshold: 327670, max_health: 90, max_mana: 135 },
		{ level: 16, xp_treshold: 655350, max_health: 95, max_mana: 140 },
		{ level: 17, xp_treshold: 1310710, max_health: 100, max_mana: 145 },
	],

	ENEMY: {
		DemonLord: { maxHealth: 10, maxMana: 5, dmg: 2, def: 0, xp: 1, aggroRange: 3, speed: 1 },
		DemonLordBlue: { maxHealth: 25, maxMana: 25, dmg: 4, def: 3, xp: 5, aggroRange: 2, speed: 1 },
		DemonLordYellow: { maxHealth: 50, maxMana: 50, dmg: 6, def: 6, xp: 20, aggroRange: 2, speed: 2 },
		DemonLordBlack: { maxHealth: 100, maxMana: 100, dmg: 15, def: 10, xp: 100, aggroRange: 2, speed: 1 },
		Wolf: { maxHealth: 20, maxMana: 20, dmg: 15, def: 0, xp: 20, aggroRange: 4, speed: 1 },
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
		var sfxImagePath = (game.SETTINGS.isSFXOn == true) ? './assets/images/sound_on.png' : './assets/images/sound_off.png';
		game.SETTINGS.sfxImage = Crafty.e("2D, DOM, Image, Keyboard")
			.image(sfxImagePath)
			.attr({x: (game.GRID_WIDTH-1)*game.TILE_WIDTH-2, y: 2, h: 32, w: 32, z:10})
			.bind('KeyDown', function(evt) {
				if (evt.key == Crafty.keys["N"]) {
					if (game.SETTINGS.isSFXOn == true) {
						game.SETTINGS.isSFXOn = false;
						game.SETTINGS.sfxImage.image("./assets/images/sound_off.png");
					} else {
						game.SETTINGS.sfxImage.image("./assets/images/sound_on.png");
						game.SETTINGS.isSFXOn = true;
					}
				}
			});

		Crafty.e('2D, DOM, Text').text('N').textColor('#9D9D9D').css({'family': game.GAME_FONT, 'font-size':'15px'}).attr({ x: 948, y: 11, w: 50});

		var musicImagePath = (game.SETTINGS.isMusicOn == true) ? './assets/images/music_on.png' : './assets/images/music_off.png';
		game.SETTINGS.musicImage = Crafty.e("2D, DOM, Image, Keyboard")
			.image(musicImagePath)
			.attr({x: (game.GRID_WIDTH-1)*game.TILE_WIDTH-2, y: 30, h: 32, w: 32, z:10})
			.bind('KeyDown', function(evt) {
				if (evt.key == Crafty.keys["M"]) {
					if (game.SETTINGS.isMusicOn == true) {
						game.SETTINGS.isMusicOn = false;
						Crafty.audio.pause('thevillage');
						game.SETTINGS.musicImage.image("./assets/images/music_off.png");
					} else {
						game.SETTINGS.musicImage.image("./assets/images/music_on.png");
						Crafty.audio.unpause('thevillage');
						game.SETTINGS.isMusicOn = true;
					}
				}
			});

		Crafty.e('2D, DOM, Text').text('M').textColor('#9D9D9D').css({'family': game.GAME_FONT, 'font-size':'15px'}).attr({ x: 948, y: 39, w: 50});
	},
    
    // Calculates the distance between two 2D points
    vectorDistance: function (playerX, playerY, mobX, mobY)
        {
            var x = playerX-mobX;
            var y = playerY-mobY;
            return Math.sqrt(x*x+y*y);
        },
    
    // Returns an Array with Objects, sorted ascending by the distance between the player and possible movement tiles of a monster
    // Array should always contain 9 Objects
    // First coordinates: array[0].x; array[0].y;
    // Last coordinates: array[array.length() -1].x; array[array.length() -1].y;
    calculateDistanceArray: function (playerX, playerY, mobX, mobY)
    {
        var distanceArray = [];
        var m = 0;
        for(var i = -1; i <= 1; i++)
        {
            for(var j = -1; j <= 1; j++)
            {
                //if(!(i == 0 && j == 0))
                distanceArray[m++] = {x:mobX+j, y:mobY+i, distance: game.vectorDistance(playerX, playerY, mobX+j, mobY+i)};

            }
        }
        distanceArray.sort(function(a, b){return a.distance-b.distance})
        console.log(distanceArray);
        return distanceArray;
    },
	
	// Menu Listener for key ESC
	initialiseMenuListener: function () 
	{	
			Crafty.e("2D, DOM, Keyboard")
			.bind('KeyDown', function(evt) 
			{
				if (evt.key == Crafty.keys["ESC"])
				{
					game.MENU.index = 0;
					game.showMenu();
				}
				else if(game.MENU.isDrawn == true && evt.key == Crafty.keys["UP_ARROW"])
				{
						game.manageMenu("UP_ARROW");
				}
				else if(game.MENU.isDrawn == true && evt.key == Crafty.keys["DOWN_ARROW"])
				{
						game.manageMenu("DOWN_ARROW");
				}
				else if(game.MENU.isDrawn == true && evt.key == Crafty.keys["RIGHT_ARROW"])
				{
						game.manageMenu("RIGHT_ARROW");
				}
				else if(game.MENU.isDrawn == true && evt.key == Crafty.keys["LEFT_ARROW"])
				{
						game.manageMenu("LEFT_ARROW");
				}
				else if(game.MENU.isDrawn == true && (evt.key == Crafty.keys["ENTER"] || evt.key == Crafty.keys["SPACE"]))
				{
						game.manageMenu("ENTER");
				}
			});
	},
	
	// Responsible for drawing and destroying the Menu
	showMenu: function () {		
		// If the Menu is NOT on the screen, isDrawn is false and so the Menu will be DRAWN on the screen
		if(game.MENU.isDrawn == false)
		{
			// background
			game.MENU.Background = Crafty.e('2D, DOM').css({'background':'rgb(12,49,19)', 'border': '4px solid rgb(6, 25, 10)'}).attr({ x: 150, y: 100, w: 550, h: 480});
			// 1. Column
			game.MENU.Elements.Resume = Crafty.e('2D, DOM, Text').text('Resume').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 150, w: 180});
			game.MENU.Elements.Save = Crafty.e('2D, DOM, Text').text('Save').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 200, w: 180});
			game.MENU.Elements.Load = Crafty.e('2D, DOM, Text').text('Load').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 250, w: 180});
			game.MENU.Elements.ToggleMusic = Crafty.e('2D, DOM, Text').text('Music').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 300, w: 180});
			game.MENU.Elements.ToggleSFX = Crafty.e('2D, DOM, Text').text('SFX').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 350, w: 180});
			game.MENU.Elements.Volume = Crafty.e('2D, DOM, Text').text('Volume').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 400, w: 180});
			game.MENU.Elements.Difficulty = Crafty.e('2D, DOM, Text').text('Difficulty').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 450, w: 180});
			game.MENU.Elements.Exit = Crafty.e('2D, DOM, Text').text('Exit').textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 250, y: 500, w: 180});
			
			// 2. Column
			game.MENU.Values.ToggleMusic = Crafty.e('2D, DOM, Text').text(game.SETTINGS.isMusicOn).textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 550, y: 300, w: 50});
			game.MENU.Values.ToggleSFX = Crafty.e('2D, DOM, Text').text(game.SETTINGS.isSFXOn).textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 550, y: 350, w: 50});
			game.MENU.Values.Volume = Crafty.e('2D, DOM, Text').text(game.SETTINGS.volume).textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 550, y: 400, w: 50});
			game.MENU.Values.Difficulty = Crafty.e('2D, DOM, Text').text(game.SETTINGS.difficulty).textColor('#000000').css({'family': game.GAME_FONT, 'font-size':'30px'}).attr({ x: 550, y: 450, w: 50});
			
			// Draw a border around the first Menu Element to mark it as 'active'
			game.MENU.Elements.Resume.css({'family': game.GAME_FONT, 'font-size':'30px', 'border-style': 'solid'});
			
			game.MENU.isDrawn = true;


		}
		// If the Menu IS on the screen, isDrawn is true and so the Menu will be DESTROYED
		else
		{
			// Background
			game.MENU.Background.destroy();
			// 1. Column
			game.MENU.Elements.Resume.destroy();
			game.MENU.Elements.Save.destroy();
			game.MENU.Elements.Load.destroy();
			game.MENU.Elements.ToggleMusic.destroy();
			game.MENU.Elements.ToggleSFX.destroy();
			game.MENU.Elements.Volume.destroy();
			game.MENU.Elements.Difficulty.destroy();
			game.MENU.Elements.Exit.destroy();
			
			// 2. Column
			game.MENU.Values.ToggleMusic.destroy();
			game.MENU.Values.ToggleSFX.destroy();
			game.MENU.Values.Volume.destroy();
			game.MENU.Values.Difficulty.destroy();
			
			game.MENU.isDrawn = false;
		}
	},
	
	// Marks Menu Elements as active, game.MENU.index indicates the active Element
	manageMenu: function () {
		
		var keys = Object.keys(game.MENU.Elements);	
		var length = Object.keys(game.MENU.Elements).length-1;
		if(arguments[0] == "DOWN_ARROW")
		{
			game.MENU.Elements[keys[game.MENU.index++]].css({'family': game.GAME_FONT, 'font-size':'30px', 'border-style': 'none'});
			if(	game.MENU.index > length) { game.MENU.index = 0;}
			game.MENU.Elements[keys[game.MENU.index]].css({'family': game.GAME_FONT, 'font-size':'30px', 'border-style': 'solid'});
		}
		else if(arguments[0] == "UP_ARROW")
		{
			game.MENU.Elements[keys[game.MENU.index--]].css({'family': game.GAME_FONT, 'font-size':'30px', 'border-style': 'none'});
			if(	game.MENU.index < 0) { game.MENU.index = length;}
			game.MENU.Elements[keys[game.MENU.index]].css({'family': game.GAME_FONT, 'font-size':'30px', 'border-style': 'solid'});
		}
		else if(arguments[0] == "RIGHT_ARROW")
		{
			game.MENU.Map[game.MENU.index]("RIGHT_ARROW");
		}
		else if(arguments[0] == "LEFT_ARROW")
		{
			game.MENU.Map[game.MENU.index]("LEFT_ARROW");
		}
		else if(arguments[0] == "ENTER")
		{
			game.MENU.Map[game.MENU.index]("ENTER");
		}
	},


	clear_area: function (begin, end, debug) {
		for (var x = begin.x; x <= end.x; x++) {
			for (var y = begin.y; y <= end.y; y++) {
				if (typeof game.GRID[x][y] != 'undefined') {
					if (debug) { console.log('clear '+x+" "+y); }
					game.GRID[x][y].destroy();
					game.GRID[x][y] = undefined;
				};
			}
		}
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
