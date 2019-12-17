import {app} from 'electron';
import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';

import {error} from 'root/lib/logger';
import {AnyMap, asBoolean, asMap, asNumber, asNumberString, asString} from 'root/lib/type_utils';

type StorePath = string & {_: 'StorePath'};

class SettingsStore {
  private readonly path: StorePath;
  private data: LatestSettings;

  constructor() {
    this.path = join(app.getPath('userData'), 'user-preferences.json') as StorePath;

    try {
      const raw = JSON.parse(readFileSync(this.path, 'utf8'));
      const rawMap = asMap(raw);
      if (!rawMap) {
        throw new Error('Invalid JSON');
      }
      const version = asNumber(rawMap.version, Version.v0);
      // tslint:disable-next-line: no-object-literal-type-assertion
      this.data = parseSettings({...rawMap, version} as AllSettings);
    } catch (e) {
      this.data = createDefault();
    }
    this.save();
  }

  public get(): LatestSettings {
    return this.data;
  }

  public set(newSettings: LatestSettings): void {
    this.data = newSettings;
    this.save();
  }

  public wipe(): void {
    this.data = createDefault();
    this.save();
  }

  public save(): void {
    try {
      writeFileSync(this.path, JSON.stringify(this.data));
    } catch (e) {
      error('SettingsStore.set', e);
    }
  }

  public getAccount(): Account | undefined {
    const token = this.data.userToken;
    if (token === undefined) {
      return undefined;
    }
    return this.data.accounts.find(_ => _.token === token);
  }

  public removeAccount(userToken: string): void {
    const accountIndex = this.data.accounts.findIndex(_ => _.token === userToken);
    if (accountIndex > -1) {
      this.data.accounts.splice(accountIndex, 1);
    }
  }
}

export type LatestSettings = SettingsV2;
export type OverlaySettings = OverlaySettingsV2;
type AllSettings = SettingsV0 | SettingsV1 | LatestSettings;

enum Version {
  v0,
  v1,
  v2,
}

interface SettingsBase {
  version: Version;
}

interface SettingsV0 extends SettingsBase {
  version: Version.v0;
  // tslint:disable-next-line: no-any
  [index: string]: any;
}

interface SettingsV1 extends SettingsBase {
  version: Version.v1;
  accounts: Account[];
  userToken?: string;
  icon?: string;
  autorun: boolean;
  minimized: boolean;
  overlay: boolean;
  manualUpdate: boolean;
  awaiting?: Player;
  logPath?: string;
}

interface SettingsV2 extends SettingsBase {
  version: Version.v2;
  accounts: AccountV2[];
  userToken?: string;
  icon?: string;
  autorun: boolean;
  minimized: boolean;
  overlay: boolean;
  manualUpdate: boolean;
  awaiting?: Player;
  logPath?: string;
}

export interface Player {
  playerId: string;
  screenName: string;
  language: string;
}

export interface Account {
  uid: string;
  token: string;
  nick: string;
  overlay: boolean;
  player?: Player;
  overlaySettings?: OverlaySettingsV0;
}

export interface AccountV2 {
  uid: string;
  token: string;
  nick: string;
  overlay: boolean;
  player?: Player;
  overlaySettings?: OverlaySettingsV2;
}

export interface OverlaySettingsV0 {
  leftdigit: number;
  rightdigit: number;
  bottomdigit: number;
  rightdraftdigit: number;
  leftdraftdigit: number;
  hidemy: boolean;
  hideopp: boolean;
  hidezero: boolean;
  showcardicon: boolean;
  neverhide: boolean;
  mydecks: boolean;
  cardhover: boolean;
  timers: boolean;
}

export interface OverlaySettingsV2 {
  leftdigit: number;
  rightdigit: number;
  bottomdigit: number;
  rightdraftdigit: number;
  leftdraftdigit: number;
  hidemy: boolean;
  hideopp: boolean;
  hidezero: boolean;
  showcardicon: boolean;
  neverhide: boolean;
  mydecks: boolean;
  cardhover: boolean;
  timers: boolean;
}

function asOverlaySettings(anyMap: AnyMap | undefined): OverlaySettings | undefined {
  if (!anyMap) {
    return undefined;
  }

  const leftdigit = asNumber(anyMap['leftdigit']);
  const rightdigit = asNumber(anyMap['rightdigit']);
  const bottomdigit = asNumber(anyMap['bottomdigit']);
  // tslint:disable-next-line: no-magic-numbers
  const rightdraftdigit = asNumber(anyMap['rightdraftdigit'], 3);
  const leftdraftdigit = asNumber(anyMap['leftdraftdigit'], 1);
  const hidemy = asBoolean(anyMap['hidemy']);
  const hideopp = asBoolean(anyMap['hideopp']);
  const hidezero = asBoolean(anyMap['hidezero']);
  const showcardicon = asBoolean(anyMap['showcardicon']);
  const timers = asBoolean(anyMap['timers']);
  const neverhide = asBoolean(anyMap['neverhide']);
  const mydecks = asBoolean(anyMap['mydecks']);
  const cardhover = asBoolean(anyMap['cardhover']);

  if (
    leftdigit === undefined ||
    rightdigit === undefined ||
    bottomdigit === undefined ||
    hidemy === undefined ||
    hideopp === undefined ||
    showcardicon === undefined ||
    timers === undefined ||
    neverhide === undefined ||
    cardhover === undefined ||
    mydecks === undefined ||
    hidezero === undefined
  ) {
    return undefined;
  }

  return {
    leftdigit,
    rightdigit,
    bottomdigit,
    rightdraftdigit,
    leftdraftdigit,
    hidemy,
    hideopp,
    hidezero,
    showcardicon,
    timers,
    neverhide,
    mydecks,
    cardhover,
  };
}

