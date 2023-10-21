export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'createBattle' : IDL.Func([IDL.Nat64, IDL.Nat16], [IDL.Bool], []),
    'createCharacter' : IDL.Func([], [IDL.Bool], []),
    'createCharacter2' : IDL.Func([], [IDL.Bool], []),
    'endBattle' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'id' : IDL.Text,
            'betAmount' : IDL.Nat64,
            'battleAdmin' : IDL.Text,
            'winner' : IDL.Record({
              'result' : IDL.Float64,
              'owner' : IDL.Text,
              'gameResults' : IDL.Vec(IDL.Float64),
              'approved' : IDL.Bool,
            }),
            'characters' : IDL.Vec(
              IDL.Record({
                'exp' : IDL.Nat64,
                'owner' : IDL.Text,
                'battleHistory' : IDL.Vec(IDL.Text),
              })
            ),
            'results' : IDL.Vec(
              IDL.Record({
                'result' : IDL.Float64,
                'owner' : IDL.Text,
                'gameResults' : IDL.Vec(IDL.Float64),
                'approved' : IDL.Bool,
              })
            ),
            'maxParticipantAmount' : IDL.Nat16,
          }),
        ],
        [],
      ),
    'enterBattle' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'getBattleByUuid' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'id' : IDL.Text,
            'betAmount' : IDL.Nat64,
            'battleAdmin' : IDL.Text,
            'winner' : IDL.Record({
              'result' : IDL.Float64,
              'owner' : IDL.Text,
              'gameResults' : IDL.Vec(IDL.Float64),
              'approved' : IDL.Bool,
            }),
            'characters' : IDL.Vec(
              IDL.Record({
                'exp' : IDL.Nat64,
                'owner' : IDL.Text,
                'battleHistory' : IDL.Vec(IDL.Text),
              })
            ),
            'results' : IDL.Vec(
              IDL.Record({
                'result' : IDL.Float64,
                'owner' : IDL.Text,
                'gameResults' : IDL.Vec(IDL.Float64),
                'approved' : IDL.Bool,
              })
            ),
            'maxParticipantAmount' : IDL.Nat16,
          }),
        ],
        ['query'],
      ),
    'getCharacterByOwner' : IDL.Func(
        [IDL.Text],
        [
          IDL.Record({
            'exp' : IDL.Nat64,
            'owner' : IDL.Text,
            'battleHistory' : IDL.Vec(IDL.Text),
          }),
        ],
        ['query'],
      ),
    'initialize' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'openedBattles' : IDL.Func(
        [],
        [
          IDL.Vec(
            IDL.Record({
              'id' : IDL.Text,
              'betAmount' : IDL.Nat64,
              'battleAdmin' : IDL.Text,
              'winner' : IDL.Record({
                'result' : IDL.Float64,
                'owner' : IDL.Text,
                'gameResults' : IDL.Vec(IDL.Float64),
                'approved' : IDL.Bool,
              }),
              'characters' : IDL.Vec(
                IDL.Record({
                  'exp' : IDL.Nat64,
                  'owner' : IDL.Text,
                  'battleHistory' : IDL.Vec(IDL.Text),
                })
              ),
              'results' : IDL.Vec(
                IDL.Record({
                  'result' : IDL.Float64,
                  'owner' : IDL.Text,
                  'gameResults' : IDL.Vec(IDL.Float64),
                  'approved' : IDL.Bool,
                })
              ),
              'maxParticipantAmount' : IDL.Nat16,
            })
          ),
        ],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
