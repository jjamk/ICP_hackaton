import {
  nat64,
  Record,
  update,
  ic,
  StableBTreeMap,
  Vec,
  Canister,
  text,
  bool,
  query,
  Opt,
} from "azle";

export const Allowances = Record({
  spender: text,
  amount: nat64,
});

export const Account = Record({
  address: text,
  balance: nat64,
  allowances: Vec(Allowances),
});

let state = StableBTreeMap(text, Account, 0);
const admins: Vec<string> = [];

const tokenInfo = {
  name: "",
  ticker: "",
  totalSupply: 0n,
  owner: "",
};

function isAdmin(address: string): boolean {
  if (admins.indexOf(address) == -1) {
    return false;
  }
  return true;
}

function getCaller(): string {
  const caller = ic.caller().toString();
  if (caller === null) {
    throw new Error("Caller is null");
  }
  return caller;
}

function getAccountByAddress(address: text): Opt<typeof Account> {
  return state.get(address);
}

function insertAccount(address: text, account: typeof Account): typeof Account {
  state.insert(address, account);
  const newAccountOpt = getAccountByAddress(address);
  if ("None" in newAccountOpt) {
    throw new Error("Insert failed");
  }
  return newAccountOpt.Some;
}

function _allowance(owner: string, spender: string): nat64 {
  /*
   * TO-DO: 토큰을 얼마나 approve 했는지 확인합니다.
   * approve하지 않았다면 0n을 반환합니다.
   */
  const ownerAccountOpt = getAccountByAddress(owner);
  if ("None" in ownerAccountOpt) {
    throw new Error("Owner account not found");
  }
  const ownerAccount = ownerAccountOpt.Some;

  for (let allowance of ownerAccount.allowances) {
    if (allowance.spender == spender) {
      return allowance.amount;
    }
  }
  return 0n;
}

function _transferFrom(from: text, to: text, amount: nat64): bool {
  /*
   * TO-DO: approve 받은 토큰을 전송 합니다.
   * 전송 후 allowance를 갱신하는 것을 잊지 마세요!
   */
  const spender = getCaller();
  const spenderAccountOpt = getAccountByAddress(spender);
  if ("None" in spenderAccountOpt) {
    throw new Error("Spender account not found");
  }
  const spenderAccount = spenderAccountOpt.Some;

  const fromAccountOpt = getAccountByAddress(from);
  if ("None" in fromAccountOpt) {
    throw new Error("From account not found");
  }
  const fromAccount = fromAccountOpt.Some;

  // 수신 계정이 없으면 새로 생성
  let toAccount: typeof Account;
  const toAccountOpt = getAccountByAddress(to);
  if ("None" in toAccountOpt) {
    const newToAccount = {
      address: to,
      balance: 0n,
      allowances: [],
    };
    toAccount = insertAccount(to, newToAccount);
  } else {
    toAccount = toAccountOpt.Some;
  }

  const allowance = _allowance(from, spender);

  // allowance가 부족한 경우
  if (allowance === undefined || allowance < amount) {
    return false;
  }
  // fromAccount - spender 간의 allowance 갱신
  for (let i = 0; i < fromAccount.allowances.length; i++) {
    const item = fromAccount.allowances[i];
    if (fromAccount.allowances[i].spender === spender) {
      fromAccount.allowances[i] = {
        spender: spender,
        amount: fromAccount.allowances[i].amount - amount,
      };
    }
  }

  fromAccount.balance -= amount;
  toAccount.balance += amount;
  insertAccount(from, fromAccount);
  insertAccount(to, toAccount);

  return true;
}

