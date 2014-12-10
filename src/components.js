// The Grid component allows an element to be located
//  on a grid of tiles
Crafty.c('Grid', {
  grid_x: 0,
  grid_y: 0,
  init: function() {
    this.attr({
      w: game.TILE_WIDTH,
      h: game.TILE_HEIGHT
    })
  },
 
  // Locate this entity at the given position on the grid
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/game.TILE_WIDTH, y: this.y/game.TILE_HEIGHT }
    } else {
      this.attr({ x: x * game.TILE_WIDTH, y: y * game.TILE_HEIGHT });
      this.grid_x = x;
      this.grid_y = y;
      return this;
    }
  }
});
 
// An "Actor" is an entity that is drawn in 2D on canvas
//  via our logical coordinate grid
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, Canvas, Grid');
  },
});
 
// A Tree is just an Actor with a certain sprite
Crafty.c('Tree', {
  init: function() {
    this.requires('Actor, Solid, spr_tree');
  },
});

// A Tree is just an Actor with a certain sprite
Crafty.c('Enemy', {
  init: function() {
    this.requires('Actor, Solid, Creature');
  },
  Enemy: function (type, grid_x, grid_y) {
	// console.log(game.ENEMY[type]);
	this.type = type;
	this.maxHealth = game.ENEMY[type].maxHealth;
	this.health = game.ENEMY[type].maxHealth;
	this.maxMana = game.ENEMY[type].maxMana;
	this.dmg = game.ENEMY[type].dmg;
	this.def = game.ENEMY[type].def;
	this.aggroRange = game.ENEMY[type].aggroRange;
	this.XP = game.ENEMY[type].xp;
  	return this.at(grid_x, grid_y);
  }
});
 
// A Bush is just an Actor with a certain sprite
Crafty.c('Bush', {
  init: function() {
    this.requires('Actor, Solid, spr_bush');
  },
});

// A Rock is just an Actor with a certain sprite
Crafty.c('Rock', {
  init: function() {
    this.requires('Actor, Solid, spr_rock');
  },
});

Crafty.c('loot_sword_1', {
  init: function() {
    this.requires('Actor, Image')
    	.image('assets/images/32x32_sword.png');
  },
});

Crafty.c('loot_armor_1', {
  init: function() {
    this.requires('Actor, Image')
    	.image('assets/images/32x32_shield.png');
  },
});

Crafty.c('RingOfRegeneration', {
  init: function() {
    this.requires('Actor, Image')
    	.image('assets/images/ringofreg.png');
  },
});

Crafty.c('SlashEffect', {
	init: function() {
		this.requires('2D, Canvas, spr_slash, SpriteAnimation')
	   		.animate('Slash', 0, 0, 6)
			.attr({ z: 56 });
		return this;
	},

	showSlash: function(x,y) {
		this.x = x+1;
		this.y = y;
		this.animate('Slash', 3, 1);
		slashE = this;
	  	setTimeout(function() {
	  		slashE.destroy();
	  	}, 50); 
	},
});

Crafty.c('FloatingText', {
	// x and y: the exact coordinates
	// color: 	as hex e.g. #562807
	// speed:  	fadeout time, 0 to not fade out
	// size:  	{w, h} object 
	// fontSize: "20px"
	FloatingText: function(x, y, txt, color, speed, size, fontSize) {
		this.requires('2D, DOM, Text, Tween')
			.attr({ w: size.w, h: size.h, x: x, y: y, z: 60 })
			.textColor(color)
			.text(txt)
			// .textFont({ size: fontSize || "30px", family: game.GAME_FONT })
			.css({'family': game.GAME_FONT, 'font-size': fontSize || '20px'})
			//.css({ 'font-size': '16pt', 'font-weight': 'bold', 'font-family': GAME_FONT })
			.bind('TweenEnd', function() {
				floatTxt.destroy();
			});
			floatTxt = this;
			// setTimeout(function () {
				if (speed) {
					floatTxt.tween({ alpha: 0}, speed);
				};
			// }, 50);
		return this;
	}
});

