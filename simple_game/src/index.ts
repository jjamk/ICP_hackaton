import {
  nat64,
  Record,
  Vec,
  Principal,
  nat16,
  text,
  bool,
  Canister,
  update,
  query,
  ic,
  float64,
} from "azle";

import TokenCanister from "../../token/src";

const FILL_IN = true;

const RETRY_RATE = 100;

// 캐릭터 타입 정의(연습생)
export const Character = Record({
  owner: text,
  exp: nat64, //능력치(점수)
  battleHistory: Vec(text),
});

// 캐릭터 타입 정의(투자자)
export const Character2 = Record({
  owner: text,
  battleHistory: Vec(text),
});

export const CharacterInBattle = Record({
  owner: text,
  result: float64,
  approved: bool,
  gameResults: Vec(float64),
});

// 배틀 타입 정의
export const Battle = Record({
  id: text,
  characters: Vec(Character),
  betAmount: nat64,
  maxParticipantAmount: nat16,
  results: Vec(CharacterInBattle),
  battleAdmin: text,
  winner: CharacterInBattle,
});

export const BattleInfo = Record({
  id: text,
  characters: Vec(Character),
  betAmount: nat64,
  maxParticipantAmount: nat16,
  results: Vec(CharacterInBattle),
  battleAdmin: text,
});

const characters: Vec<typeof Character> = [];
const characters2: Vec<typeof Character2> = [];
const battles: Vec<typeof Battle> = [];
let tokenOwner = "";
let tokenCanister: typeof TokenCanister;

async function _burn(from: string, amount: nat64): Promise<boolean> {
  /*
   * TO-DO: 토큰 컨트랙트의 burn 함수를 호출한 결과를 반환합니다.
   */
  return await ic.call(tokenCanister.burn, {
    args: [from, amount],
  });

}

async function _allowanceFrom(owner: string): Promise<bigint> {
  /*
   * TO-DO: 토큰 컨트랙트의 allowanceFrom 함수를 호출합니다.
   */
  return await ic.call(tokenCanister.allowanceFrom, {
    args: [owner],
  });

}

async function _transferFrom(
  from: string,
  to: string,
  amount: nat64
): Promise<boolean> {
  /*
   * TO-DO: 토큰 컨트랙트의 transferFrom 함수를 호출합니다.
   */
  return await ic.call(tokenCanister.transferFrom, {
    args: [from, to, amount],
  });
}

function getCaller(): string {
  const caller = ic.caller().toString();
  if (caller === null) {
    throw new Error("Caller is null");
  }
  return caller;
}

function _getCharacterByOwner(owner: string): typeof Character {
  const character = characters.find((char) => char.owner === owner);
  if (!character) {
    throw new Error("no character found");
  }
  return character;
}

function _getBattleByUuid(uuid: string): typeof Battle {
  const index = battles.findIndex((battle) => battle.id === uuid);
  if (index === -1) {
    throw new Error("no battle found");
  }
  return battles[index];
}

function getRandomNumber(): nat16 {
  return Math.random();
}

function generateRandomUUID(): string {
  const hexChars = "0123456789abcdef";
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";

  uuid = uuid.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return hexChars[v];
  });

  return uuid;
}

