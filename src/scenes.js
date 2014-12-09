// Game scene
// -------------
// Runs the core gameplay loop
Crafty.scene('Game', function() {

	game.GAMELEVEL += 1;

 	$('#divGUI').show();
	game.drawSoundButtons();
	game.initialiseMenuListener();
	var stagelevel = Crafty.e('2D, DOM, Text, Color').text("Stage: "+game.GAMELEVEL).textColor('#9D9D9D').attr({ x: 748, y: 29, w: 200}).css({'family': game.GAME_FONT, 'font-size':'20px'});

	if (game.SETTINGS.isMusicOn) { Crafty.audio.play('thevillage'); }

	var stage_taser = Crafty.e('2D, DOM, Text, Color, Tween').text("Stage: "+game.GAMELEVEL).textColor('#5A1E00').attr({ x: (game.TILE_WIDTH*game.GRID_WIDTH)/2-100, y: game.TILE_HEIGHT*game.GRID_HEIGHT/2, w: 250, alpha: 0}).css({'family': "Impact", 'font-size':'40px'});
	stage_taser.tween({ alpha: 1}, 20);
	setTimeout(function () {
		stage_taser.tween({ alpha: 0}, 20);
	}, 3000);

	game.initPlayer(2,4);

	// Player character, placed at 5, 5 on our GRID
	// game.GRID[game.PLAYER.grid_x][game.PLAYER.grid_y] = game.PLAYER;

	// Generate level
	for (var x = 0; x < game.GRID_WIDTH; x++) {
		for (var y = 2; y < game.GRID_HEIGHT; y++) {
			var at_edge = x == 0 || x == game.GRID_WIDTH - 1 ||
				y == 2 || y == game.GRID_HEIGHT - 1;
 
 			// this shows the grid coordinates
		 	// Crafty.e('2D, DOM, Text').text(x+":"+y).attr({ x: x*game.TILE_WIDTH, y: y*game.TILE_HEIGHT, w: 32}).css({'family': "Arial", 'font-size':'12px'});

			if (at_edge) {
	        // Place a tree entity at the current tile
				game.GRID[x][y] = Crafty.e('Tree').at(x, y);
			} else if (Math.random() < 0.06 && typeof game.GRID[x][y] == 'undefined' ) {
	        // Place a bush entity at the current tile
				var bush_or_rock = (Math.random() > 0.3) ? 'Bush' : 'Rock';
				game.GRID[x][y] = Crafty.e(bush_or_rock).at(x, y);
			// } else if (Math.random() < (0.03+(game.PLAYER.level/100*0.4)) && typeof game.GRID[x][y] == 'undefined' && y !< 7 || x !< 5) {
			} else if (Math.random() < (0.03+(game.PLAYER.level/100*0.4)) && typeof game.GRID[x][y] == 'undefined') {
				if (y >= 7 || x >= 5) {
					// var enemy_type = (Math.random() > (0.1+(game.PLAYER.level/100*5.5)) ) ? 'DemonLord' : 'DemonLordBlue';
					var enemy_type = 'DemonLord';
					if (game.GAMELEVEL >= 2 && (Math.random() < (game.PLAYER.level/100*7))) { enemy_type = 'DemonLordBlue'; }
					if (game.GAMELEVEL >= 7 && (Math.random() < (game.PLAYER.level/100*3.5))) { enemy_type = 'DemonLordYellow'; }
					if (game.GAMELEVEL >= 12 && (Math.random() < (game.PLAYER.level/100*1.0))) { enemy_type = 'Wolf'; }
					if (game.GAMELEVEL >= 17 && (Math.random() < (game.PLAYER.level/100*1.0))) { enemy_type = 'DemonLordBlack'; }
	// game.GRID[10][10] = Crafty.e('Enemy, Wolf').Enemy('Wolf',10,10);
					game.GRID[x][y] = Crafty.e('Enemy, '+enemy_type).Enemy(enemy_type,x,y);
				}
			}
		}
	}
 
	// Generate villages on the map in random locations
	var max_villages = 10;
	for (var x = 0; x < game.GRID_WIDTH; x++) {
		for (var y = 2; y < game.GRID_HEIGHT; y++) {
			if (Math.random() < 0.02) {
				if (Crafty('Village').length < max_villages && typeof game.GRID[x][y] == 'undefined' ) {
					game.GRID[x][y] = Crafty.e('Village').at(x, y);
				}
			}
		}
	}

	// Make exit
	// game.clear_area({x: game.GRID_WIDTH-2, y: 10}, {x: game.GRID_WIDTH-1, y: 11})

	// Make Black Demon
	if (game.GAMELEVEL == 15) {
		var bDemon_pos = {x: (game.GRID_WIDTH/2), y: 11 }
		game.clear_area({x: bDemon_pos.x-2, y: bDemon_pos.y-3}, {x: bDemon_pos.x+3, y: bDemon_pos.y+2})
		for (var x = bDemon_pos.x-2; x < bDemon_pos.x+3; x++) {
			for (var y = bDemon_pos.y-3; y < bDemon_pos.y+2; y++) {
				var at_edge = x == bDemon_pos.x-2 || x == bDemon_pos.x+2 ||
					y == bDemon_pos.y-3 || y == bDemon_pos.y+1;
	 
				if (at_edge) {
					game.GRID[x][y] = Crafty.e('Tree').at(x, y);
				}
			}
		}
		// game.GRID[x][y] = Crafty.e('Tree').at(bDemon_pos.x, bDemon_pos.y);
		// game.GRID[x][y] = Crafty.e('Tree').at(bDemon_pos.x, bDemon_pos.y+2);
		game.GRID[bDemon_pos.x][bDemon_pos.y-1] = Crafty.e('Enemy, DemonLordBlack').Enemy('DemonLordBlack',bDemon_pos.x,bDemon_pos.y-1);
		game.clear_area({x: bDemon_pos.x, y:bDemon_pos.y+1}, {x: bDemon_pos.x, y:bDemon_pos.y+2}, true);
	}
	// game.GRID[10][10] = Crafty.e('Enemy, Wolf').Enemy('Wolf',10,10);


  // Play a ringing sound to indicate the start of the journey
  if (game.SETTINGS.isSFXOn) { Crafty.audio.play('newgame'); }

  // Show the victory screen once all villages are visisted
  this.show_victory = this.bind('VillageVisited', function() {
    if (!Crafty('Village').length) {
      Crafty.scene('Victory');
    }
  });
}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
	// delete game.GRID;
	// game.GRID = new Array(game.GRID_WIDTH);
	for (var i = 0; i < game.GRID_WIDTH; i++) {
		for (var j = 0; j < game.GRID_HEIGHT; j++) {
			// if ((typeof game.GRID[i][j] == 'object') && game.GRID[i][j].isPlayer == true) {
			// if (typeof game.GRID[i][j] == 'object') {
			// 	// console.log(game.GRID[i][j].)
			// } else {
			game.GRID[i][j] = undefined;
			// }
			// game.GRID[i] = new Array(game.GRID_HEIGHT);
		}
	}

 	$('#divGUI').hide();

  this.unbind('VillageVisited', this.show_victory);
});
 
// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('GameOver', function() {
	// Display some text in celebration of the victory
	if (game.SETTINGS.isSFXOn) { Crafty.audio.play('gameover'); }
	Crafty.audio.stop('thevillage');

	for (var x = 0; x < game.GRID_WIDTH; x++) {
		for (var y = 0; y < game.GRID_HEIGHT; y++) {
			var at_edge = x == 0 || x == game.GRID_WIDTH - 1 ||
				y == 0 || y == game.GRID_HEIGHT - 1;
			if (at_edge) {
				Crafty.e('Tree').at(x, y);
			} 
		}
	}

	// Crafty.e('2D, DOM, Text').text('Game over').textFont({'font-size':'45px'}).attr({ x: 0, y: game.height()/2 - 258, w: game.width() });
		Crafty.e('2D, DOM, Text')
		.text('Game over')
		.attr({ x: 0, y: game.height()/2 - 238, w: game.width() })
		.css({'family': game.GAME_FONT, 'font-size':'45px'})

    // .css({'font-size':'45px'});

	Crafty.e('2D, DOM, Text').text('Player Level: '+game.PLAYER.level).attr({ x: 0, y: game.height()/2 - 134, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'22px'});
	Crafty.e('2D, DOM, Text').text('Sword Damage: '+game.PLAYER.dmg).attr({ x: 0, y: game.height()/2 - 94, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'22px'});
	Crafty.e('2D, DOM, Text').text('Armor Defense: '+game.PLAYER.def).attr({ x: 0, y: game.height()/2 - 54, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'22px'});
	Crafty.e('2D, DOM, Text').text('Stage Level: '+game.GAMELEVEL).attr({ x: 0, y: game.height()/2 -14, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'22px'});
	Crafty.e('2D, DOM, Text').text('Damage Dealt: '+game.DMG_DEALT).attr({ x: 0, y: game.height()/2 +34, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'22px'});
	Crafty.e('2D, DOM, Text').text('Enemys Killed: '+game.MOBS_KILLED).attr({ x: 0, y: game.height()/2 +74, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'22px'});

	// After a short delay, watch for the player to press a key, then restart
	// the game when a key is pressed
	var delay = true;
	setTimeout(function() {
		delay = false; 
		Crafty.e('2D, DOM, Text').text('press any key to restart').attr({ x: 0, y: game.height()/2 + 204, w: game.width() }).css({'family': game.GAME_FONT, 'font-size':'25px'});
	}, 2000);

	game.PLAYER = false;
	game.MOBS_KILLED = 0;
	game.DMG_DEALT = 0;
	game.GAMELEVEL = 0;

	this.restart_game = Crafty.bind('KeyDown', function() {
		if (!delay) {
			Crafty.scene('Game');
			if (game.SETTINGS.isMusicOn) { Crafty.audio.play('thevillage'); }
	    }
	});
}, function() {
	// Remove our event binding from above so that we don't
	//  end up having multiple redundant event watchers after
	//  multiple restarts of the game
	this.unbind('KeyDown', this.restart_game);
});
 
