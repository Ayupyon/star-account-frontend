import BigNumber from "bignumber.js";
import avatar from "@/assets/user_avatar.png";

const tokenKey = "star-account-access-key";

class User {
  constructor(id, name, email, password, createTime) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createTime = createTime;
  }
}

class Account {
  constructor(id, name, createTime) {
    this.id = id;
    this.name = name;
    this.createTime = createTime;
  }
}

class Record {
  constructor(id, name, type, date, amount, accountId, createUserId, lastModifiedUserId, createTime) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.date = date;
    this.amount = amount;
    this.accountId = accountId;
    this.createUserId = createUserId;
    this.lastModifiedUserId = lastModifiedUserId;
    this.createTime = createTime;
  }
}

class AccountAccessRule {
  constructor(id, userId, accountId, role) {
    this.id = id;
    this.userId = userId;
    this.accountId = accountId;
    this.role = role;
  }
}

export class MockApi {
  constructor() {
    this.users = new Map([
      [1, new User(1, "testUser1", "test1@star.com", "testpassword1", Date.now())],
      [2, new User(2, "testUser2", "test2@star.com", "testpassword2", Date.now())],
      [3, new User(3, "testUser3", "test3@star.com", "testpassword3", Date.now())],
    ]);
    this.nextUserId = 4;

    this.accounts = new Map([
      [1, new Account(1, "testAccount1", Date.now())],
      [2, new Account(2, "testAccount2", Date.now())],
      [3, new Account(3, "testAccount3", Date.now())],
    ]);
    this.nextAccountId = 4;

    this.records = new Map([
      [1, new Record(1, "test1", 1, Date.now(), 9.9, 1, 1, 1, Date.now())],
      [2, new Record(2, "test2", 2, Date.now(), 9.9, 1, 2, 2, Date.now())],
      [3, new Record(3, "test3", 3, Date.now(), 9.9, 1, 3, 3, Date.now())],
      [4, new Record(4, "test4", 4, Date.now(), 9.9, 1, 1, 1, Date.now())],
      [5, new Record(5, "test5", 5, Date.now(), 9.9, 1, 1, 1, Date.now())],
      [6, new Record(6, "test6", 6, Date.now(), 9.9, 1, 1, 1, Date.now())],
      [7, new Record(7, "test7", 7, Date.now(), 9.9, 1, 1, 1, Date.now())],
    ]);
    this.nextRecordId = 8;

    this.accountAccessRules = new Map([
      [1, new AccountAccessRule(1, 1, 1, 2)],
      [2, new AccountAccessRule(2, 1, 2, 2)],
      [3, new AccountAccessRule(3, 1, 3, 2)],
      [4, new AccountAccessRule(4, 2, 1, 1)],
      [5, new AccountAccessRule(4, 3, 1, 1)],
    ]);
    this.nextAccountAccessRuleId = 6;
  }

  async verifyCurrentUser() {
    let value = localStorage.getItem(tokenKey);
    if (value === null) {
      return null;
    }

    let id = parseInt(value);
    if (this.users.has(id)) {
      return this.users.get(id);
    } else {
      localStorage.removeItem(tokenKey);
      return null;
    }
  }

  async loginUser(email, password) {
    for (let [id, user] of this.users) {
      if (user.email === email && user.password === password) {
        localStorage.setItem(tokenKey, id);
        return true;
      }
    }

    return false;
  }

  async logoutUser() {
    localStorage.removeItem(tokenKey);
    return true;
  }

  async createUser(name, email, password) {
    for (let [_, user] of this.users) {
      if (user.email === email) {
        return false;
      }
    }

    let user = new User(this.nextUserId++, name, email, password, Date.now());
    this.users.set(user.id, user);

    return true;
  }

