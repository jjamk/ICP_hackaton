import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface _SERVICE {
  'createBattle' : ActorMethod<[bigint, number], boolean>,
  'createCharacter' : ActorMethod<[], boolean>,
  'createCharacter2' : ActorMethod<[], boolean>,
  'endBattle' : ActorMethod<
    [string],
    {
      'id' : string,
      'betAmount' : bigint,
      'battleAdmin' : string,
      'winner' : {
        'result' : number,
        'owner' : string,
        'gameResults' : Array<number>,
        'approved' : boolean,
      },
      'characters' : Array<
        { 'exp' : bigint, 'owner' : string, 'battleHistory' : Array<string> }
      >,
      'results' : Array<
        {
          'result' : number,
          'owner' : string,
          'gameResults' : Array<number>,
          'approved' : boolean,
        }
      >,
      'maxParticipantAmount' : number,
    }
  >,
  'enterBattle' : ActorMethod<[string], boolean>,
  'getBattleByUuid' : ActorMethod<
    [string],
    {
      'id' : string,
      'betAmount' : bigint,
      'battleAdmin' : string,
      'winner' : {
        'result' : number,
        'owner' : string,
        'gameResults' : Array<number>,
        'approved' : boolean,
      },
      'characters' : Array<
        { 'exp' : bigint, 'owner' : string, 'battleHistory' : Array<string> }
      >,
      'results' : Array<
        {
          'result' : number,
          'owner' : string,
          'gameResults' : Array<number>,
          'approved' : boolean,
        }
      >,
      'maxParticipantAmount' : number,
    }
  >,
  'getCharacterByOwner' : ActorMethod<
    [string],
    { 'exp' : bigint, 'owner' : string, 'battleHistory' : Array<string> }
  >,
  'initialize' : ActorMethod<[string], boolean>,
  'openedBattles' : ActorMethod<
    [],
    Array<
      {
        'id' : string,
        'betAmount' : bigint,
        'battleAdmin' : string,
        'winner' : {
          'result' : number,
          'owner' : string,
          'gameResults' : Array<number>,
          'approved' : boolean,
        },
        'characters' : Array<
          { 'exp' : bigint, 'owner' : string, 'battleHistory' : Array<string> }
        >,
        'results' : Array<
          {
            'result' : number,
            'owner' : string,
            'gameResults' : Array<number>,
            'approved' : boolean,
          }
        >,
        'maxParticipantAmount' : number,
      }
    >
  >,
}