export default Canister({
  allState: query([], Vec(Account), () => {
    return state.values();
  }),

  getAdmins: query([], Vec(text), () => {
    return admins;
  }),

  addAdmin: update([text], bool, (address) => {
    /*
     * TO-DO: admin을 추가합니다.
     * admin을 추가하거나 삭제하는 작업은 admin 권한을 가진 사용자만 실행할 수 있어야 합니다.
     */
    const caller = getCaller();

    if (!isAdmin(caller)) {
      return false;
    }

    admins.push(address);

    return true;
  }),

  deleteAdmin: update([text], bool, (address) => {
    /*
     * TO-DO: admin을 삭제합니다.
     * admin을 추가하거나 삭제하는 작업은 admin 권한을 가진 사용자만 실행할 수 있어야 합니다.
     */
    const caller = getCaller();

    if (tokenInfo.owner != caller) {
      return false;
    }

    const indexToDelete = admins.indexOf(address);

    if (indexToDelete !== -1) {
      admins.splice(indexToDelete, 1);
    }
    return true;
  }),

  initialize: update([text, text, nat64], text, (name, ticker, totalSupply) => {
    const ownerAddress = getCaller();

    const creatorAccount: typeof Account = {
      address: ownerAddress,
      balance: totalSupply,
      allowances: [],
    };

    tokenInfo.name = name;
    tokenInfo.ticker = ticker;
    tokenInfo.totalSupply = totalSupply;
    tokenInfo.owner = ownerAddress;

    insertAccount(ownerAddress, creatorAccount);

    admins.push(ownerAddress);

    return ownerAddress;
  }),

  name: query([], text, () => {
    return tokenInfo.name;
  }),

  ticker: query([], text, () => {
    return tokenInfo.ticker;
  }),

  totalSupply: query([], nat64, () => {
    return tokenInfo.totalSupply;
  }),

  owner: query([], text, () => {
    return tokenInfo.owner;
  }),

  balanceOf: query([text], nat64, (address) => {
    /*
     * TO-DO: 계정의 주소를 반환합니다.
     * getAccountByAddress() 함수를 사용하세요.
     * state에 사용자 정보가 없는 경우, 0을 반환합니다.
     */
    const accountOpt = getAccountByAddress(address);
    if ("None" in accountOpt) {
      return 0n;
    }
    return accountOpt.Some.balance;
  }),

  transfer: update([text, nat64], bool, (to, amount) => {
    /*
     * TO-DO: 토큰을 전송합니다.
     * getAccountByAddress() 함수를 사용하세요.
     */
    const fromAddress = getCaller();
    const fromAccountOpt = getAccountByAddress(fromAddress);
    if ("None" in fromAccountOpt) {
      throw new Error("fromAccount not found");
    }

    const fromAccount = fromAccountOpt.Some;

    // 수신 계정이 없으면 새로 생성

    let toAccountOpt = getAccountByAddress(to);
    let toAccount;
    if ("None" in toAccountOpt) {
      const newToAccount: typeof Account = {
        address: to,
        balance: 0n,
        allowances: [],
      };
      // toAccount = insertAccount(to, newToAccount);
      toAccount = insertAccount(to, newToAccount);
    } else {
      toAccount = toAccountOpt.Some;
    }

    if (!fromAccount || fromAccount.balance < amount) {
      return false;
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // 업데이트된 계정 정보를 StableBTreeMap에 다시 삽입
    insertAccount(fromAddress, fromAccount);
    insertAccount(to, toAccount);


    return true;
  }),

  approve: update([text, nat64], bool, (spender, amount) => {
    /*
     * TO-DO: 토큰을 approve 합니다.
     * 기존에 owner가 spender에게 토큰을 approve한 경우, 기존의 값을 덮어 씌워야 합니다.
     */
    const ownerAddress = getCaller();
    const ownerAccountOpt = getAccountByAddress(ownerAddress);

    if ("None" in ownerAccountOpt) {
      throw new Error("fromAccount not found");
    }

    const ownerAccount = ownerAccountOpt.Some;

    // 수신 계정이 없으면 새로 생성
    const spenderAccountOpt = getAccountByAddress(spender);
    let spenderAccount: typeof Account;
    if ("None" in spenderAccountOpt) {
      const newSpenderAccount = {
        address: spender,
        balance: 0n,
        allowances: [],
      };
      spenderAccount = insertAccount(spender, newSpenderAccount);
    } else {
      spenderAccount = spenderAccountOpt.Some;
    }

    if (!ownerAccount || ownerAccount.balance < amount) {
      return false;
    }

    let exist = false;
    // 기존에 approve한 값이 있다면, 덮어씌운다.
    for (let i = 0; i < ownerAccount.allowances.length; i++) {
      const key = ownerAccount.allowances[i].spender;

      if (key === spender) {
        exist = true;
        ownerAccount.allowances[i] = { spender, amount };
      }
    }
    // 처음 approve하는 것이라면, 새롭게 추가
    if (!exist) {
      ownerAccount.allowances.push({ spender, amount });
    }

    insertAccount(ownerAddress, ownerAccount);

    return true;
  }),

  allowance: query([text, text], nat64, (owner, spender) => {
    return _allowance(owner, spender);
  }),

  // owner -> 호출자 에 대한 allowance
  allowanceFrom: query([text], nat64, (owner) => {
    /*
     * TO-DO: 인자로 주어진 owner가 함수를 호출한 caller에게 토큰을 얼마나 approve 해주었는지 확인합니다.
     * allowanceFrom() 함수는 주로 캐니스터 컨트랙트에서 "사용자가 캐니스터에 얼마나 approve 했는지"(사용자 -> 캐니스터) 확인할 때 사용합니다.
     */

    const spender = getCaller();
    const spenderAccount = getAccountByAddress(spender);
    
    //투자자인지 조건문
    if ("None" in spenderAccount) {
      return 0n;
    } else {
      return _allowance(owner, spender);
    }
  }),

  transferFrom: update([text, text, nat64], bool, (from, to, amount) => {
    return _transferFrom(from, to, amount);
  }),

  mint: update([text, nat64], bool, (to, amount) => {
    /*
     * TO-DO: 새로운 토큰을 to에게 발행합니다.
     * mint 함수는 admin 권한이 있는 계정만 호출할 수 있습니다.
     */
    const caller = getCaller();

    // mint 함수는 admin인 계정만 호출할 수 있습니다.
    if (admins.indexOf(caller) == -1) {
      throw new Error("Only admins can mint new tokens");
    }

    const callerAccountOpt = getAccountByAddress(caller);

    if ("None" in callerAccountOpt) {
      throw new Error("Caller account not found");
    }
    const callerAccount = callerAccountOpt.Some;

    const toAccountOpt = getAccountByAddress(to);
    if ("None" in toAccountOpt) {
      throw new Error("Recipient account not found");
    }
    const toAccount = toAccountOpt.Some;

    toAccount.balance += amount;
    tokenInfo.totalSupply += amount;

    insertAccount(to, toAccount);
    return true;
  }),

  burn: update([text, nat64], bool, (from, amount) => {
    /*
     * TO-DO: from이 소유한 일정량의 토큰을 소각합니다.
     * burn 함수는 admin 권한이 있는 계정만 호출할 수 있습니다.
     */
    const caller = getCaller();

    // burn 함수는 admin인 계정만 호출할 수 있습니다.
    if (admins.indexOf(caller) == -1) {
      throw new Error("Only admins can burn tokens");
    }

    const callerAccountOpt = getAccountByAddress(caller);

    if ("None" in callerAccountOpt) {
      throw new Error("Caller account not found");
    }
    const callerAccount = callerAccountOpt.Some;

    if (_allowance(from, caller) < amount) {
      throw new Error("Insufficient allowance to burn");
    }

    if (tokenInfo.totalSupply < amount) {
      throw new Error("Insufficient tokens to burn");
    }
    _transferFrom(from, "0", amount);
    tokenInfo.totalSupply -= amount;

    insertAccount(caller, callerAccount);
    return true;
  }),
});
