import { Vec2, Vec3, Vec4, Mat4, Quat } from 'wgpu-matrix';
// import { Occupant, PathPoint } from './Workers/PathPlannerTypes';
// import { ConditionType } from './Character/Actions/Conditions/Condition';
// import { Armor } from './Character/Equipment/Armor';
// import { Abilities } from './Character/Classes/Abilities';
import DrawableInterface from './Drawables/DrawableInterface';
import { PropertyInterface, StagePropertyInterface } from './shaders/ShaderBuilder/Types';
// import { Weapon } from './Character/Equipment/Types';
// import { feetToMeters } from './Math';

export const maxInstances = 16;

export type EpisodeInfo = {
  winningTeam: number,
}

export type ShotData = {
  velocityVector: Vec2,
  startPos: Vec3,
  position: Vec4,
  orientation: Vec4,
  distance: number,
  duration?: number,
};

export type ActionInfo = {
  action: string,
  description?: string,
  percentSuccess: number | null,
}

export type FocusInfo = {
  name: string,
  hitpoints: number,
  temporaryHitpoints: number,
  maxHitpoints: number,
  armorClass: number,
  conditions: { name: string, duration: number }[],
}

// export type Delay = {
//   startTime: number,
//   duration: number,
//   onFinish: ((timestamp: number) => void) | null,
// }

// export interface ParticipantsInterface {
//   participants: CreatureActorInterface[][];

//   turns: CreatureActorInterface[];

//   get activeActor(): CreatureActorInterface;
// }

// export type CollisionResult = {
//   actor: CreatureActorInterface,
//   point: Vec4,
// }

// export interface CollideesInterface {
//   detectCollision(p1 : Vec4, p2: Vec4, filter?: (actor: ActorInterface) => boolean): CollisionResult | null;
// }

export interface ContainerNodeInterface {
  addNode(node: SceneNodeInterface): void;

  removeNode(node: SceneNodeInterface): void;
}

export interface RenderPassInterface {
  addDrawable(drawable: DrawableNodeInterface): void;
}

export interface WorldInterface {
  // collidees: CollideesInterface;

  actors: ActorInterface[];

  // participants: ParticipantsInterface;

  scene: ContainerNodeInterface;

  animate: boolean;
  
  // endTurn2(actor: ActorInterface): void;

  removeActors: ActorInterface[];

  mainRenderPass: RenderPassInterface;

  loggerCallback: ((message: string) => void) | null;

  path2: DrawableInterface | null;

  path3: DrawableInterface | null;

  path4: DrawableInterface | null;

  // occupants: Occupant[];

  // focused: CreatureActorInterface | null;

  focusCallback: ((focusInfo: FocusInfo | null) => void) | null;

  actionInfoCallback: ((actionInfo: ActionInfo | null) => void) | null;
}

export type ActorOnFinishCallback = (timestamp: number) => void;

export interface ActorInterface {
  update(elapsedTime: number, timestamp: number, world: WorldInterface): Promise<boolean>;
}

// export interface CreatureInterface {
//   name: string;

//   abilityScores: AbilityScores;

//   charClass: CharacterClassInterface;

//   race: RaceInterface;

//   get armorClass(): number;

//   experiencePoints: number;

//   // weapons: Weapon[];

//   // armor: Armor[];

//   knownSpells: R<SpellInterface>[] | null;

//   hasInfluencingAction(name: string): boolean;

//   getInfluencingAction(name: string): ActionInterface | null

//   getAbilityModifier(weapon: Weapon): number;

//   getWeaponProficiency(weapon: Weapon): number;

//   addCondition(name: ConditionType): void;

//   hasCondition(name: ConditionType): boolean;

//   removeCondition(name: ConditionType): void;

//   getKnownSpells(): { spell: R<SpellInterface>, prepared: boolean }[];

//   getMaxPreparedSpells(): number;
// }

// export type Equipped = {
//   meleeWeapon: Weapon | null,
//   rangeWeapon: Weapon | null,
//   armor: Armor | null,
//   shield: Armor | null,
// }

// export type TimeType = 'Action' | 'Bonus' | 'Move';

// export interface ActionInterface {
//   actor: CreatureActorInterface;

//   name: string;

//   duration: number;

//   time: TimeType;

//   endOfTurn: boolean;

//   targets: CreatureActorInterface[];

//   initialize(): void;

//   clear(): void;

//   prepareInteraction(target: CreatureActorInterface | null, point: Vec4 | null, world: WorldInterface): Promise<void>;

//   interact(script: ScriptInterface, world: WorldInterface): Promise<boolean>;
// }

// export type A<T> = {
//   action: new (actor: CreatureActorInterface) => T;
//   name: string;
//   time: TimeType,
// }

// export enum Size {
//   Tiny = feetToMeters(2.5),
//   Small = feetToMeters(5),
//   Medium = feetToMeters(5),
//   Large = feetToMeters(10),
//   Huge = feetToMeters(15),
//   Gargantuan = feetToMeters(20),
// }

