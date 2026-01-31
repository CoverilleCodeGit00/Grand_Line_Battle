import { Character, GameType, Item, Move, MoveEffect } from '../../types';

// ==========================================
// 1. HELPER FOR MOVES
// ==========================================
// Helper to create rich moves easily
const m = (
  name: string, 
  type: GameType, 
  power: number, 
  accuracy: number, 
  tpCost: 0 | 1 | 2 | 3,
  category: 'Physical' | 'Special' | 'Status',
  effects: MoveEffect[] = []
): Move => ({ 
  name, type, power, accuracy, tpCost, category, effects 
});

// Common Effects
const BURN_EFFECT: MoveEffect = { type: 'STATUS', status: 'BURN', target: 'ENEMY', chance: 0.4, duration: 3 };
const FREEZE_EFFECT: MoveEffect = { type: 'STATUS', status: 'FREEZE', target: 'ENEMY', chance: 0.3, duration: 1 };
const POISON_EFFECT: MoveEffect = { type: 'STATUS', status: 'POISON', target: 'ENEMY', chance: 0.5, duration: 4 };
const PARA_EFFECT: MoveEffect = { type: 'STATUS', status: 'PARALYSIS', target: 'ENEMY', chance: 0.3, duration: 2 };
const SLEEP_EFFECT: MoveEffect = { type: 'STATUS', status: 'SLEEP', target: 'ENEMY', chance: 0.6, duration: 2 };
const CONFUSE_EFFECT: MoveEffect = { type: 'STATUS', status: 'CONFUSION', target: 'ENEMY', chance: 0.5, duration: 3 };

const HEAL_SELF: MoveEffect = { type: 'HEAL', target: 'SELF', amount: 0.3, chance: 1 }; // Heal 30%
const BUFF_ATK: MoveEffect = { type: 'BUFF', target: 'SELF', stat: 'atk', amount: 0.3, chance: 1, duration: 3 };
const BUFF_SPD: MoveEffect = { type: 'BUFF', target: 'SELF', stat: 'spd', amount: 0.4, chance: 1, duration: 3 };
const BUFF_DEF: MoveEffect = { type: 'BUFF', target: 'SELF', stat: 'def', amount: 0.3, chance: 1, duration: 3 };
const BUFF_EVA: MoveEffect = { type: 'BUFF', target: 'SELF', stat: 'evasion', amount: 0.3, chance: 1, duration: 3 };

const DEBUFF_ATK: MoveEffect = { type: 'DEBUFF', target: 'ENEMY', stat: 'atk', amount: 0.3, chance: 0.9, duration: 3 };
const DEBUFF_DEF: MoveEffect = { type: 'DEBUFF', target: 'ENEMY', stat: 'def', amount: 0.3, chance: 0.9, duration: 3 };
const DEBUFF_SPD: MoveEffect = { type: 'DEBUFF', target: 'ENEMY', stat: 'spd', amount: 0.3, chance: 0.9, duration: 3 };
const DEBUFF_ACC: MoveEffect = { type: 'DEBUFF', target: 'ENEMY', stat: 'accuracy', amount: 0.3, chance: 0.9, duration: 3 };

// ==========================================
// 2. ITEMS
// ==========================================
export const ITEMS: Item[] = [
  { id: 'item_01', name: 'Viande', effectType: 'HEAL', amount: 300, description: 'Un morceau de viande sur l\'os. Restaure 300 PV.' },
  { id: 'item_02', name: 'Cola', effectType: 'HEAL', amount: 500, description: 'SUPER ! Restaure 500 PV et donne la pêche.' },
  { id: 'item_03', name: 'Bento Sanji', effectType: 'HEAL', amount: 1000, description: 'Un plat complet préparé par Sanji. Soin complet.' },
  { id: 'item_04', name: 'Saké de Binks', effectType: 'BUFF', amount: 3, description: 'Soigne les statuts et boost l\'attaque.' },
];

