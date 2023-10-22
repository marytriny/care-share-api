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

  /****************************************************************************
   * Query Accounts table
   ****************************************************************************/
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
  
  /****************************************************************************
   * Query Donations table
   ****************************************************************************/
  async addDonation(donation) {
    const { item, quantity, donor, address, city, state, zip_code, poc_name, 
      poc_phone, notes, from_date, to_date } = donation;

    return this._query(
      `INSERT INTO Donations (item, quantity, donor, address, city, state,
        zip_code, poc_name, poc_phone, notes, from_date, to_date, status)
      VALUES ( '${item}', ${Number(quantity)}, '${donor}', '${address}',
      '${city}', '${state}', '${zip_code}', '${poc_name}', '${poc_phone}', 
      '${notes}', '${from_date}', '${to_date}', 'PENDING' )`
    );
  }

  async updateDonation(donation) {
    const { id, item, quantity, address, city, state, zip_code, poc_name, 
      poc_phone, notes, from_date, to_date } = donation;

    return this._query(
      `UPDATE Donations SET item='${item}', quantity=${Number(quantity)},
        address='${address}', city='${city}', state='${state}',
        zip_code='${zip_code}', poc_name='${poc_name}', poc_phone='${poc_phone}',
        notes='${notes}', from_date='${from_date}', to_date='${to_date}'
      WHERE id = ${id}`
    );
  }

  async updateDonationStatus(donation) {
    const { id, status, distributor } = donation;
    return this._query(
      `UPDATE Donations SET distributor='${distributor}', status='${status}' WHERE id = ${id}`);
  }

  async getPendingDonations() {
    return this._query(`SELECT * FROM Donations WHERE status='PENDING'`);
  }

  async getAcceptedDonations(distributor) {
    return this._query(
      `SELECT * FROM Donations WHERE status='ACCEPTED' AND distributor='${distributor}'`);
  }

  async getDonorDonations(donor) {
    return this._query(`SELECT * FROM Donations WHERE donor='${donor}' ORDER BY id DESC`);
  }
}
