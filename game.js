const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
},
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player;
let cursors;
let blocks;
let infoText;
let isReacting = false;

function preload() {
  // Chargement des images, de l'animation du joueur et de l'audio
  this.load.image('walk1', 'assets/walk1.png');
  this.load.image('walk2', 'assets/walk2.png');
  this.load.image('walk3', 'assets/walk3.png');
  this.load.image('jump', 'assets/jumpup.png');
  this.load.image('jumpFall', 'assets/jumpfall.png');
  this.load.image('standing', 'assets/standing.png'); 
  this.load.image('block', 'assets/books.png');
  this.load.image('ground', 'assets/block.png');
  this.load.image('bg', 'assets/background1.jpg');
  this.load.image('hitReaction', 'assets/hitReaction.png');
  this.load.audio('hitsound', 'assets/hitsound.mp3');
  this.load.audio('bgm', 'assets/bgm.mp3');
  this.load.image('btnLeft', 'assets/btnLeft.png');
  this.load.image('btnRight', 'assets/btnRight.png');
  this.load.image('btnJump', 'assets/btnJump.png');
}

function create() {
  const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0);
  bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  const bgm = this.sound.add('bgm', {
    volume: 0.3,   // volume plus discret
    loop: true      // pour répéter en boucle
  });
  bgm.play();


  // Créer le joueur
  player = this.physics.add.sprite(100, 450, 'standing');
  player.setScale(0.3);
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Animation de marche
  this.anims.create({
    key: 'walk',
    frames: [
      { key: 'walk1' },
      { key: 'walk2' },
      { key: 'walk3' }
    ],
    frameRate: 4,
    repeat: -1
  });

  // Animation de saut (montée)
  this.anims.create({
    key: 'jump',
    frames: [
      { key: 'jump' }
    ],
    frameRate: 1,
    repeat: 0
  });

  // Animation de chute
  this.anims.create({
    key: 'jumpFall',
    frames: [
      { key: 'jumpFall' }
    ],
    frameRate: 1,
    repeat: 0
  });

  // Animation "debout" (immobile)
  this.anims.create({
    key: 'standing',
    frames: [
      { key: 'standing' }
    ],
    frameRate: 1,
    repeat: -1 // Répète cette animation indéfiniment quand le joueur est immobile
  });

  // Sol invisible
  const ground = this.physics.add.staticGroup();
  ground.create(400, 580, 'ground').setScale(50, 1).refreshBody(); // long sol invisible
  this.physics.add.collider(player, ground); // collision joueur-sol

  // Créer les blocs
  blocks = this.physics.add.staticGroup();

  const messages = [
    '📚 Diplômes et Formations :\n\n' +
    '🎓 RNCP 6 (Concepteur Développeur d’Applications)\n' +
    'Janv. 2022 – Nov. 2023\n' +
    'Alternance 3W Academy / Music Global, Carquefou, France\n\n' +
  
    '🎓 RNCP 5 (Développeur Web Junior)\n' +
    'Juin 2021 – Sept. 2021\n' +
    '3W Academy, Clermont, France\n\n' +
  
    '🎓 Licence Langues Étrangères Appliquées (Anglais, Espagnol)\n' +
    '2014 – 2017\n' +
    'UPJV Amiens, France\n\n' +
  
    '🎓 BTS Commerce International\n' +
    '2012 – 2014\n' +
    'Lycée Félix Faure, Beauvais, France\n\n' +
  
    '🎓 Baccalauréat Général Économique et Social\n' +
    '2009 – 2012\n' +
    'Lycée Cassini, Clermont, France',
  
    '💼 Expériences professionnelles :\n\n' +
  '👨‍💻 Développeur Web Fullstack & Webmaster\n' +
  'Janv. 2022 – Fév. 2025\n' +
  'Music Global, Carquefou, France\n' +
  '(Développement et maintenance de sites web B2B et B2C,\n' +
  'création d’un extranet)\n\n' +

  '📞 Assistant Commercial\n' +
  'Mars 2019 – Juin 2020\n' +
  'Dometic, Plailly, France\n' +
  '(Gestion des appels, enregistrement des commandes,\n' +
  'facturation, gestion des litiges)\n\n' +

  '💰 Caissier\n' +
  'Avr. 2017 – Déc. 2017\n' +
  'ETS Horticoles Georges Truffaut, Saint-Maximin, France\n\n' +

  '🚚 Stage en entreprise\n' +
  'Janv. 2014 – Fév. 2014\n' +
  'Gallus Alonso Enrique, Vigo, Espagne\n' +
  '(Société de transport international de marchandises)\n\n' +

  '💻 Stage en entreprise\n' +
  'Avr. 2013 – Juil. 2013\n' +
  'Isagri Valencia, Espagne\n' +
  '(Concepteur de logiciels pour le monde agricole\n' +
  'et les professions comptables)',
  
  '🌍 Loisirs et Voyages :\n\n' +
  '💡 Informatique\n' +
  '🎮 Jeux vidéo\n' +
  '🦎 Terrariophilie\n' +
  '🏋️‍♂️ Sport\n\n' +

  '✈️ Voyages :\n' +
  '🇳🇿 Nouvelle-Zélande — 1 mois (Tourisme)\n' +
  '🇮🇩 Indonésie – Bali — 1 semaine (Tourisme)\n' +
  '🇦🇺 Australie — 7 mois (Working Holiday Visa)\n' +
  '🇪🇸 Espagne – Valence — 4 mois (Stage)\n' +
  '🇪🇸 Espagne – Vigo — 2 mois (Stage)'
];

  [300, 400, 500].forEach((x, i) => {
    const block = blocks.create(x, 350, 'block');
    block.info = messages[i];
  });

  // Collisions
  this.physics.add.collider(player, blocks, showInfo, null, this);

  // Contrôles clavier
  cursors = this.input.keyboard.createCursorKeys();

  // Texte d'informations
  infoText = this.add.text(0, 60, '', {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: '15px',
    fill: '#00ff00',               // vert néon
    backgroundColor: '#000000cc',  // fond noir semi-transparent
    padding: { x: 12, y: 8 },
    stroke: '#008000',             // contour vert foncé
    strokeThickness: 2,
    shadow: {
      offsetX: 2,
      offsetY: 2,
      color: '#004d00',
      blur: 2,
      stroke: true,
      fill: true
    }
  }).setScrollFactor(0).setDepth(1).setVisible(false);  

  // === Bandeau façon infoText ===