// ==========================================
// 3. TYPE EFFECTIVENESS MATRIX
// ==========================================
export const getEffectiveness = (moveType: GameType, defender: Character): number => {
  let multiplier = 1.0;

  // --- HARDCODED LORE RULES ---
  if (moveType === GameType.LIGHTNING && defender.types.includes(GameType.RUBBER)) return 0;
  if (moveType === GameType.MAGMA && defender.types.includes(GameType.FIRE)) multiplier *= 2.0;
  if (moveType === GameType.WATER && defender.isDevilFruitUser) multiplier *= 2.0;

  // Haki hits Logia neutrally or effectively
  const logiaTypes = [GameType.FIRE, GameType.ICE, GameType.LIGHTNING, GameType.MAGMA, GameType.LIGHT, GameType.DARKNESS, GameType.SAND, GameType.POISON];
  if (moveType === GameType.HAKI && defender.types.some(t => logiaTypes.includes(t))) {
    return Math.max(multiplier, 1.5); 
  }

  // --- STANDARD CHART (Simplified) ---
  switch (moveType) {
    case GameType.FIRE:
      if (defender.types.includes(GameType.ICE) || defender.types.includes(GameType.FLORA)) multiplier *= 2.0;
      if (defender.types.includes(GameType.WATER) || defender.types.includes(GameType.MAGMA)) multiplier *= 0.5;
      break;
    case GameType.ICE:
      if (defender.types.includes(GameType.FLORA)) multiplier *= 2.0;
      if (defender.types.includes(GameType.FIRE) || defender.types.includes(GameType.MAGMA)) multiplier *= 0.5;
      break;
    case GameType.WATER:
      if (defender.types.includes(GameType.FIRE) || defender.types.includes(GameType.SAND)) multiplier *= 2.0;
      if (defender.types.includes(GameType.ICE)) multiplier *= 0.5;
      break;
    case GameType.LIGHTNING:
      if (defender.types.includes(GameType.WATER)) multiplier *= 2.0;
      break;
    case GameType.MAGMA:
      if (defender.types.includes(GameType.ICE) || defender.types.includes(GameType.FIRE)) multiplier *= 2.0;
      break;
    case GameType.SAND:
        if (defender.types.includes(GameType.LIGHTNING)) return 0; // Ground vs Electric logic
        if (defender.types.includes(GameType.FIRE)) multiplier *= 1.5;
        if (defender.types.includes(GameType.WATER)) multiplier *= 0.5; 
        break;
  }
  return multiplier;
};