Crafty.c('Mob', {
	type: "DemonLord",
	health: 10,
	maxHealth: 10,
	mana: 5,
	maxMana: 5,
	dmg: 2,
	def: 0,
	XP: 1,
	aggroRange: 2,
	level: 1,

	attacking2: false, // whether the player is currently attacking or not
	isPlayer: false,

	init: function(type) {
		// attacking2: false; // whether the player is currently attacking or not
		// this.bind('meleeAttack', function(evt) {
		// 	// TODO: strangly a lot of 'meleeAttack' Events got cought, though only one is sent
		// 	atkMob = evt.attacker;
		// 	if (atkMob.attacking2 == false) {
		// 		atkMob.meleeAttack(evt);
		// 		atkMob.attacking2 = true;
		// 		setTimeout(function () {
		// 			atkMob.attacking2 = false;
		// 		}, 150 );
		// 	};
		// });
		this.bind('inAggroRange', function(evt) {
			if (this.inAggroRange(evt.player_x, evt.player_y, this.grid_x, this.grid_y) && !this.isPlayer) {

				// calculate Mob movement
				var movement = {x:0, y:0};

				// if 	(Math.abs(this.grid_x-evt.player_x) >= Math.abs(this.grid_y-evt.player_y)) {
				if ((this.grid_x<evt.player_x)) {
					movement.x = 1;
				} else if ((this.grid_x>evt.player_x)){
					movement.x = -1;
				}	
				 
				if ((this.grid_y<evt.player_y)) {
					movement.y = 1;
				} else if ((this.grid_y>evt.player_y)){
					movement.y = -1;
				}
				
				if (!this.performMobMove(movement)) {
					movement = {x:0, y:0};
					if (evt.player_y == this.grid_y) {
						if (evt.player_x < this.grid_x) {
							movement.x = -1;
							if (game.GRID[this.grid_x-1][this.grid_y-1] != 'undefined') { movement.y = -1 };
							if (game.GRID[this.grid_x-1][this.grid_y+1] != 'undefined') { movement.y = +1 };
						}
						if (evt.player_x > this.grid_x) {
							movement.x = 1;
							if (game.GRID[this.grid_x+1][this.grid_y-1] != 'undefined') { movement.y = -1 };
							if (game.GRID[this.grid_x+1][this.grid_y+1] != 'undefined') { movement.y = +1 };
						}
					} else if (evt.player_x == this.grid_x){
						if (evt.player_y < this.grid_y) {
							movement.y = -1;
							if (game.GRID[this.grid_x-1][this.grid_y-1] != 'undefined') { movement.x = -1 };
							if (game.GRID[this.grid_x+1][this.grid_y-1] != 'undefined') { movement.x = +1 };
						}
						if (evt.player_y > this.grid_y) {
							movement.y = 1;
							if (game.GRID[this.grid_x-1][this.grid_y+1] != 'undefined') { movement.x = -1 };
							if (game.GRID[this.grid_x+1][this.grid_y+1] != 'undefined') { movement.x = +1 };
						}

					}

					if (!this.performMobMove(movement)) {
						movement = {x:0, y:0};
						if (evt.player_x > this.grid_x) { 
							movement.x = 1;
						} else if (evt.player_x < this.grid_x) {
							movement.x = -1;
							// TODO: player right of stone, mob above player, player moves under stone, mob moves above stone!
						} else if (evt.player_y < this.grid_y) {
							movement.y = -1;
						} else if (evt.player_y > this.grid_y) {
							movement.y = 1;
						}
						this.performMobMove(movement);

						// if (evt.player_x > this.grid_x) {
						// 	if (evt.player_y > this.grid_y) {
						// 		if (Math.abs(this.grid_x-evt.player_x) >= Math.abs(this.grid_y-evt.player_y)) { 
						// 			movement.x = 1;
						// 		} else {
						// 			movement.y = 1;
						// 		}
						// 	}
						// }
					}
				// 	movement.x = 0;
				// 	movement.y = 0;
				// 	if ((this.grid_y<evt.player_y)) {
				// 		movement.y = 1;
				// 	} else {
				// 		movement.y = -1;
				}	
				// this.performMobMove(movement);
				
			    // Crafty.e('FloatingText').FloatingText(this.x+8, this.y-14, '!', '#BBBB00', 100, {w:32, h:32}, "20px");
			}
	
		});

	},

	inAggroRange: function (player_x, player_y, mob_x, mob_y) {
		if (player_x >= (mob_x-this.aggroRange) && player_x <= (mob_x+this.aggroRange) ) {
			if (player_y >= (mob_y-this.aggroRange) && player_y <= (mob_y+this.aggroRange) ) {
				return true;
			}
		}
		return false;
	},

	performMobMove: function(movement) {
		// if (typeof game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] == 'undefined' || // move to a place, if its either empty or no solid
		if (typeof game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] == 'undefined') { // move to a place, if its either empty or no solid
			// game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.Solid != true) { 
			// TODO mob destroyes sword
			this.moveMob(movement);
			return true;
		} else if (game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].isPlayer) {
			// Crafty.trigger('meleeAttack', {attacker: this, victim: game.GRID[this.grid_x+movement.x][this.grid_y+movement.y]});
			this.meleeAttack({attacker: this, victim: game.GRID[this.grid_x+movement.x][this.grid_y+movement.y]});
			return true;
		} else {
			return false;
		}
	},

	meleeAttack: function (fighters, revengeAttack) {
		var hitSound = '';

		dmgTaken = this.calcDmg(fighters.attacker.dmg, fighters.victim.def);
		fighters.victim.health -= dmgTaken;
	    Crafty.e('FloatingText').FloatingText(fighters.victim.x-2, fighters.victim.y+4, dmgTaken.toString(), '#562807', 25, {w:32, h:32}, "20px");

        if (dmgTaken <= 0) {
		    hitSound = 'nohit';
		} else {
		    if (fighters.victim.isPlayer) {
				hitSound = (Math.random() > 0.66) ? 'pain1' : (Math.random() > 0.66) ? 'pain2' : 'pain5';
				if (fighters.victim.health <= 0) {
					// player death
					fighters.victim.health = 0;
					hitSound = 'death';
					game.PLAYER.destroy();
					game.GRID[fighters.victim.grid_x][fighters.victim.grid_y] = undefined;
					setTimeout(function () {
						Crafty.scene('GameOver');
					}, 2000);
				}
				$('#charCurrentHP').css("height", fighters.victim.health/fighters.victim.maxHealth*100+"%");
				$('#charHPValue').text(fighters.victim.health);
		    } else {
				game.DMG_DEALT += dmgTaken;
				if (fighters.victim.health <= 0) {
					// Monster killed
					var loot_type = false;

					if (typeof game.ENEMY[game.GRID[fighters.victim.grid_x][fighters.victim.grid_y].type].loot != 'undefined') {
						loot_type = game.ENEMY[game.GRID[fighters.victim.grid_x][fighters.victim.grid_y].type].loot;
					} else if (Math.random() < (0.095-(0.015*game.SETTINGS.difficulty))) {
						var loot_type = (Math.random() < 0.8) ? 'loot_sword_1' : 'loot_armor_1';
					}
					game.MOBS_KILLED += 1;
					fighters.victim.destroy();
					game.GRID[fighters.victim.grid_x][fighters.victim.grid_y] = undefined;
					if (loot_type) {
						// yay loot!
						game.GRID[fighters.victim.grid_x][fighters.victim.grid_y] = Crafty.e(loot_type).at(fighters.victim.grid_x,fighters.victim.grid_y);
					}
					this.giveXP(fighters.attacker, fighters.victim.XP);
				    hitSound = 'destruction';
				} else {
			        hitSound = (Math.random() > 0.66) ? 'swing1' : (Math.random() > 0.66) ? 'swing2' : 'swing3';
			    }
		    }
		}

	    if (game.SETTINGS.isSFXOn) { Crafty.audio.play(hitSound,1,game.SETTINGS.volume/10); }

	    // Crafty.e('FloatingText').FloatingText(fighters.attacker.x+8, fighters.attacker.y-4, dmgTaken.toString(), '#562807', 25, {w:32, h:32}, "20px");

	    // Crafty.e('SlashEffect').showSlash(fighters.victim.x,fighters.victim.y);
	},
		
		// 	meleeAttack: function (fighters, revengeAttack) {
		// if (revengeAttack) {
		// 	dmgTaken = this.calcDmg(fighters.victim.dmg, fighters.attacker.def);
		// 	if (fighters.attacker.health-dmgTaken < 0) {
		// 		fighters.attacker.health = 0;
		// 	} else {
		// 		fighters.attacker.health -= dmgTaken;
		// 	}
		// 	$('#charCurrentHP').css("height", fighters.attacker.health/fighters.attacker.maxHealth*100+"%");
		// 	$('#charHPValue').text(fighters.attacker.health);
		//     Crafty.e('FloatingText').FloatingText(fighters.attacker.x+8, fighters.attacker.y-4, dmgTaken.toString(), '#562807', 25, {w:32, h:32}, "20px");
		// } else {
		// 	dmgTaken = this.calcDmg(fighters.attacker.dmg, fighters.victim.def);
		// 	fighters.victim.health -= dmgTaken;
		//     Crafty.e('FloatingText').FloatingText(fighters.victim.x+8, fighters.victim.y-4, dmgTaken.toString(), '#562807', 25, {w:32, h:32}, "20px");
		// }


  //       if (dmgTaken <= 0) {
		//     if (game.SETTINGS.isSFXOn) { Crafty.audio.play('nohit'); }
  //       } else {
		// 	if (revengeAttack) {
		// 		if (fighters.attacker.health <= 0) {
		// 			var hitSound = 'death';
		// 			game.PLAYER.destroy();
		// 			setTimeout(function () {
		// 				Crafty.scene('GameOver');
		// 			}, 2000);
		// 		} else {
		// 	        var hitSound = (Math.random() > 0.66) ? 'pain1' : (Math.random() > 0.66) ? 'pain2' : 'pain5';
		// 		}
		// 	} else {
		//         var hitSound = (Math.random() > 0.66) ? 'swing1' : (Math.random() > 0.66) ? 'swing2' : 'swing3';
		// 	}
		// 	if (game.SETTINGS.isSFXOn) { Crafty.audio.play(hitSound); }
  //       }
	 //    // Crafty.e('SlashEffect').showSlash(fighters.victim.x,fighters.victim.y);

		// if (!revengeAttack) {
		// 	if (fighters.victim.health <= 0) {
		// 		console.log('monster destroyed');
		// 		fighters.victim.destroy();
		// 		game.GRID[fighters.victim.grid_x][fighters.victim.grid_y] = undefined;
		// 		if (Math.random() < 0.08) {
		// 			// yay loot!
		// 			var loot_type = (Math.random() < 0.8) ? 'loot_sword_1' : 'loot_armor_1';
		// 			game.GRID[fighters.victim.grid_x][fighters.victim.grid_y] = Crafty.e(loot_type).at(fighters.victim.grid_x,fighters.victim.grid_y);
		// 		}
		// 		this.giveXP(fighters.attacker, fighters.victim.XP);
		// 	    if (game.SETTINGS.isSFXOn) { Crafty.audio.play('destruction'); }
		// 	} else {
		// 		// var thisMob = this;
		// 	 //  	setTimeout(function() {
		// 		// 	console.log('revenge Attack! '+fighters.victim.health);
		// 		// 	thisMob.meleeAttack(fighters, true);
		// 	 //  	}, 80); 
		// 	}

		// };

	// },

	calcDmg: function (dmg, def) {
		var afterHit = dmg-def;
		if (afterHit <= 0) {
			return 0;
		} else {
			return afterHit;
		}
	},

	giveXP: function (whom, amt) {
		whom.curr_xp += amt;
		// console.log((whom.curr_xp-game.CHARLEVELS[whom.level-1].xp_sum)+"asdA");
		$('#charCurrentXP').css("height", ((whom.curr_xp-game.CHARLEVELS[whom.level-1].xp_treshold)/(game.CHARLEVELS[whom.level].xp_treshold-game.CHARLEVELS[whom.level-1].xp_treshold))*100+"%");
		// on level up
		// TODO: on character creation, give the character the values from CHARLEVELS
		if (whom.curr_xp >= game.CHARLEVELS[whom.level].xp_treshold ) {
			whom.level += 1;
			whom.maxHealth = game.CHARLEVELS[whom.level].max_health;
			whom.maxMana = game.CHARLEVELS[whom.level].max_mana;
			whom.health = whom.maxHealth;
			$('#charCurrentHP').css("height", "100%");
			$('#charLevel').text(whom.level);
			$('#charHPValue').text(whom.maxHealth);
			$('#charCurrentXP').css("height", "0%");
			console.log("level up");
			if (game.SETTINGS.isSFXOn) { Crafty.audio.play('levelup',1,game.SETTINGS.volume/10); }
		};
	},

	moveMob: function(movement) {
		// console.log("moving mob "+this);
		var animation_speed = 1;
		mob = this;

		game.GRID[this.grid_x][this.grid_y] = undefined;
		mob.grid_x += movement.x;
		mob.grid_y += movement.y;
		game.GRID[this.grid_x][this.grid_y] = mob;
		// This animates the movement from one single tile to another, this needs improvement TODO
		// if (movement.x > 0 && this.isPlayer ) {
		//     // this.animate('PlayerLookRight', animation_speed, -1);
	 //        mob.animate('PlayerMovingRight', animation_speed, 1);

		// 	mob.attr({ x: (mob.grid_x-1) * game.TILE_WIDTH+(0.25*game.TILE_WIDTH) , y: mob.grid_y * game.TILE_HEIGHT });
		// 	setTimeout(function() {
		// 		setTimeout(function() {
		// 			setTimeout(function() {
		// 				mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: mob.grid_y * game.TILE_HEIGHT });
		// 		  	}, 40); 
		// 			mob.attr({ x: (mob.grid_x-1) * game.TILE_WIDTH+(0.75*game.TILE_WIDTH) , y: mob.grid_y * game.TILE_HEIGHT });
		// 	  	}, 40); 
		// 	mob.attr({ x: (mob.grid_x-1) * game.TILE_WIDTH+(0.5*game.TILE_WIDTH) , y: mob.grid_y * game.TILE_HEIGHT });
		//   	}, 40); 
		// } else if (movement.x < 0 && this.isPlayer) {
	 //        mob.animate('PlayerMovingLeft', animation_speed, 1);
		// 	mob.attr({ x: (mob.grid_x+1) * game.TILE_WIDTH-(0.25*game.TILE_WIDTH) , y: mob.grid_y * game.TILE_HEIGHT });
		// 	setTimeout(function() {
		// 		setTimeout(function() {
		// 			setTimeout(function() {
		// 				mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: mob.grid_y * game.TILE_HEIGHT });
		// 		  	}, 40); 
		// 			mob.attr({ x: (mob.grid_x+1) * game.TILE_WIDTH-(0.75*game.TILE_WIDTH) , y: mob.grid_y * game.TILE_HEIGHT });
		// 	  	}, 40); 
		// 	mob.attr({ x: (mob.grid_x+1) * game.TILE_WIDTH-(0.5*game.TILE_WIDTH) , y: mob.grid_y * game.TILE_HEIGHT });
		//   	}, 40); 

		// } else if (movement.y > 0 && this.isPlayer) {
	 //        mob.animate('PlayerMovingDown', animation_speed, 1);
		// 	mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: (mob.grid_y-1) * game.TILE_HEIGHT+(0.25*game.TILE_HEIGHT) });
		// 	setTimeout(function() {
		// 		setTimeout(function() {
		// 			setTimeout(function() {
		// 				mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: mob.grid_y * game.TILE_HEIGHT });
		// 		  	}, 40); 
		// 			mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: (mob.grid_y-1) * game.TILE_HEIGHT+(0.75*game.TILE_HEIGHT) });
		// 	  	}, 40); 
		// 	mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: (mob.grid_y-1) * game.TILE_HEIGHT+(0.5*game.TILE_HEIGHT) });
		//   	}, 40); 
		// } else if (movement.y < 0 && this.isPlayer) {
	 //        mob.animate('PlayerMovingUp', animation_speed, 1);
		// 	mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: (mob.grid_y+1) * game.TILE_HEIGHT-(0.25*game.TILE_HEIGHT) });
		// 	setTimeout(function() {
		// 		setTimeout(function() {
		// 			setTimeout(function() {
		// 				mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: mob.grid_y * game.TILE_HEIGHT });
		// 		  	}, 40); 
		// 			mob.attr({ x: mob.grid_x * game.TILE_WIDTH , y: (mob.grid_y+1) * game.TILE_HEIGHT-(0.75*game.TILE_HEIGHT) });
		// 	  	}, 40); 
		// 	mob.attr({ x: mob.grid_x * game.TILE_WIDTH , y: (mob.grid_y+1) * game.TILE_HEIGHT-(0.5*game.TILE_HEIGHT) });
		//   	}, 40); 
		// } else {
		// 	console.log("moving mob");
		// 	mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: mob.grid_y * game.TILE_HEIGHT });
		// }
			mob.attr({ x: mob.grid_x * game.TILE_WIDTH, y: mob.grid_y * game.TILE_HEIGHT });
	},

});