const headerBg = this.add.rectangle(0, 0, this.cameras.main.width, 60, 0x000000)
.setOrigin(0, 0)
.setScrollFactor(0)
.setDepth(1)
.setAlpha(0.8); // fond noir un peu plus visible

const headerText = this.add.text(20, 15, 'Victor Noël — Développeur Web Fullstack', {
fontFamily: '"Courier New", Courier, monospace',
fontSize: '20px',
fill: '#00ff00',               // vert néon
backgroundColor: null,
padding: { x: 12, y: 8 },
stroke: '#008000',             // contour vert foncé
strokeThickness: 2,
shadow: {
  offsetX: 2,
  offsetY: 2,
  color: '#004d00',
  blur: 2,
  stroke: true,
  fill: true
}
})
.setScrollFactor(0)
.setDepth(2);

// === Boutons tactiles ===
this.leftButton = this.add.image(600, this.cameras.main.height - 80, 'btnLeft')
    .setScrollFactor(0)
    .setScale(0.1)
    .setInteractive()
    .setAlpha(0.8);

this.rightButton = this.add.image(700, this.cameras.main.height - 80, 'btnRight')
    .setScrollFactor(0)
    .setScale(0.1)
    .setInteractive()
    .setAlpha(0.8);

this.jumpButton = this.add.image(this.cameras.main.width - 150, this.cameras.main.height - 120, 'btnJump')
    .setScrollFactor(0)
    .setScale(0.1)
    .setInteractive()
    .setAlpha(0.8);