// export interface RaceInterface {
//   name: string;
  
//   speed: number;

//   abilityIncrease: AbilityScores;

//   hitPointBonus: number;
  
//   size: Size;

//   height: number;

//   generateName(): string;

//   clone(): RaceInterface;
// }

// export interface CharacterClassInterface {
//   name: string;

//   level: number;

//   primaryAbilities: Abilities[];

//   actions: A<ActionInterface>[];
// }

// export interface SpellInterface extends ActionInterface {

// }

// export type R<T> = {
//   spell: new (actor: CreatureActorInterface) => T;
//   name: string;
//   time: TimeType,
//   level: number,
// }

// export type PrimaryWeapon = 'Melee' | 'Range';
  
// export interface CharacterInterface extends CreatureInterface {
//   equipped: Equipped;

//   enduringActions: ActionInterface[];

//   spellSlots: number[];

//   concentration: SpellInterface | null;

//   get spellCastingDc(): number;

//   get spellcastingAbilityScore(): number;

//   spells: R<SpellInterface>[];

//   cantrips: R<SpellInterface>[]

//   hitPoints: number;

//   maxHitPoints: number;

//   temporaryHitPoints: number;
  
//   influencingActions: ActionInterface[];

//   conditions: ConditionType[];

//   actionsLeft: number;

//   bonusActionsLeft: number;

//   primaryWeapon: PrimaryWeapon;

//   actor: CreatureActorInterface | null;

//   getMaxSpellSlots(spellLevel: number): number | undefined;

//   removeInfluencingAction(name: string): void;

//   percentSuccess(target: CreatureInterface, weapon: Weapon): number;

//   addInfluencingAction(spell: ActionInterface): void;

//   stopConcentrating(): void;
// }

// export type AbilityScores = {
//   charisma: number,
//   constitution: number,
//   dexterity: number,
//   intelligence: number,
//   strength: number,
//   wisdom: number,
// }

export interface ScriptInterface {

}

// export enum States {
//   idle,
//   planning,
//   scripting,
// }

// export interface CreatureActorInterface extends ActorInterface {
//   id: number;

//   attackRadius: number;

//   occupiedRadius: number;

//   distanceLeft: number;

//   character: CharacterInterface;

//   sceneNode: SceneNodeInterface;
  
//   chestHeight: number;

//   team: number;

//   initiativeRoll: number;

//   automated: boolean;

//   state: States;

//   startTurn(world: WorldInterface): void;

//   endTurn(): void;

//   setAction(action: ActionInterface | null): void;

//   setDefaultAction(): void;

//   setMoveAction(): void;

//   getAction(): ActionInterface | null;

//   getWorldPosition(): Vec4;

//   processPath(path: PathPoint[], script: ScriptInterface): PathPoint[];

//   attack(
//     targetActor: CreatureActorInterface,
//     weapon: Weapon,
//     world: WorldInterface,
//     script: ScriptInterface,
//   ): void;

//   computeShotData(targetActor: CreatureActorInterface): ShotData;

//   takeDamage(damage: number, critical: boolean, from: CreatureActorInterface, weaponName: string, script: ScriptInterface): void;

//   takeHealing(hitPoints: number, from: CreatureActorInterface, by: string, script: ScriptInterface): void;
// }

export interface SceneNodeInterface {
  uuid: string;

  name: string;

  translate: Vec3;

  qRotate: Quat;

  angles: number[];

  scale: Vec3;

  transform: Mat4;

  computeTransform(transform: Mat4, prepend?: boolean): Mat4;

  setFromAngles(x: number, y: number, z: number): void;
}

export interface MaterialInterface {
  pipeline: PipelineInterface | null;

  color: Float32Array;

  drawables: DrawableInterface[];

  colorBuffer: GPUBuffer;

  textureAttributesBuffer: GPUBuffer | null;
  
  bindGroup: GPUBindGroup;

  addDrawable(drawableNode: DrawableNodeInterface): void;
}

export interface DrawableNodeInterface extends SceneNodeInterface {
  drawable: DrawableInterface;

  material: MaterialInterface;
  
  hitTest(origin: Vec4, vector: Vec4): { point: Vec4, t: number, drawable: DrawableInterface} | null;
}

export interface PipelineInterface {
  pipeline: GPURenderPipeline | null;

  // drawables: DrawableInterface[];
  materials: MaterialInterface[];

  addDrawable(drawable: DrawableNodeInterface): void;

  // removeDrawable(drawable: DrawableNodeInterface): void;

  render(passEncoder: GPURenderPassEncoder): void;
}

export type PipelineAttributes = {

}

export interface PipelineManagerInterface {
  getPipelineByArgs(args: PipelineAttributes): [PipelineInterface, PropertyInterface[]];
}

// export type Party = {
//   members: { included: boolean, character: CharacterInterface }[],
//   automate: boolean,
//   experiencePoints?: number,
// }
