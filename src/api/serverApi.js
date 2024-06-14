import axios from "axios";
import avatar from "@/assets/user_avatar.png";

const tokenKey = "star-account-access-key";

class User {
  constructor(obj) {
    this.id = obj['id'];
    this.name = obj['name'];
    this.email = obj['email'];
    this.createTime = obj['create_time'];
  }
}

class Account {
  constructor(obj) {
    this.id = obj['id'];
    this.name = obj['name'];
    this.createTime = obj['create_time'];
  }
}

class Record {
  constructor(obj) {
    this.id = obj['id'];
    this.name = obj['name'];
    this.type = obj['type'];
    this.date = obj['date'];
    this.amount = obj['amount'];
    this.accountId = obj['account_id'];
    this.createUserId = obj['create_user_id'];
    this.lastModifiedUserId = obj['last_modified_user_id'];
    this.createTime = obj['create_time'];
  }
}

export class ServerApi {
  constructor() {
    this.instance = axios.create({
      baseURL: "http://localhost:20714",
      timeout: 3000,
    });
  }

  makeRequest(path, body, useAuthorization) {
    let authorizationHeader = "";
    if (useAuthorization) {
      let token = localStorage.getItem(tokenKey);
      if (token !== null) {
        authorizationHeader = `Bearer ${token}`;
      }
    }

    return this.instance.post(path, body, {
      'headers': {
        'authorization': authorizationHeader,
      },
    });
  }

  async verifyCurrentUser() {
    try {
      let response = await this.makeRequest("/api/get-user-by-token", {}, true);
      return new User(response.data);
    } catch (err) {
      return null;
    }
  }

  async loginUser(email, password) {
    try {
      let response = await this.makeRequest("/api/login-user", {
        'email': email,
        'password': password,
      }, false);

      let token = response.data['access_token'];
      localStorage.setItem(tokenKey, token);

      return true;
    } catch {
      return false;
    }
  }

  async logoutUser() {
    localStorage.removeItem(tokenKey);
    return true;
  }

  async createUser(name, email, password) {
    try {
      await this.makeRequest("/api/create-user", {
        'name': name,
        'email': email,
        'password': password,
      }, false);

      return true;
    } catch (err) {
      return false;
    }
  }

  async updateUserName(name) {
    try {
      await this.makeRequest("/api/update-user-name", {
        'name': name,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async updateUserEmail(email) {
    try {
      await this.makeRequest("/api/update-user-email", {
        'email': email,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async updateUserPassword(password) {
    try {
      await this.makeRequest("/api/update-user-password", {
        'password': password,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async checkUserPassword(password) {
    try {
      await this.makeRequest("/api/check-user-password", {
        'password': password,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async checkUserRole(userId, accountId, role) {
    try {
      await this.makeRequest("/api/check-user-role", {
        'user_id': userId,
        'account_id': accountId,
        'role': role,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async checkCurrentUserRole(accountId, role) {
    try {
      await this.makeRequest("/api/check-current-user-role", {
        'account_id': accountId,
        'role': role,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async getUser(id) {
    try {
      let response = await this.makeRequest("/api/get-user", {
        'id': id,
      }, true);

      return new User(response.data);
    } catch {
      return null;
    }
  }

  async getUserAvatar(id) {
    return avatar;
  }

  async getUserByEmail(email) {
    try {
      let response = await this.makeRequest("/api/get-user-by-email", {
        'email': email,
      }, true);

      return new User(response.data);
    } catch {
      return null;
    }
  }

  async getUsersByName(name, pageSize, pageId) {
    try {
      let response = await this.makeRequest("/api/get-users-by-name", {
        'name': name,
        'page_size': pageSize,
        'page_id': pageId,
      }, true);

      let res = [];
      for (let item of response.data) {
        res.push(new User(item));
      }

      return res;
    } catch {
      return null;
    }
  }

  async getUsersByAccountIdAndRole(accountId, role, pageSize, pageId) {
    try {
      let response = await this.makeRequest("/api/get-users-by-account-id-and-role", {
        'account_id': accountId,
        'role': role,
        'page_size': pageSize,
        'page_id': pageId,
      }, true);

      let res = [];
      for (let item of response.data) {
        res.push(new User(item));
      }

      return res;
    } catch {
      return [];
    }
  }

  async getUsersCountByAccountIdAndRole(accountId, role) {
    try {
      let response = await this.makeRequest("/api/get-users-count-by-account-id-and-role", {
        'account_id': accountId,
        'role': role,
      }, true);

      return response.data;
    } catch {
      return 0;
    }
  }

  async createAccount(name) {
    try {
      await this.makeRequest("/api/create-account", {
        'name': name,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async deleteAccount(id) {
    try {
      await this.makeRequest("/api/delete-account", {
        'id': id,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async getAccount(id) {
    try {
      let response = await this.makeRequest("/api/get-account", {
        'id': id,
      }, true);

      return new Account(response.data);
    } catch {
      return null;
    }
  }

  async getAccountsCount(role) {
    try {
      let response = await this.makeRequest("/api/get-accounts-count", {
        'role': role,
      }, true);

      return response.data;
    } catch {
      return 0;
    }
  }

  async getAccounts(role, pageSize, pageId) {
    try {
      let response = await this.makeRequest("/api/get-accounts", {
        'role': role,
        'page_size': pageSize,
        'page_id': pageId,
      }, true);

      let res = [];
      for (let item of response.data) {
        res.push(new Account(item));
      }

      return res;
    } catch {
      return [];
    }
  }

  async updateAccountName(id, name) {
    try {
      await this.makeRequest("/api/update-account-name", {
        'id': id,
        'name': name,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async addAccountManager(id, userId) {
    try {
      await this.makeRequest("/api/add-account-manager", {
        'user_id': userId,
        'account_id': id
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async deleteAccountManager(accountId, userId) {
    try {
      await this.makeRequest("/api/delete-account-manager", {
        'user_id': userId,
        'account_id': accountId,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async createRecord(name, type, date, amount, accountId) {
    try {
      await this.makeRequest("/api/create-record", {
        'name': name,
        'record_type': type,
        'date': Math.floor(date / 1000),
        'amount': amount,
        'account_id': accountId,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async deleteRecord(id) {
    try {
      await this.makeRequest("/api/delete-record", {
        'id': id,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async getRecordsByAccountId(accountId, pageSize, pageId) {
    try {
      let response = await this.makeRequest("/api/get-records-by-account-id", {
        'account_id': accountId,
        'page_size': pageSize,
        'page_id': pageId,
      }, true);

      let res = [];
      for (let item of response.data) {
        res.push(new Record(item));
      }

      return res;
    } catch {
      return [];
    }
  }

  async getRecordsCountByAccountId(accountId) {
    try {
      let response = await this.makeRequest("/api/get-records-count-by-account-id", {
        'account_id': accountId,
      }, true);

      return response.data;
    } catch {
      return 0;
    }
  }

  async updateRecord(id, name, type, date, amount) {
    try {
      await this.makeRequest("/api/update-record", {
        'id': id,
        'name': name,
        'record_type': type,
        'date': Math.floor(date / 1000),
        'amount': amount,
      }, true);

      return true;
    } catch {
      return false;
    }
  }

  async getAmountSumByAccountId(accountId) {
    try {
      let response = await this.makeRequest("/api/get-records-amount-sum-by-account-id", {
        'account_id': accountId,
      }, true);

      return response.data;
    } catch {
      return "0.0";
    }
  }
}