Crafty.c('Creature', {
  init: function() {
	this.requires('Mob')
  },
});

// This is the player-controlled character
Crafty.c('PlayerCharacter', {
	curr_xp: 0,

	keypressedTimeout: false, // this is used for my own KeyPressed Event
	moving: false, // whether the player is currently moving or not
	lastKeyEvt: undefined, // this is to remember the last pressed key

  init: function() {
    this.requires('Actor, Solid, Keyboard, Collision, Mob, spr_player, SpriteAnimation')
      // .fourway(2)
		.bind('KeyDown', function(evt) {

			// TODO: use isDown for movement
			// console.log(this.isDown('SPACE'));
			// console.log(evt);
			if (this.lastKeyEvt != evt) {
				Crafty.trigger('NewDirection', evt);
				this.lastKeyEvt = evt;
				clearTimeout(this.keypressedTimeout);
				// Crafty.trigger('KeyDown', evt);
			}
	  		Crafty.trigger('KeyPressed', evt);
			if (evt.key == Crafty.keys["A"] || evt.key == Crafty.keys["S"] || evt.key == Crafty.keys["D"] || evt.key == Crafty.keys["W"] ||
				evt.key == Crafty.keys["Q"] || evt.key == Crafty.keys["E"] || evt.key == Crafty.keys["Y"] || evt.key == Crafty.keys["C"]) {
	 		  	this.keypressedTimeout = setTimeout(function() {
			  		Crafty.trigger('KeyDown', evt);
					// this.performMove(movement);
			  	}, 20); 
			};
		})
		.bind('KeyUp', function(evt) {
			if (typeof this.lastKeyEvt != 'undefined' && this.lastKeyEvt.key == evt.key)
			{
				clearTimeout(this.keypressedTimeout);
			}
		})
		.bind('KeyPressed', function(evt) {
			if (!this.moving && !game.MENU.isDrawn) {
				this.checkForMovement(evt, this);
			}
		})

		.onHit('Village', this.visitVillage)

		// These next lines define our four animations
		//  each call to .animate specifies:
		//  - the name of the animation
		//  - the x and y coordinates within the sprite
		//     map at which the animation set begins
		//  - the number of animation frames *in addition to* the first one

		.animate('PlayerMovingUp',    0, 0, 2)
		.animate('PlayerMovingRight', 0, 1, 2)
		.animate('PlayerMovingDown',  0, 2, 2)
		.animate('PlayerMovingLeft',  0, 3, 2)
		.animate('PlayerLookUp',    0, 0, 0)
		.animate('PlayerLookRight', 0, 1, 0)
		.animate('PlayerLookDown',  0, 2, 0)
		.animate('PlayerLookLeft',  0, 3, 0);
		this.isPlayer = true;
 
		var animation_speed = 4;
		this.bind('NewDirection', function (evt) {
			if (!game.MENU.isDrawn) {
				if (evt.key == Crafty.keys["A"]) {
			        this.animate('PlayerLookLeft', animation_speed, -1);
				} else if (evt.key == Crafty.keys["D"]) {
			        this.animate('PlayerLookRight', animation_speed, -1);

				} else if (evt.key == Crafty.keys["W"] || evt.key == Crafty.keys["Q"] || evt.key == Crafty.keys["E"]) {
			        this.animate('PlayerLookUp', animation_speed, -1);

				} else if (evt.key == Crafty.keys["S"] || evt.key == Crafty.keys["Y"] || evt.key == Crafty.keys["C"]) {
			        this.animate('PlayerLookDown', animation_speed, -1);
				}
			} 
		})
  },

	checkForMovement: function(evt, player) {
		var movement = {x:0, y:0};
		var moveKeyPressed = false;

		if (evt.key == Crafty.keys["A"]) {
			// this.x -= game.TILE_WIDTH;
			movement.x = -1;
			moveKeyPressed = true;
		}
		else if (evt.key == Crafty.keys["D"]) {
			movement.x = 1;
			moveKeyPressed = true;
		}
		else if (evt.key == Crafty.keys["W"]) {
			movement.y = -1;
			moveKeyPressed = true;
		}
		else if (evt.key == Crafty.keys["S"]) {
			movement.y = 1;
			moveKeyPressed = true;
		}

		// diagonal movement
		if (evt.key == Crafty.keys["Q"]) {
			// this.x -= game.TILE_WIDTH;
			movement.x = -1;
			movement.y = -1;
			moveKeyPressed = true;
		}
		else if (evt.key == Crafty.keys["E"]) {
			movement.x = 1;
			movement.y = -1;
			moveKeyPressed = true;
		}
		else if (evt.key == Crafty.keys["Y"]) {
			movement.x = -1;
			movement.y = +1;
			moveKeyPressed = true;
		}
		else if (evt.key == Crafty.keys["C"]) {
			movement.x = 1;
			movement.y = 1;
			moveKeyPressed = true;
		}

		if (moveKeyPressed) {

			this.performMove(movement);

			player.moving = true;
		  	setTimeout(function() {
					player.moving = false;
		  	}, 120); 
		};
	},
 
  // Registers a stop-movement function to be called when
  //  this entity hits an entity with the "Solid" component
  // stopOnSolids: function() {
  //   this.onHit('Solid', this.stopMovement);
 
  //   return this;
  // },

	performMove: function(movement) {
		var regeneration = 0.5;
		if (game.ITEMS.RingOfRegeneration) { regeneration += 1 };
		if (typeof game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] == 'undefined' || // move to a place, if its either empty or no solid
			game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.Solid != true) { 
			if (typeof game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] != 'undefined') {
				if (game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.loot_sword_1 == true) {
					game.PLAYER.dmg += 1;
					$('#charDmg').text(game.PLAYER.dmg);
					game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].destroy();
					game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] = undefined;
				    if (game.SETTINGS.isSFXOn) { Crafty.audio.play('loot_sword',1,game.SETTINGS.volume/10); }
				} else if (game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.loot_armor_1 == true) {
					game.PLAYER.def += 1;
					$('#charDef').text(game.PLAYER.def);
					game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].destroy();
					game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] = undefined;
				    if (game.SETTINGS.isSFXOn) { Crafty.audio.play('loot_armor',1,game.SETTINGS.volume/10); }
				} else if (game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.RingOfRegeneration == true) {
					console.log('found ring of regeneration');
					$('#charItemsRingOfReg').show();
					game.ITEMS.RingOfRegeneration = true;
					game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].destroy();
					game.GRID[this.grid_x+movement.x][this.grid_y+movement.y] = undefined;
				}
			}
			this.moveMob(movement);
		} else if (game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.Creature == true ) {
			regeneration = 0;
			this.meleeAttack({attacker: this, victim: game.GRID[this.grid_x+movement.x][this.grid_y+movement.y]});
			// Crafty.trigger('meleeAttack', {attacker: this, victim: game.GRID[this.grid_x+movement.x][this.grid_y+movement.y]});
		} 
		if (game.PLAYER.health < game.PLAYER.maxHealth) {
			game.PLAYER.health += regeneration;
			if (game.PLAYER.health > game.PLAYER.maxHealth) { game.PLAYER.health = game.PLAYER.maxHealth; }
			$('#charCurrentHP').css("height", game.PLAYER.health/game.PLAYER.maxHealth*100+"%");
			$('#charHPValue').text(game.PLAYER.health);
		}
		Crafty.trigger('inAggroRange', { player_x: this.grid_x, player_y: this.grid_y});
		// else if (game.GRID[this.grid_x+movement.x][this.grid_y+movement.y].__c.loot_sword_1 == true)
			// {
			// }
		// this.lookForExit();
	},

  // Respond to this player visiting a village
  visitVillage: function(data) {
    villlage = data[0].obj;
    villlage.visit();
  }
});
 
// A village is a tile on the grid that the PC must visit in order to win the game
Crafty.c('Village', {
  init: function() {
    this.requires('Actor, spr_village');
  },
 
  // Process a visitation with this village
  visit: function() {
    this.destroy();
    if (game.SETTINGS.isSFXOn) { Crafty.audio.play('destruction',1,game.SETTINGS.volume/10); }
    Crafty.trigger('VillageVisited', this);
  }
});