// Victory scene
// -------------
// Tells the player when they've won and lets them start a new game
Crafty.scene('Victory', function() {
	// Display some text in celebration of the victory
	Crafty.audio.stop('thevillage');

	for (var x = 0; x < game.GRID_WIDTH; x++) {
		for (var y = 0; y < game.GRID_HEIGHT; y++) {
			var at_edge = x == 0 || x == game.GRID_WIDTH - 1 ||
				y == 0 || y == game.GRID_HEIGHT - 1;
			if (at_edge) {
				Crafty.e('Tree').at(x, y);
			} 
		}
	}

	Crafty.e('2D, DOM, Text')
		.text('All villages conquered!')
		.attr({ x: 0, y: game.height()/2 - 108, w: game.width() })
		.css({'family': game.GAME_FONT, 'font-size':'45px'});
		// .css({'font-size':'45px'});
 
	// Give'em a round of applause!
	if (game.SETTINGS.isSFXOn) { Crafty.audio.play('winning'); }
 
	// After a short delay, watch for the player to press a key, then restart
	// the game when a key is pressed
	var delay = true;
	setTimeout(function() {
		delay = false; 
		Crafty.e('2D, DOM, Text')
		.text('press any key to continue')
		.attr({ x: 0, y: game.height()/2 + 24, w: game.width() })
		.css({'family': game.GAME_FONT, 'font-size':'25px'});
	}, 2000);

	this.restart_game = Crafty.bind('KeyDown', function() {
		if (!delay) {
			Crafty.scene('Game');
			if (game.SETTINGS.isMusicOn) { Crafty.audio.play('thevillage'); }
	    }
	});
}, function() {
	// Remove our event binding from above so that we don't
	//  end up having multiple redundant event watchers after
	//  multiple restarts of the game
	this.unbind('KeyDown', this.restart_game);
});
 
// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
  // Draw some text for the player to see in case the file
  //  takes a noticeable amount of time to load
    // Place a tree at every edge square on our GRID of 16x16 tiles


  Crafty.e('2D, DOM, Text')
    .text('Craynor the Conqueror')
    .attr({ x: 0, y: game.height()/2 - 108, w: game.width() })
    .css({'font-size':'45px'});


  var loading_text = Crafty.e('2D, DOM, Text')
    .text('Loading; please wait...')
    .attr({ x: 0, y: game.height()/2 - 24, w: game.width() });
 
  // Load our sprite map image
  Crafty.load([
    // 'assets/16x16_forest_2.gif',
    'assets/images/sound_on.png',
    'assets/images/sound_off.png',
    'assets/images/32x32_sword.png',
    'assets/images/32x32_shield.png',
    'assets/images/sword.png',
    'assets/images/shield.png',
    'assets/images/slash_001_red.png',
    'assets/images/32x32_enemy.png',
    'assets/images/32x32_enemy_blue_4.png',
    'assets/images/32x32_enemy_yellow_4.png',
    'assets/images/32x32_enemy_black.png',
    'assets/images/32x32_wolf.gif',
    'assets/32x32_hunter.png',
    'assets/32x32_forest.gif',

    'assets/destruction.wav',
    'assets/newgame.wav',
    'assets/candy_dish_lid.mp3',
    'assets/candy_dish_lid.ogg',
    'assets/candy_dish_lid.aac',
    'assets/winning.wav',
    'assets/TheVillageMSX.mp3',
    'assets/sfx/swing1.wav',
    'assets/sfx/swing2.wav',
    'assets/sfx/swing3.wav',
    'assets/sfx/sword_sheath.mp3',
    'assets/sfx/chainmail2.wav',
    'assets/sfx/nohit.wav',
    'assets/sfx/pain1.wav',
    'assets/sfx/pain2.wav',
    'assets/sfx/pain5.wav',
    'assets/sfx/death.wav',
    'assets/sfx/gameover.wav',
    'assets/sfx/levelup.wav'
    ], function(){
    // Once the images are loaded...
 
    // Define the individual sprites in the image
    // Each one (spr_tree, etc.) becomes a component
    // These components' names are prefixed with "spr_"
    //  to remind us that they simply cause the entity
    //  to be drawn with a certain sprite
    Crafty.sprite(32, 'assets/32x32_forest.gif', {
      spr_tree:    [0, 0],
      spr_bush:    [1, 0],
      spr_village: [0, 1],
      spr_rock:    [1, 1]
    });

    for (var x = 0; x < game.GRID_WIDTH; x++) {
  	  for (var y = 0; y < game.GRID_HEIGHT; y++) {
  	    var at_edge = x == 0 || x == game.GRID_WIDTH - 1 ||
                    y == 0 || y == game.GRID_HEIGHT - 1;
    	  if (at_edge) {
        // Place a tree entity at the current tile
    	    Crafty.e('Tree').at(x, y);
        } 
    }
  }
 
    // Define the PC's sprite to be the first sprite in the third row of the
    //  animation sprite map
    Crafty.sprite(32, 'assets/32x32_hunter_2.png', {
      spr_player:  [0, 2],
    }, 0, 2);

    Crafty.sprite(32, 'assets/images/32x32_enemy.png', {
      DemonLord:  [0, 0],
    }, 0, 2);

    Crafty.sprite(32, 'assets/images/32x32_enemy_blue_4.png', {
      DemonLordBlue:  [0, 0],
    }, 0, 2);

    Crafty.sprite(32, 'assets/images/32x32_enemy_yellow_4.png', {
      DemonLordYellow:  [0, 0],
    }, 0, 2);

    Crafty.sprite(32, 'assets/images/32x32_enemy_black.png', {
      DemonLordBlack:  [0, 0],
    }, 0, 2);

    Crafty.sprite(32, 'assets/images/slash_001_red.png', {
      spr_slash:  [0, 0],
    }, 0, 0);

    Crafty.sprite(32, 'assets/images/32x32_wolf.gif', {
      Wolf:  [0, 0],
    }, 0, 0);

    // Define our sounds for later use
    Crafty.audio.add({
      destruction: 	['assets/destruction.wav'],
      winning: 		['assets/winning.wav'],
      newgame: 		['assets/newgame.wav'],
      thevillage: 	['assets/TheVillageMSX.mp3'],
      ring: 		['assets/candy_dish_lid.mp3',
                	'assets/candy_dish_lid.ogg',
            	    'assets/candy_dish_lid.aac'],
      swing1: 		['assets/sfx/swing1.wav'],
      swing2: 		['assets/sfx/swing2.wav'],
      swing3: 		['assets/sfx/swing3.wav'],
      loot_sword:	['assets/sfx/sword_sheath.mp3'],
      loot_armor:	['assets/sfx/chainmail2.wav'],
      nohit:		['assets/sfx/nohit.wav'],
      pain1:		['assets/sfx/pain1.wav'],
      pain2:		['assets/sfx/pain2.wav'],
      pain5:		['assets/sfx/pain5.wav'],
      death:		['assets/sfx/death.wav'],
      gameover:		['assets/sfx/gameover.wav'],
      levelup: 		['assets/sfx/levelup.wav']
    });
 
    // Now that our sprites are ready to draw, start the game
    // Crafty.scene('Game');
  });

  loading_text.destroy();

  Crafty.e('2D, DOM, Text')
    .text('press any key to play')
    .attr({ x: 0, y: game.height()/2 - 24, w: game.width() });


	this.restart_game = Crafty.bind('KeyDown', function() {
		Crafty.scene('Game');
		if (game.SETTINGS.isMusicOn) { Crafty.audio.play('thevillage'); }


  });

}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});
