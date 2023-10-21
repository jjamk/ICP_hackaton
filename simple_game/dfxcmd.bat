@echo on
dfx identity use default
cd ../token
dfx canister call token initialize '("Kpop-Token","kpop",10000)' 발행량 10000개
dfx canister call token addAdmin '("be2us-64aaa-aaaaa-qaabq-cai")'
dfx canister call token approve '("be2us-64aaa-aaaaa-qaabq-cai",1000)' 

//one-identity
dfx canister call token approve '("be2us-64aaa-aaaaa-qaabq-cai",1000)' 
dfx canister call token transfer '("rsmup-ic67u-pop44-yqjyt-y2xco-t5bvg-oo4l4-co7fw-k4rfv-6cqzi-eae", 1000)'


//two-identity
dfx canister call token approve '("be2us-64aaa-aaaaa-qaabq-cai",1000)' 
dfx canister call token transfer '("2ezst-pv2fu-ivop4-otvxq-lxai2-rsbh7-mvxnn-oe32a-ijgey-acbyp-dqe", 1000)'

//three-identity
dfx canister call token approve '("be2us-64aaa-aaaaa-qaabq-cai",1000)' 
dfx canister call token transfer '("ub6am-qbflj-db5uj-ebeok-s6kqy-u35tq-ivwmn-g7ars-uynix-cj6qa-sqe", 1000)'

dfx identity use second-identity
dfx canister call token approve '("bkyz2-fmaaa-aaaaa-qaaaq-cai",1000)' //게임캐니스터
dfx identity use default
cd ../simple_game
dfx canister call simple_game initialize '("bkyz2-fmaaa-aaaaa-qaaaq-cai")'

dfx canister call simple_game createCharacter2 '()' 
dfx canister call simple_game createBattle '(100,7)'
dfx canister call simple_game openedBattles '()'

dfx identity use one-identity //연습생A
dfx canister call simple_game createCharacter '()' //연습생A
dfx identity use two-identity //연습생B
dfx canister call simple_game createCharacter '()' //연습생B
dfx identity use three-identity //연습생c
dfx canister call simple_game createCharacter '()' //연습생c

dfx identity use four-identity //투자자a
dfx canister call simple_game createCharacter2 '()' //투자자a
dfx identity use five-identity //투자자b
dfx canister call simple_game createCharacter2 '()' //투자자b
dfx identity use six-identity //투자자c
dfx canister call simple_game createCharacter2 '()' //투자자c


dfx identity use default //다시 admin계정으로 돌아와서
dfx canister call simple_game enterbattle '()'
dfx canister call simple_game enterbattle '()'
dfx canister call simple_game enterbattle '()'