  async updateUserName(name) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    user.name = name;
    return true;
  }

  async updateUserEmail(email) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    user.email = email;
    return true;
  }

  async updateUserPassword(password) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    user.password = password;
    return true;
  }

  async checkUserPassword(password) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    return user.password === password;
  }

  async getUser(id) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return null;
    }

    if (!this.users.has(id)) {
      return null;
    }

    return this.users.get(id);
  }

  async getUserAvatar(id) {
    return avatar;
  }

  async getUserByEmail(email) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return null;
    }

    for (let [_, user] of this.users) {
      if (user.email === email) {
        return user;
      }
    }

    return null;
  }

  async getUsersByName(name, pageSize, pageId) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return [];
    }

    let res = [];
    let offset = pageSize * (pageId - 1);

    for (let user of this.users.values()) {
      if (user.name === name) {
        res.push(user);
      }
    }

    res.sort((lhs, rhs) => lhs.id - rhs.id);
    return res.slice(offset, offset + pageSize);
  }

  async getUsersByAccountIdAndRole(accountId, role, pageSize, pageId) {
    if (!await this.checkCurrentUserRole(accountId, 1)) {
      return [];
    }

    let res = [];
    let offset = pageSize * (pageId - 1);

    for (let rule of this.accountAccessRules.values()) {
      if (rule.accountId === accountId && rule.role === role) {
        if (this.users.has(rule.userId)) {
          res.push(this.users.get(rule.userId));
        } else {
          console.error("find a not exist user when find by rule!");
        }
      }
    }

    res.sort((lhs, rhs) => lhs.id - rhs.id);
    return res.slice(offset, offset + pageSize);
  }

  async getUsersCountByAccountIdAndRole(accountId, role) {
    if (!await this.checkCurrentUserRole(accountId, 1)) {
      return 0;
    }

    let res = 0;
    for (let [_, rule] of this.accountAccessRules) {
      if (rule.accountId === accountId && rule.role === role) {
        res++;
      }
    }

    return res;
  }

  async checkUserRole(userId, accountId, role) {
    for (let [_, rule] of this.accountAccessRules) {
      if (rule.accountId === accountId && rule.userId === userId) {
        return rule.role >= role;
      }
    }

    return false;
  }

  async checkCurrentUserRole(accountId, role) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    return await this.checkUserRole(user.id, accountId, role);
  }

  async createAccount(name) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    let account = new Account(this.nextAccountId++, name, Date.now());
    this.accounts.set(account.id, account);

    let accountAccessRule = new AccountAccessRule(this.nextAccountAccessRuleId++, user.id, account.id, 2);
    this.accountAccessRules.set(accountAccessRule.id, accountAccessRule);

    return true;
  }

  async deleteAccount(id) {
    if (!await this.checkCurrentUserRole(id, 2)) {
      return false;
    }

    if (!this.accounts.delete(id)) {
      return false;
    }

    let recordsToDelete = [];
    for (let [_, record] of this.records) {
      if (record.accountId === id) {
        recordsToDelete.push(record.id);
      }
    }
    for (let recordId of recordsToDelete) {
      this.records.delete(recordId);
    }

    let rulesToDelete = [];
    for (let [_, rule] of this.accountAccessRules) {
      if (rule.accountId === id) {
        rulesToDelete.push(rule.id);
      }
    }
    for (let ruleId of rulesToDelete) {
      this.accountAccessRules.delete(ruleId);
    }

    return true;
  }

  async getAccount(id) {
    if (!await this.checkCurrentUserRole(id, 1)) {
      return null;
    }

    for (let [_, account] of this.accounts) {
      if (account.id === id) {
        return account;
      }
    }

    return null;
  }

  async getAccountsCount(role) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return 0;
    }

    let res = 0;
    for (let [_, rule] of this.accountAccessRules) {
      if (rule.userId === user.id && rule.role === role) {
        res++;
      }
    }

    return res;
  }

  async getAccounts(role, pageSize, pageId) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return [];
    }

    let res = [];
    let offset = pageSize * (pageId - 1);
    for (let [_, rule] of this.accountAccessRules) {
      if (rule.userId === user.id && rule.role === role) {
        if (this.accounts.has(rule.accountId)) {
          res.push(this.accounts.get(rule.accountId));
        } else {
          console.error("find a not exist account when find by rule!");
        }
      }
    }

    res.sort((lhs, rhs) => lhs.id - rhs.id);
    return res.slice(offset, offset + pageSize);
  }

  async updateAccountName(id, name) {
    if (!await this.checkCurrentUserRole(id, 2)) {
      return false;
    }

    if (!this.accounts.has(id)) {
      return false;
    }

    this.accounts.get(id).name = name;
    return true;
  }

  async addAccountManager(id, userId) {
    if (!await this.checkCurrentUserRole(id, 2)) {
      return false;
    }

    if (await this.checkUserRole(userId, id, 1)) {
      return false;
    }

    let rule = new AccountAccessRule(this.nextAccountAccessRuleId++, userId, id, 1);
    this.accountAccessRules.set(rule.id, rule);

    return true;
  }

  async deleteAccountManager(accountId, userId) {
    if (!await this.checkCurrentUserRole(accountId, 2)) {
      return false;
    }

    let target = -1;
    for (let [id, rule] of this.accountAccessRules) {
      if (rule.accountId === accountId && rule.userId === userId) {
        target = id;
        break;
      }
    }

    console.log(target);

    if (target !== -1) {
      this.accountAccessRules.delete(target);
    }

    return true;
  }

  async createRecord(name, type, date, amount, accountId) {
    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    if (!await this.checkUserRole(user.id, accountId, 1)) {
      return false;
    }

    let record = new Record(this.nextRecordId++, name, type, date, amount, accountId, user.id, user.id, Date.now());
    this.records.set(record.id, record);

    return true;
  }

  async deleteRecord(id) {
    if (!this.records.has(id)) {
      return false;
    }

    let record = this.records.get(id);
    if (!await this.checkCurrentUserRole(record.accountId, 1)) {
      return false;
    }

    this.records.delete(id);
    return true;
  }

  async getRecordsByAccountId(accountId, pageSize, pageId) {
    if (!await this.checkCurrentUserRole(accountId, 1)) {
      return [];
    }

    let res = [];
    let offset = pageSize * (pageId - 1);
    for (let [_, record] of this.records) {
      if (record.accountId === accountId) {
        res.push(record);
      }
    }

    res.sort((lhs, rhs) => lhs.id - rhs.id);
    return res.slice(offset, offset + pageSize);
  }

  async getRecordsCountByAccountId(accountId) {
    if (!await this.checkCurrentUserRole(accountId, 1)) {
      return 0;
    }

    let res = 0;
    for (let [_, record] of this.records) {
      if (record.accountId === accountId) {
        res++;
      }
    }

    return res;
  }

  async updateRecord(id, name, type, date, amount) {
    if (!this.records.has(id)) {
      return false;
    }

    let user = await this.verifyCurrentUser();
    if (user === null) {
      return false;
    }

    let record = this.records.get(id);
    if (!await this.checkUserRole(user.id, record.accountId, 1)) {
      return false;
    }

    record.name = name;
    record.type = type;
    record.date = date;
    record.amount = amount;
    record.lastModifiedUserId = user.id;

    return true;
  }

  async getAmountSumByAccountId(accountId) {
    let res = new BigNumber(0);

    if (!await this.checkCurrentUserRole(accountId, 1)) {
      return res.toString();
    }

    for (let [_, record] of this.records) {
      if (record.accountId === accountId) {
        res = res.plus(new BigNumber(record.amount));
      }
    }

    return res.toString();
  }
}