function asOverlaySettingsV2(ovlSettings: OverlaySettingsV0 | undefined): OverlaySettingsV2 | undefined {
  if (!ovlSettings) {
    return undefined;
  }

  const leftdigit = ovlSettings.leftdigit;
  const rightdigit = ovlSettings.rightdigit;
  const bottomdigit = ovlSettings.bottomdigit;
  // tslint:disable-next-line: no-magic-numbers
  const rightdraftdigit = 3;
  const leftdraftdigit = 1;
  const hidemy = ovlSettings.hidemy;
  const hideopp = ovlSettings.hideopp;
  const hidezero = ovlSettings.hidezero;
  const showcardicon = ovlSettings.showcardicon;
  const timers = ovlSettings.timers;
  const neverhide = ovlSettings.neverhide;
  const mydecks = ovlSettings.mydecks;
  const cardhover = ovlSettings.cardhover;

  return {
    leftdigit,
    rightdigit,
    bottomdigit,
    rightdraftdigit,
    leftdraftdigit,
    hidemy,
    hideopp,
    hidezero,
    showcardicon,
    timers,
    neverhide,
    mydecks,
    cardhover,
  };
}

function asPlayer(anyMap: AnyMap | undefined): Player | undefined {
  if (!anyMap) {
    return undefined;
  }

  const playerId = asString(anyMap['playerId']);
  const screenName = asString(anyMap['screenName']);
  const language = asString(anyMap['language']);

  if (playerId === undefined || screenName === undefined || language === undefined) {
    return undefined;
  }

  return {playerId, screenName, language};
}

function asAccountV0(anyMap: AnyMap): Account[] {
  const res: Account[] = [];

  for (const key of Object.keys(anyMap)) {
    const raw = asMap(anyMap[key]);
    if (!raw) {
      continue;
    }

    const uid = asNumberString(raw['uid']);
    const token = asString(raw['token']);
    const nick = asString(raw['nick']);
    const overlay = asBoolean(raw['overlay']);
    const player = asPlayer({
      playerId: raw['playerId'],
      screenName: raw['screenName'],
      language: raw['language'],
    });
    const overlaySettings = asOverlaySettings({
      leftdigit: raw['leftdigit'],
      rightdigit: raw['rightdigit'],
      bottomdigit: raw['bottomdigit'],
      hidemy: raw['hidemy'],
      hideopp: raw['hideopp'],
      hidezero: raw['hidezero'],
      showcardicon: raw['showcardicon'],
    });

    if (
      uid === undefined ||
      token === undefined ||
      nick === undefined ||
      overlay === undefined ||
      overlaySettings === undefined
    ) {
      continue;
    }

    res.push({uid, token, nick, overlay, player, overlaySettings});
  }

  return res;
}

function asAccountsV2(accountsV1: Account[]): AccountV2[] {
  const res: AccountV2[] = [];
  accountsV1.forEach(accV1 => {
    res.push({
      uid: accV1.uid,
      token: accV1.token,
      nick: accV1.nick,
      overlay: accV1.overlay,
      player: accV1.player,
      overlaySettings: asOverlaySettingsV2(accV1.overlaySettings),
    });
  });
  return res;
}

function migrateV0toV1(v0: SettingsV0): SettingsV1 {
  return {
    version: Version.v1,
    accounts: asAccountV0(asMap(v0['settings'], {})),
    userToken: asString(v0['usertoken']),
    icon: asString(v0['icon']),
    autorun: asBoolean(v0['autorun'], false),
    minimized: asBoolean(v0['minimized'], false),
    overlay: asBoolean(v0['overlay'], false),
    manualUpdate: asBoolean(v0['manualupdate'], false),
    awaiting: asPlayer(asMap(v0['awaiting'])),
    logPath: asString(v0['logpath']),
  };
}

function migrateV1toV2(v1: SettingsV1): SettingsV2 {
  return {
    version: Version.v2,
    accounts: asAccountsV2(v1.accounts),
    userToken: v1.userToken,
    icon: v1.icon,
    autorun: v1.autorun,
    minimized: v1.minimized,
    overlay: v1.overlay,
    manualUpdate: v1.manualUpdate,
    awaiting: v1.awaiting,
    logPath: v1.logPath,
  };
}

function parseSettings(settings: AllSettings): LatestSettings {
  // Recursively parse settings and migrate them to arrive at latest version
  switch (settings.version) {
    case Version.v0:
      return parseSettings(migrateV0toV1(settings));
    case Version.v1:
      return parseSettings(migrateV1toV2(settings));
    default:
      return settings;
  }
}

function createDefault(): LatestSettings {
  return parseSettings({version: Version.v0});
}

export const settingsStore = new SettingsStore();