export default Canister({
  initialize: update([text], bool, (tokenCanisterAddress) => {
    /*
     * TO-DO: 토큰 캐니스터의 인스턴스를 생성하고 전역변수 tokenCanister에 할당합니다.
     * 인자로 주어진 토큰 캐니스터의 주소를 사용하세요.
     */
    tokenCanister = TokenCanister(Principal.fromText(tokenCanisterAddress));
    return true;
  }),

  getCharacterByOwner: query([text], Character, (owner) => {
    return _getCharacterByOwner(owner);
  }),

  //연습생 생성
  createCharacter: update([], bool, () => {
    /*
     * TO-DO: 사용자의 캐릭터를 생성하고, 생성된 캐릭터를 characters에 추가합니다.
     */
    const newCharacter: typeof Character = {
      owner: getCaller(),
      exp: 0n,
      battleHistory: [],
    };
    //const characterGameResult: Vec<number> = [getRandomNumber()];
    Character.exp = BigInt(getRandomNumber());

    characters.push(newCharacter);
    return true;
  }),

  //투자자 생성
  createCharacter2: update([], bool, () => {
    /*
     * TO-DO: 사용자의 캐릭터를 생성하고, 생성된 캐릭터를 characters에 추가합니다.
     */
    const newCharacter2: typeof Character2 = {
      owner: getCaller(),
      battleHistory: [],
    };

    characters2.push(newCharacter2);
    return true;
  }),

  createBattle: update(
    [nat64, nat16],
    bool,
    async (betAmount, maxParticipantAmount) => {
      /*
       * TO-DO
       * 배틀 생성 함수를 구현합니다.
       *
       * 사용자는 이 함수를 호출해 새로운 배틀을 생성한다.
       * 사용자는 방장이 되어, 배틀을 실행할 권한을 가진다.
       * 배틀을 생성할 때, 배틀에 걸릴 토큰의 수를 정한다.
       * 사용자는 해당 함수를 호출하기 전에 betAmount 이상의 토큰을 컨트랙트에 approve 해두어야 한다.
       */
      const caller = getCaller();
      const callerCharacter = characters.find((char) => char.owner === caller);

      if (!callerCharacter) {
        throw new Error("Character not found");
      }

      // 1. 사용자가 BetAmount만큼 approve 해두었는지 확인합니다.
      const allowance = await _allowanceFrom(caller);
      if (allowance < betAmount) {
        throw new Error("Not enough allowance");
      }
      // 1-1. 충분한 양의 토큰을 approve 해두지 않은 경우, 생성할 수 없도록 에러를 반환합니다.
      // 1-2. 충분한 양의 토큰을 approve 해둔 경우, 배틀을 생성합니다.

      const newBattle: typeof Battle = {
        id: generateRandomUUID(),
        characters: [callerCharacter],
        results: [],
        betAmount: betAmount,
        battleAdmin: caller,
        maxParticipantAmount: maxParticipantAmount,
        winner: {
          owner: "0",
          result: 0,
          approved: false,
          gameResults: [],
        },
      };

      battles.push(newBattle);

      return true;
    }
  ),

  openedBattles: query([], Vec(Battle), () => {
    return battles.filter((battle) => battle.winner.owner === "0");
  }),

  getBattleByUuid: query([text], Battle, (uuid) => {
    return _getBattleByUuid(uuid);
  }),

  enterBattle: update([text], bool, async (battleId) => {
    /*
     * TO-DO: 배틀에 입장하는 함수 enterBattle을 구현합니다.
     */

    const caller = getCaller();
    const character = characters.find((char) => char.owner === caller);

    if (!character) {
      throw new Error("Character not found");
    }

    // 1. 배틀을 가져옵니다.
    const battle = _getBattleByUuid(battleId);
    // 1-1. 배틀에 최대인원이 다 찼다면, 참여할 수 없도록 에러를 반환합니다.
    if (battle.maxParticipantAmount <= battle.characters.length) {
      throw new Error("battle is full");
    }


    // 2. 사용자가 배틀의 betAmount만큼 approve 해두었는지 확인합니다.
    const allowance = await _allowanceFrom(caller);

    // 2-1. 충분한 양의 토큰을 approve 해두지 않은 경우, 참여할 수 없도록 에러를 반환합니다.
    if (allowance < battle.betAmount) {
      throw new Error("Not enough allowance");
    }
    // 2-2. 충분한 양의 토큰을 approve 해둔 경우, 배틀에 참여시킵니다.
    battle.characters.push(character);

    return true;
  }),

  endBattle: update([text], Battle, async (battleId) => {
    /*
     * TO-DO: 게임을 종료하고, 결과를 정산하는 함수 endBattle를 구현합니다.
     */
    const battle = _getBattleByUuid(battleId);

    // 1. endBattle은 방장(battleAdmin)만이 실행할 수 있다. 먼저 방장이 호출했는지 확인한다.
    const caller = getCaller();
    if (caller !== battle.battleAdmin) {
      throw new Error("Only BattleAdmin can end battle");
    }
    // 2. 참여자들을 돌면서 allowance가 충분한지 확인합니다.
    // 2-1. allowance가 충분하지 않으면 배틀에서 제외합니다.
    // 3. 참여자들마다 Math.random을 돌리게 한다. retryCount가 1 이상이면, 카운트 수만큼 돌리고, 가장 1에 근접한 수를 result로 삼습니다.
    // 각 참여자들의 result를 battle.results에 추가합니다.
    for (let character of battle.characters) {
      const allowance = await _allowanceFrom(character.owner);

      if (allowance < battle.betAmount) {
        battle.results.push({
          owner: character.owner,
          result: 0,
          gameResults: [],
          approved: false,
        });
      } else {
      const characterGameResult: Vec<number> = [getRandomNumber()];
      //exp = characterGameResult.push(getRandomNumber());
        battle.results.push({
          owner: character.owner,
          result: Math.max(...characterGameResult),
          gameResults: characterGameResult,
          approved: true,
        });
      }
    }
    battle.winner = battle.results.reduce((max, curr) => {
      return curr.result > max.result ? curr : max;
    });
    // 4. 1등에게 걸린 모든 베팅금을 transfer합니다.
    // 5. 배틀 결과를 각 캐릭터의 배틀 히스토리에 저장합니다.
    for (let i = 0; i < battle.results.length; i++) {
      _transferFrom(
        battle.results[i].owner,
        battle.winner.owner,
        battle.betAmount
      );

      const character = _getCharacterByOwner(battle.results[i].owner);
      character.battleHistory.push(battle.id);
      }

    return battle;
  }),
});
