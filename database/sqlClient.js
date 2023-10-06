const sql = require('mssql');
const config = require('./config');

module.exports = class SqlClient {

  // Query database
  async _query(sqlQuery) {
    try{
      const pool = await sql.connect(config);
      return pool.request().query(sqlQuery);
    }
    catch(error) {
      console.log(error);
      return error;
    }
  }

  async getAccounts() {
    return this._query('SELECT * FROM Accounts');
  }

  async addAccount(user) {
    const { role, email, password, active } = user;
    return this._query(
      `INSERT INTO Accounts (role, email, password_hash, active)
      VALUES ( '${role}', '${email}', '${password}', ${active} )`
    );
  }

  async getAccount(email) {
    return this._query(
      `SELECT id, role, organization, active, password_hash 
      FROM Accounts WHERE email = '${email}'`
    );
  }
}