// États des boutons
this.leftPressed = false;
this.rightPressed = false;
this.jumpPressed = false;

// Événements tactiles
const press = (btn, prop) => {
    btn.on('pointerdown', () => this[prop] = true);
    btn.on('pointerup', () => this[prop] = false);
    btn.on('pointerout', () => this[prop] = false);
};

press(this.leftButton, 'leftPressed');
press(this.rightButton, 'rightPressed');
press(this.jumpButton, 'jumpPressed');


}

function update() {

    if (isReacting) {
      player.setVelocityX(0);
      return; // Ignore les contrôles pendant la réaction
    }

  // --- Contrôles tactiles ---
const moveLeft = this.leftPressed;
const moveRight = this.rightPressed;
const jump = this.jumpPressed;

  
// Déplacement à gauche
if (cursors.left.isDown || moveLeft) {
  player.setVelocityX(-160);
  player.setSize(player.width, 235);
  player.anims.play('walk', true);
  player.setFlipX(true);
}
// Déplacement à droite
else if (cursors.right.isDown || moveRight) {
  player.setVelocityX(160);
  player.setSize(player.width, 235);
  player.anims.play('walk', true);
  player.setFlipX(false);
}
// Immobile
else {
  player.setVelocityX(0);
  player.setSize(player.width, 210);
  if (player.body.touching.down) {
      player.anims.play('standing', true);
  }
}

// Saut
if ((cursors.up.isDown || jump) && player.body.touching.down) {
  player.setVelocityY(-400);
  player.anims.play('jump', true);
}


  // Si le joueur est en l'air, il doit passer à l'animation de chute
  if (player.body.velocity.y > 0 && !player.body.touching.down) {
    player.anims.play('jumpFall', true); // Lancer l'animation de chute
  }

  // Lorsque le joueur touche le sol, on arrête l'animation de saut ou de chute et on recommence l'animation de marche ou debout

    if (cursors.left.isDown || cursors.right.isDown) {
      player.anims.play('walk', true); // Animation de marche si on bouge
    }
  
}

let textInterval = null; // Variable globale pour stocker l'intervalle

function showInfoText(info) {
    infoText.setText('');          // vide le texte avant affichage
    infoText.setVisible(true);     // rendre le texte visible

    // Si un interval existe déjà, on le stoppe
    if (textInterval) {
        clearInterval(textInterval);
        textInterval = null;
    }

    let index = 0;

    textInterval = setInterval(() => {
        infoText.text += info[index];   // ajoute la lettre
        index++;

        if (index >= info.length) {
            clearInterval(textInterval); // stop l'animation quand toutes les lettres sont affichées
            textInterval = null;         // réinitialise la variable
        }
    }, 5);  // vitesse d'apparition : 5ms par lettre
}


function showInfo(player, block) {
  if (block.info && !isReacting) {
    isReacting = true;

   
    infoText.setAlpha(0); // invisible au départ
    infoText.setY(50);    // position légèrement au-dessus

    showInfoText(block.info);


    // Tween pour faire apparaître le texte (fade + slide)
    player.scene.tweens.add({
      targets: infoText,
      alpha: 1,        // fade-in
      y: 60,           // glissement vers la position finale
      duration: 300,   // en 0.3 secondes
      ease: 'Power1'
    });

    player.scene.sound.play('hitsound');
    player.setTexture('hitReaction');
    player.setSize(150, 235);

    setTimeout(() => {
      if (player.body.touching.down) {
        player.anims.play('standing', true);
      }
      isReacting = false;
    }, 1000);

    block.setTint(0x696969);
    player.scene.tweens.add({
      targets: block,
      y: block.y - 10,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    block.body.checkCollision.up = false;

    setTimeout(() => {
      infoText.setVisible(false);
      block.clearTint();
      block.body.checkCollision.up = true;
    }, 90000);
  }
}
