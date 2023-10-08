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

  async getAccount(email) {
    return this._query(
      `SELECT id, role, email, organization, address, city, state, zip_code,
      phone, poc_name, poc_phone, active, password_hash 
      FROM Accounts WHERE email = '${email}'`
    );
  }

  async addAccount(user) {
    const { role, email, password, organization, address,
      city, state, zip_code, phone, poc_name, poc_phone, active } = user;

    return this._query(
      `INSERT INTO Accounts (role, email, password_hash, organization, address,
        city, state, zip_code, phone, poc_name, poc_phone, active)
      VALUES ( '${role}', '${email}', '${password}', '${organization}', '${address}',
      '${city}', '${state}', '${zip_code}', '${phone}', '${poc_name}', '${poc_phone}', ${active} )`
    );
  }

  async updateAccount(user) {
    console.log(user)
    const { id, role, email, organization, address, city, state, zip_code, 
      phone, poc_name, poc_phone } = user;

    return this._query(
      `UPDATE Accounts SET role='${role}', email='${email}', organization='${organization}',
      address='${address}', city='${city}', state='${state}', zip_code='${zip_code}',
      phone='${phone}', poc_name='${poc_name}', poc_phone='${poc_phone}'
      WHERE id = ${id}`
    );
  }

  async updateAccountPassword(id, password_hash) {
    return this._query(
      `UPDATE Accounts SET password_hash='${password_hash}'
      WHERE id = ${id}`
    );
  }
}
