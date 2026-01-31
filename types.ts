export enum GameType {
  PHYSICAL = 'Physique',
  SLASH = 'Tranchant',
  HAKI = 'Haki',
  FIRE = 'Feu',
  WATER = 'Eau',
  ICE = 'Glace',
  LIGHTNING = 'Foudre',
  MAGMA = 'Magma',
  LIGHT = 'Lumière',
  DARKNESS = 'Ténèbres',
  SAND = 'Sable',
  POISON = 'Poison',
  RUBBER = 'Caoutchouc',
  TREMOR = 'Séisme',
  GRAVITY = 'Gravité',
  SOUL = 'Âme',
  FLORA = 'Flore',
  MAGNET = 'Magnétique',
  STRING = 'Fil',
  OP = 'Op-Op',
  MYTHICAL = 'Mythique',
  SPECIAL = 'Spécial'
}

export type CharacterRank = 'YONKO' | 'ADMIRAL' | 'WARLORD' | 'COMMANDER' | 'ROOKIE' | 'LEGEND';
export type MoveCategory = 'Physical' | 'Special' | 'Status';

// --- NEW EFFECT SYSTEM ---
export type EffectType = 'DAMAGE' | 'HEAL' | 'BUFF' | 'DEBUFF' | 'STATUS';
export type StatusType = 'PARALYSIS' | 'BURN' | 'POISON' | 'FREEZE' | 'SLEEP' | 'CONFUSION';
export type Stat = 'atk' | 'def' | 'spd' | 'accuracy' | 'evasion';

export interface MoveEffect {
  type: EffectType;
  target: 'SELF' | 'ENEMY';
  stat?: Stat;       // For Buff/Debuff
  amount?: number;   // Ex: 0.2 for 20%
  status?: StatusType; // For Status
  chance: number;    // 0.0 to 1.0
  duration?: number;  // Turns
}

export interface Move {
  name: string;
  type: GameType;
  power: number;
  accuracy: number; // 0-100
  category: MoveCategory;
  tpCost: 0 | 1 | 2 | 3; // 0=Basic (Gain 1), 1=Strong, 2=Elite, 3=Ultimate
  effects?: MoveEffect[];
  description?: string;
}

export interface CharacterStats {
  hp: number;
  maxHp: number; // Added for game logic
  attack: number;
  defense: number;
  speed: number;
}

export interface Character {
  id: number;
  name: string;
  rank: CharacterRank;
  types: GameType[];
  stats: CharacterStats;
  moves: Move[];
  spriteUrl: string;
  isDevilFruitUser: boolean;
  maxTp: number; // Always 3 usually
}

export interface Item {
  id: string;
  name: string;
  effectType: EffectType;
  amount: number; // Value of heal or duration of buff
  description: string;
}