// ==========================================
// 4. CHARACTERS DATABASE
// ==========================================
export const CHARACTERS: Character[] = [
  // --- STRAW HAT PIRATES ---
  {
    id: 1, name: "Monkey D. Luffy (G5)", rank: 'YONKO', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.RUBBER, GameType.MYTHICAL],
    stats: { hp: 1000, maxHp: 1000, attack: 160, defense: 140, speed: 130 },
    spriteUrl: "https://static.wikia.nocookie.net/onepiece/images/a/a9/Monkey_D._Luffy_Portrait.png",
    moves: [
      m("Gomu Gomu no Pistol", GameType.RUBBER, 60, 100, 0, "Physical"), // TP Generator
      m("Red Roc", GameType.FIRE, 120, 90, 2, "Physical", [BURN_EFFECT]),
      m("Drums of Liberation", GameType.MYTHICAL, 0, 100, 1, "Status", [BUFF_ATK, BUFF_SPD]),
      m("Bajrang Gun", GameType.HAKI, 150, 85, 3, "Physical", [PARA_EFFECT]),
      m("Conqueror's Haki", GameType.HAKI, 0, 100, 1, "Special", [DEBUFF_ATK, DEBUFF_SPD]),
      m("Gatling Gun", GameType.RUBBER, 90, 95, 1, "Physical"),
    ]
  },
  {
    id: 2, name: "Roronoa Zoro", rank: 'COMMANDER', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.SLASH, GameType.HAKI],
    stats: { hp: 850, maxHp: 850, attack: 170, defense: 120, speed: 110 },
    spriteUrl: "https://static.wikia.nocookie.net/op-bounty-rush/images/e/e4/Roronoa_Zoro_Body.png",
    moves: [
      m("Oni Giri", GameType.SLASH, 70, 100, 0, "Physical"),
      m("King of Hell", GameType.HAKI, 110, 90, 2, "Physical", [BUFF_ATK]),
      m("Asura: Dead Man's Game", GameType.MYTHICAL, 140, 85, 3, "Physical"),
      m("Shishi Sonson", GameType.SLASH, 90, 95, 1, "Physical"),
      m("Bandana Up", GameType.HAKI, 0, 100, 0, "Status", [BUFF_ATK]),
      m("Purgatory Onigiri", GameType.SLASH, 100, 90, 1, "Physical"),
    ]
  },
  {
    id: 3, name: "Vinsmoke Sanji", rank: 'COMMANDER', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.PHYSICAL, GameType.FIRE],
    stats: { hp: 820, maxHp: 820, attack: 155, defense: 130, speed: 150 },
    spriteUrl: "https://static.wikia.nocookie.net/op-bounty-rush/images/1/18/Sangoro_Body.png",
    moves: [
      m("Mouton Shot", GameType.PHYSICAL, 70, 100, 0, "Physical"),
      m("Ifrit Jambe", GameType.FIRE, 120, 90, 3, "Physical", [BURN_EFFECT]),
      m("Sky Walk", GameType.PHYSICAL, 0, 100, 1, "Status", [BUFF_EVA, BUFF_ATK]),
      m("Hell Memories", GameType.FIRE, 100, 85, 2, "Physical", [BURN_EFFECT]),
      m("Diable Jambe", GameType.FIRE, 80, 100, 1, "Physical"),
      m("Sanji's Cooking", GameType.SPECIAL, 0, 100, 1, "Status", [HEAL_SELF]),
    ]
  },
  {
    id: 4, name: "Jinbe", rank: 'WARLORD', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.WATER, GameType.HAKI],
    stats: { hp: 880, maxHp: 880, attack: 140, defense: 160, speed: 80 },
    spriteUrl: "https://placehold.co/400x400/000088/FFFFFF?text=Jinbe",
    moves: [
      m("Karakusa Gawara", GameType.PHYSICAL, 60, 100, 0, "Physical"),
      m("Vagabond Drill", GameType.WATER, 100, 90, 2, "Physical"),
      m("Ocean Current", GameType.WATER, 0, 100, 1, "Status", [DEBUFF_SPD]),
      m("Demon Brick Fist", GameType.HAKI, 130, 85, 3, "Physical"),
      m("Water Heart", GameType.WATER, 0, 100, 1, "Status", [BUFF_DEF]),
      m("Spear Wave", GameType.WATER, 90, 100, 1, "Special"),
    ]
  },
  {
    id: 5, name: "Nami", rank: 'ROOKIE', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.LIGHTNING, GameType.SPECIAL],
    stats: { hp: 550, maxHp: 550, attack: 130, defense: 80, speed: 110 },
    spriteUrl: "https://placehold.co/400x400/FFA500/FFFFFF?text=Nami",
    moves: [
      m("Thunderbolt Tempo", GameType.LIGHTNING, 80, 100, 1, "Special", [PARA_EFFECT]),
      m("Zeus Breeze Tempo", GameType.LIGHTNING, 140, 90, 3, "Special", [PARA_EFFECT]),
      m("Mirage Tempo", GameType.SPECIAL, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Rain Spark", GameType.WATER, 70, 100, 0, "Special", [DEBUFF_ACC]),
      m("Cyclone Tempo", GameType.SPECIAL, 90, 95, 1, "Special"),
      m("Happiness Punch", GameType.SPECIAL, 0, 100, 2, "Status", [CONFUSE_EFFECT]),
    ]
  },
  {
    id: 6, name: "Usopp (God)", rank: 'ROOKIE', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.FLORA, GameType.PHYSICAL],
    stats: { hp: 600, maxHp: 600, attack: 110, defense: 90, speed: 95 },
    spriteUrl: "https://placehold.co/400x400/664400/FFFFFF?text=Usopp",
    moves: [
      m("Pop Green: Devil", GameType.FLORA, 90, 90, 1, "Special"),
      m("Firebird Star", GameType.FIRE, 80, 95, 2, "Special", [BURN_EFFECT]),
      m("Impact Wolf", GameType.FLORA, 110, 90, 3, "Physical", [SLEEP_EFFECT]),
      m("Sleep Star", GameType.SPECIAL, 0, 80, 1, "Status", [SLEEP_EFFECT]),
      m("Oil Star", GameType.SPECIAL, 20, 100, 0, "Special", [DEBUFF_SPD]),
      m("Golden Pound", GameType.PHYSICAL, 0, 100, 2, "Status", [CONFUSE_EFFECT]),
    ]
  },

  // --- YONKO ---
  {
    id: 11, name: "Kaido", rank: 'YONKO', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.MYTHICAL, GameType.HAKI],
    stats: { hp: 1200, maxHp: 1200, attack: 180, defense: 180, speed: 100 },
    spriteUrl: "https://static.wikia.nocookie.net/onepiece/images/6/6b/Kaidou_Portrait.png",
    moves: [
      m("Raimei Hakke", GameType.HAKI, 100, 95, 1, "Physical"),
      m("Bolo Breath", GameType.FIRE, 120, 85, 2, "Special", [BURN_EFFECT]),
      m("Destroyer of Death", GameType.HAKI, 160, 80, 3, "Physical", [PARA_EFFECT]),
      m("Dragon Form", GameType.MYTHICAL, 0, 100, 1, "Status", [BUFF_DEF]),
      m("Drunken Mode", GameType.SPECIAL, 0, 100, 1, "Status", [BUFF_ATK, {type: 'STATUS', target: 'SELF', status: 'CONFUSION', chance: 0.3}]),
      m("Wind Scythe", GameType.SLASH, 70, 100, 0, "Special"),
    ]
  },
  {
    id: 12, name: "Big Mom", rank: 'YONKO', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.SOUL, GameType.HAKI],
    stats: { hp: 1150, maxHp: 1150, attack: 175, defense: 190, speed: 70 },
    spriteUrl: "https://static.wikia.nocookie.net/op-bounty-rush/images/c/c5/Charlotte_Linlin_Body.png",
    moves: [
      m("Napoleon Slash", GameType.SLASH, 90, 95, 0, "Physical"),
      m("Heavenly Fire", GameType.FIRE, 110, 90, 2, "Special", [BURN_EFFECT]),
      m("Maser Cannon", GameType.LIGHTNING, 160, 85, 3, "Special", [PARA_EFFECT]),
      m("Life or Slave", GameType.SOUL, 0, 100, 2, "Status", [HEAL_SELF]),
      m("Ikoku Sovereignty", GameType.SLASH, 130, 80, 2, "Special"),
      m("Prometheus & Zeus", GameType.SPECIAL, 100, 90, 1, "Special"),
    ]
  },
  {
    id: 13, name: "Shanks", rank: 'YONKO', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.HAKI, GameType.SLASH],
    stats: { hp: 950, maxHp: 950, attack: 190, defense: 110, speed: 140 },
    spriteUrl: "https://static.wikia.nocookie.net/onepiece/images/2/23/Shanks_Anime_Infobox.png",
    moves: [
      m("Gryphon Slash", GameType.SLASH, 80, 100, 0, "Physical"),
      m("Divine Departure", GameType.HAKI, 170, 95, 3, "Physical"),
      m("Conqueror's Pressure", GameType.HAKI, 0, 100, 2, "Status", [PARA_EFFECT]),
      m("Future Sight", GameType.HAKI, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Haki Lightning", GameType.HAKI, 110, 100, 2, "Special", [PARA_EFFECT]),
      m("Intimidation", GameType.HAKI, 0, 100, 1, "Status", [DEBUFF_ATK]),
    ]
  },
  {
    id: 14, name: "Blackbeard", rank: 'YONKO', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.DARKNESS, GameType.TREMOR],
    stats: { hp: 1100, maxHp: 1100, attack: 165, defense: 100, speed: 60 },
    spriteUrl: "https://placehold.co/400x400/111111/FFFFFF?text=Blackbeard",
    moves: [
      m("Black Hole", GameType.DARKNESS, 50, 100, 0, "Special", [DEBUFF_SPD]),
      m("Kurouzu (Vortex)", GameType.DARKNESS, 70, 95, 1, "Special", [DEBUFF_SPD]),
      m("Gura Gura Punch", GameType.TREMOR, 140, 85, 3, "Physical"),
      m("Seaquake", GameType.TREMOR, 120, 90, 2, "Special"),
      m("Liberation", GameType.DARKNESS, 90, 90, 1, "Special"),
      m("Dark Matter", GameType.DARKNESS, 0, 100, 2, "Status", [DEBUFF_DEF]),
    ]
  },

  // --- ADMIRALS ---
  {
    id: 17, name: "Akainu", rank: 'ADMIRAL', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.MAGMA, GameType.HAKI],
    stats: { hp: 950, maxHp: 950, attack: 185, defense: 150, speed: 80 },
    spriteUrl: "https://placehold.co/400x400/AA0000/FFFFFF?text=Akainu",
    moves: [
      m("Dai Funka", GameType.MAGMA, 100, 90, 1, "Special", [BURN_EFFECT]),
      m("Meigo", GameType.MAGMA, 150, 85, 3, "Physical", [BURN_EFFECT]),
      m("Meteor Volcano", GameType.MAGMA, 120, 80, 2, "Special", [BURN_EFFECT]),
      m("Magma Hound", GameType.MAGMA, 80, 95, 0, "Special"),
      m("Absolute Justice", GameType.HAKI, 0, 100, 1, "Status", [BUFF_ATK]),
      m("Inugami Guren", GameType.MAGMA, 110, 90, 1, "Special"),
    ]
  },
  {
    id: 18, name: "Aokiji", rank: 'ADMIRAL', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.ICE, GameType.HAKI],
    stats: { hp: 950, maxHp: 950, attack: 160, defense: 140, speed: 90 },
    spriteUrl: "https://placehold.co/400x400/00AAAA/FFFFFF?text=Aokiji",
    moves: [
      m("Ice Age", GameType.ICE, 140, 90, 3, "Special", [FREEZE_EFFECT]),
      m("Ice Saber", GameType.SLASH, 70, 100, 0, "Physical"),
      m("Ice Ball", GameType.ICE, 50, 95, 1, "Special", [FREEZE_EFFECT]),
      m("Pheasant Beak", GameType.ICE, 100, 90, 2, "Special"),
      m("Ice Time", GameType.ICE, 0, 100, 2, "Status", [FREEZE_EFFECT]),
      m("Partisan", GameType.ICE, 90, 95, 1, "Physical"),
    ]
  },
  {
    id: 19, name: "Kizaru", rank: 'ADMIRAL', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.LIGHT, GameType.HAKI],
    stats: { hp: 900, maxHp: 900, attack: 150, defense: 120, speed: 200 },
    spriteUrl: "https://static.wikia.nocookie.net/op-bounty-rush/images/f/f4/Borsalino_Body.png",
    moves: [
      m("Yasakani no Magatama", GameType.LIGHT, 120, 85, 3, "Special"),
      m("Light Kick", GameType.LIGHT, 90, 95, 1, "Physical"),
      m("Ama no Murakumo", GameType.SLASH, 80, 100, 0, "Physical"),
      m("Laser Beam", GameType.LIGHT, 110, 100, 2, "Special"),
      m("Yata no Kagami", GameType.LIGHT, 0, 100, 1, "Status", [BUFF_SPD]),
      m("Speed of Light", GameType.LIGHT, 0, 100, 1, "Status", [BUFF_EVA]),
    ]
  },
  {
    id: 21, name: "Greenbull", rank: 'ADMIRAL', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.FLORA, GameType.HAKI],
    stats: { hp: 920, maxHp: 920, attack: 140, defense: 160, speed: 85 },
    spriteUrl: "https://placehold.co/400x400/006600/FFFFFF?text=Greenbull",
    moves: [
      m("Forest of Hate", GameType.FLORA, 110, 95, 2, "Special"),
      m("Nutrient Absorption", GameType.FLORA, 80, 100, 1, "Physical", [HEAL_SELF]),
      m("Forbidden Hate", GameType.FLORA, 140, 90, 3, "Special", [POISON_EFFECT]),
      m("Vine Pierce", GameType.SLASH, 70, 100, 0, "Physical"),
      m("Fireproof Forest", GameType.FLORA, 0, 100, 1, "Status", [BUFF_DEF]),
      m("Photosynthesis", GameType.FLORA, 0, 100, 2, "Status", [HEAL_SELF]),
    ]
  },

  // --- WARLORDS & LEGENDS ---
  {
    id: 26, name: "Dracule Mihawk", rank: 'LEGEND', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.SLASH, GameType.HAKI],
    stats: { hp: 920, maxHp: 920, attack: 195, defense: 130, speed: 110 },
    spriteUrl: "https://placehold.co/400x400/440044/FFFFFF?text=Mihawk",
    moves: [
      m("Gentle Knife", GameType.SLASH, 40, 100, 0, "Physical"),
      m("World's Strongest Slash", GameType.SLASH, 180, 90, 3, "Special"),
      m("Black Blade Strike", GameType.HAKI, 120, 100, 2, "Physical"),
      m("Hawk Eye", GameType.HAKI, 0, 100, 1, "Status", [DEBUFF_DEF]),
      m("Horizon Splitter", GameType.SLASH, 140, 95, 2, "Special"),
      m("Night Cross", GameType.SLASH, 90, 100, 1, "Physical"),
    ]
  },
  {
    id: 30, name: "Trafalgar Law", rank: 'WARLORD', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.OP, GameType.SLASH],
    stats: { hp: 800, maxHp: 800, attack: 145, defense: 110, speed: 115 },
    spriteUrl: "https://placehold.co/400x400/FFFF00/000000?text=Law",
    moves: [
      m("Room: Shambles", GameType.OP, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Gamma Knife", GameType.OP, 110, 90, 2, "Special", [POISON_EFFECT]),
      m("Puncture Wille", GameType.OP, 150, 80, 3, "Special", [DEBUFF_DEF]),
      m("Injection Shot", GameType.SLASH, 80, 100, 1, "Physical"),
      m("Counter Shock", GameType.LIGHTNING, 90, 95, 1, "Special", [PARA_EFFECT]),
      m("Mes", GameType.OP, 50, 100, 0, "Special"),
    ]
  },
  {
    id: 40, name: "Marco", rank: 'COMMANDER', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.MYTHICAL, GameType.FIRE],
    stats: { hp: 880, maxHp: 880, attack: 135, defense: 150, speed: 120 },
    spriteUrl: "https://placehold.co/400x400/00FFFF/000000?text=Marco",
    moves: [
      m("Bluebird", GameType.FIRE, 90, 95, 1, "Special"),
      m("Phoenix Brand", GameType.FIRE, 100, 90, 2, "Special"),
      m("Flames of Regeneration", GameType.MYTHICAL, 0, 100, 2, "Status", [HEAL_SELF, {type: 'HEAL', target: 'SELF', amount: 0.5, chance: 1}]),
      m("Crane Talon", GameType.PHYSICAL, 70, 100, 0, "Physical"),
      m("Phoenix Mode", GameType.MYTHICAL, 0, 100, 1, "Status", [BUFF_DEF, BUFF_SPD]),
      m("Undying Flame", GameType.FIRE, 130, 100, 3, "Special", [HEAL_SELF]),
    ]
  },
  {
    id: 27, name: "Doflamingo", rank: 'WARLORD', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.STRING, GameType.HAKI],
    stats: { hp: 850, maxHp: 850, attack: 150, defense: 125, speed: 115 },
    spriteUrl: "https://placehold.co/400x400/FF69B4/000000?text=Doflamingo",
    moves: [
      m("Birdcage", GameType.STRING, 100, 100, 3, "Special", [PARA_EFFECT]),
      m("God Thread", GameType.HAKI, 130, 85, 2, "Physical"),
      m("Parasite", GameType.STRING, 0, 100, 1, "Status", [CONFUSE_EFFECT]),
      m("Overheat", GameType.STRING, 90, 95, 1, "Special", [BURN_EFFECT]),
      m("Black Knight", GameType.STRING, 70, 100, 0, "Physical"),
      m("Awakening", GameType.STRING, 0, 100, 2, "Status", [BUFF_ATK, BUFF_SPD]),
    ]
  },
  {
    id: 28, name: "Crocodile", rank: 'WARLORD', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.SAND, GameType.POISON],
    stats: { hp: 800, maxHp: 800, attack: 140, defense: 130, speed: 85 },
    spriteUrl: "https://placehold.co/400x400/C2B280/000000?text=Crocodile",
    moves: [
      m("Desert Spada", GameType.SAND, 100, 90, 1, "Special"),
      m("Ground Seco", GameType.SAND, 0, 100, 1, "Status", [DEBUFF_SPD]),
      m("Poison Hook", GameType.POISON, 80, 95, 1, "Physical", [POISON_EFFECT]),
      m("Sables", GameType.SAND, 70, 90, 0, "Special"),
      m("Desert La Spada", GameType.SAND, 120, 85, 2, "Special"),
      m("Barjon", GameType.SAND, 0, 100, 2, "Status", [BUFF_DEF]),
    ]
  },
  {
    id: 29, name: "Boa Hancock", rank: 'WARLORD', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.SPECIAL, GameType.HAKI],
    stats: { hp: 780, maxHp: 780, attack: 145, defense: 100, speed: 120 },
    spriteUrl: "https://placehold.co/400x400/FF00FF/FFFFFF?text=Hancock",
    moves: [
      m("Mero Mero Mellow", GameType.SPECIAL, 0, 100, 3, "Status", [FREEZE_EFFECT]),
      m("Perfume Femur", GameType.PHYSICAL, 90, 100, 1, "Physical", [FREEZE_EFFECT]),
      m("Slave Arrow", GameType.SPECIAL, 80, 100, 2, "Special", [FREEZE_EFFECT]),
      m("Pistol Kiss", GameType.SPECIAL, 50, 100, 0, "Special"),
      m("Empress Haki", GameType.HAKI, 0, 100, 1, "Status", [BUFF_ATK]),
      m("Fragrance Kick", GameType.HAKI, 110, 95, 2, "Physical"),
    ]
  },
  {
    id: 31, name: "Bartholomew Kuma", rank: 'WARLORD', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.SPECIAL, GameType.PHYSICAL],
    stats: { hp: 1000, maxHp: 1000, attack: 130, defense: 170, speed: 90 },
    spriteUrl: "https://placehold.co/400x400/555555/FFFFFF?text=Kuma",
    moves: [
      m("Ursus Shock", GameType.SPECIAL, 140, 80, 3, "Special"),
      m("Pad Ho", GameType.SPECIAL, 80, 100, 1, "Special"),
      m("Pain Transfer", GameType.SPECIAL, 0, 100, 2, "Status", [HEAL_SELF]),
      m("Teleport", GameType.SPECIAL, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Laser Beam", GameType.LIGHT, 100, 95, 2, "Special"),
      m("Slap", GameType.PHYSICAL, 40, 100, 0, "Physical", [CONFUSE_EFFECT]),
    ]
  },
  {
    id: 32, name: "Gecko Moria", rank: 'WARLORD', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.DARKNESS, GameType.SPECIAL],
    stats: { hp: 750, maxHp: 750, attack: 110, defense: 110, speed: 60 },
    spriteUrl: "https://placehold.co/400x400/660066/FFFFFF?text=Moria",
    moves: [
      m("Shadows Asgard", GameType.DARKNESS, 130, 80, 3, "Special", [BUFF_ATK]),
      m("Brick Bat", GameType.DARKNESS, 60, 100, 0, "Special"),
      m("Doppelman", GameType.DARKNESS, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Shadow Cut", GameType.SLASH, 90, 95, 1, "Physical"),
      m("Tsuno Tokage", GameType.DARKNESS, 110, 90, 2, "Special"),
      m("Lazy Command", GameType.SPECIAL, 0, 100, 1, "Status", [DEBUFF_SPD]),
    ]
  },
  {
    id: 34, name: "Eustass Kid", rank: 'ROOKIE', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.MAGNET, GameType.PHYSICAL],
    stats: { hp: 850, maxHp: 850, attack: 155, defense: 140, speed: 85 },
    spriteUrl: "https://placehold.co/400x400/990000/FFFFFF?text=Kid",
    moves: [
      m("Punk Gibson", GameType.MAGNET, 90, 95, 1, "Physical"),
      m("Damned Punk", GameType.MAGNET, 150, 80, 3, "Special"),
      m("Punk Vise", GameType.PHYSICAL, 80, 90, 1, "Physical"),
      m("Assign", GameType.MAGNET, 0, 100, 2, "Status", [PARA_EFFECT]),
      m("Punk Corna Dio", GameType.MAGNET, 130, 85, 2, "Physical"),
      m("Repel", GameType.MAGNET, 50, 100, 0, "Physical", [BUFF_DEF]),
    ]
  },
  {
    id: 48, name: "Enel", rank: 'ROOKIE', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.LIGHTNING, GameType.HAKI],
    stats: { hp: 700, maxHp: 700, attack: 160, defense: 80, speed: 130 },
    spriteUrl: "https://placehold.co/400x400/FFFFCC/000000?text=Enel",
    moves: [
      m("El Thor", GameType.LIGHTNING, 120, 85, 2, "Special", [PARA_EFFECT]),
      m("Raigo", GameType.LIGHTNING, 180, 70, 3, "Special"),
      m("Vari", GameType.LIGHTNING, 70, 100, 0, "Special"),
      m("Amaru (200M Volts)", GameType.LIGHTNING, 140, 80, 3, "Special", [BUFF_ATK]),
      m("Mantra", GameType.HAKI, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Gloam Paddling", GameType.LIGHTNING, 90, 90, 1, "Physical", [BURN_EFFECT]),
    ]
  },
  {
    id: 15, name: "Whitebeard", rank: 'LEGEND', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.TREMOR, GameType.HAKI],
    stats: { hp: 1100, maxHp: 1100, attack: 190, defense: 160, speed: 65 },
    spriteUrl: "https://placehold.co/400x400/EEEEEE/000000?text=Whitebeard",
    moves: [
      m("Island Shaker", GameType.TREMOR, 160, 80, 3, "Special"),
      m("Murakumogiri", GameType.SLASH, 110, 95, 1, "Physical"),
      m("Gekishin", GameType.TREMOR, 90, 100, 1, "Special"),
      m("Kabutowari", GameType.TREMOR, 130, 90, 2, "Physical"),
      m("Family Protector", GameType.HAKI, 0, 100, 1, "Status", [BUFF_DEF]),
      m("Atmospheric Crack", GameType.TREMOR, 70, 100, 0, "Special", [CONFUSE_EFFECT]),
    ]
  },
  {
    id: 16, name: "Gol D. Roger", rank: 'LEGEND', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.HAKI, GameType.SLASH],
    stats: { hp: 1050, maxHp: 1050, attack: 200, defense: 140, speed: 120 },
    spriteUrl: "https://placehold.co/400x400/D4AF37/000000?text=Roger",
    moves: [
      m("Divine Departure", GameType.HAKI, 170, 95, 3, "Physical"),
      m("Ace Slash", GameType.SLASH, 110, 100, 1, "Physical"),
      m("Conqueror's Haki", GameType.HAKI, 0, 100, 2, "Status", [PARA_EFFECT]),
      m("Laugh Tale", GameType.HAKI, 0, 100, 1, "Status", [BUFF_ATK, BUFF_SPD]),
      m("Grand Line Strike", GameType.HAKI, 130, 90, 2, "Physical"),
      m("Simple Slash", GameType.SLASH, 70, 100, 0, "Physical"),
    ]
  },
  {
    id: 41, name: "Katakuri", rank: 'COMMANDER', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.SPECIAL, GameType.HAKI],
    stats: { hp: 850, maxHp: 850, attack: 155, defense: 130, speed: 115 },
    spriteUrl: "https://placehold.co/400x400/AA3366/FFFFFF?text=Katakuri",
    moves: [
      m("Zangiri Mochi", GameType.HAKI, 140, 90, 3, "Physical"),
      m("Mochi Thrust", GameType.SPECIAL, 100, 95, 1, "Physical"),
      m("Raindrop Mochi", GameType.SPECIAL, 80, 100, 1, "Special"),
      m("Future Sight", GameType.HAKI, 0, 100, 1, "Status", [BUFF_EVA]),
      m("Power Mochi", GameType.HAKI, 90, 100, 1, "Physical"),
      m("Flowing Mochi", GameType.SPECIAL, 0, 100, 2, "Status", [CONFUSE_EFFECT]),
    ]
  },
  {
    id: 50, name: "Silvers Rayleigh", rank: 'LEGEND', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.HAKI, GameType.SLASH],
    stats: { hp: 900, maxHp: 900, attack: 165, defense: 130, speed: 125 },
    spriteUrl: "https://placehold.co/400x400/CCCCCC/000000?text=Rayleigh",
    moves: [
      m("Dark King Slash", GameType.SLASH, 100, 100, 1, "Physical"),
      m("Internal Destruction", GameType.HAKI, 130, 95, 2, "Physical", [DEBUFF_DEF]),
      m("Conqueror's Haki", GameType.HAKI, 0, 100, 1, "Status", [PARA_EFFECT]),
      m("Old Legend", GameType.HAKI, 0, 100, 1, "Status", [BUFF_ATK]),
      m("Intercept", GameType.SLASH, 70, 100, 0, "Physical"),
      m("Perfect Haki", GameType.HAKI, 160, 90, 3, "Physical"),
    ]
  },
  {
    id: 51, name: "Monkey D. Garp", rank: 'LEGEND', isDevilFruitUser: false, maxTp: 3,
    types: [GameType.HAKI, GameType.PHYSICAL],
    stats: { hp: 950, maxHp: 950, attack: 175, defense: 150, speed: 100 },
    spriteUrl: "https://placehold.co/400x400/550000/FFFFFF?text=Garp",
    moves: [
      m("Galaxy Impact", GameType.HAKI, 160, 85, 3, "Physical"),
      m("Fist of Love", GameType.PHYSICAL, 80, 100, 0, "Physical"),
      m("Cannonball Throw", GameType.PHYSICAL, 100, 95, 1, "Physical"),
      m("Hero's Haki", GameType.HAKI, 0, 100, 1, "Status", [BUFF_DEF]),
      m("Bone Crushing", GameType.HAKI, 120, 90, 2, "Physical"),
      m("Blue Hole", GameType.HAKI, 130, 90, 2, "Physical", [DEBUFF_DEF]),
    ]
  },
  {
    id: 52, name: "Portgas D. Ace", rank: 'COMMANDER', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.FIRE, GameType.PHYSICAL],
    stats: { hp: 800, maxHp: 800, attack: 150, defense: 110, speed: 115 },
    spriteUrl: "https://placehold.co/400x400/FF4500/FFFFFF?text=Ace",
    moves: [
      m("Hiken (Fire Fist)", GameType.FIRE, 100, 95, 1, "Special", [BURN_EFFECT]),
      m("Entei (Flame Emperor)", GameType.FIRE, 160, 80, 3, "Special", [BURN_EFFECT]),
      m("Cross Fire", GameType.FIRE, 80, 100, 0, "Special"),
      m("Flame Mirror", GameType.FIRE, 0, 100, 1, "Status", [BUFF_DEF]),
      m("St. Elmo's Fire", GameType.FIRE, 120, 90, 2, "Special"),
      m("Firefly Light", GameType.FIRE, 0, 100, 2, "Status", [CONFUSE_EFFECT]),
    ]
  },
  {
    id: 53, name: "Sabo", rank: 'COMMANDER', isDevilFruitUser: true, maxTp: 3,
    types: [GameType.FIRE, GameType.HAKI],
    stats: { hp: 820, maxHp: 820, attack: 155, defense: 130, speed: 115 },
    spriteUrl: "https://placehold.co/400x400/0000FF/FFFFFF?text=Sabo",
    moves: [
      m("Hiken", GameType.FIRE, 100, 95, 1, "Special", [BURN_EFFECT]),
      m("Dragon Claw", GameType.HAKI, 110, 100, 1, "Physical"),
      m("Dragon's Breath", GameType.HAKI, 140, 90, 2, "Physical", [DEBUFF_DEF]),
      m("Flame Dragon King", GameType.FIRE, 160, 85, 3, "Special"),
      m("Pipe Strike", GameType.PHYSICAL, 70, 100, 0, "Physical"),
      m("Revolutionary Will", GameType.HAKI, 0, 100, 1, "Status", [BUFF_ATK]),
    ]
  }
];