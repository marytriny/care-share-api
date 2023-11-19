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
    return this._query(`SELECT * FROM Accounts WHERE email = '${email}'`);
  }

  async getOrganizationDetails(organization) {
    return this._query(
      `SELECT id, role, email, organization, phone, poc_name, poc_phone, 
        address + ' ' + city + ' ' + state + ' ' + zip_code as address
      FROM Accounts WHERE organization = '${organization}'`
    );
  }
  
  async getAllDistributors() {
    return this._query(
      `SELECT organization, zip_code, address + ' ' + city + ' ' + state + ' ' + zip_code as address 
      FROM Accounts WHERE role = 'DISTRIBUTOR'`);
  }

  async getAllDonors() {
    return this._query(
      `SELECT organization, zip_code, address + ' ' + city + ' ' + state + ' ' + zip_code as address 
      FROM Accounts WHERE role = 'DONOR'`);
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
    const { item, quantity, value, donor, address, city, state, zip_code, poc_name, 
      poc_phone, notes, from_date, to_date } = donation;

    return this._query(
      `INSERT INTO Donations (item, quantity, value, donor, address, city, state,
        zip_code, poc_name, poc_phone, notes, from_date, to_date, status)
      VALUES ( '${item}', ${Number(quantity)}, ${Number(value)}, '${donor}', '${address}',
      '${city}', '${state}', '${zip_code}', '${poc_name}', '${poc_phone}', 
      '${notes}', '${from_date}', '${to_date}', 'PENDING' )`
    );
  }

  async updateDonation(donation) {
    const { id, item, quantity, value, address, city, state, zip_code, poc_name, 
      poc_phone, notes, from_date, to_date } = donation;

    return this._query(
      `UPDATE Donations SET item='${item}', quantity=${Number(quantity)},
        value=${Number(value)}, address='${address}', city='${city}', state='${state}',
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

  async getDonorDonations(donor) {
    return this._query(`SELECT * FROM Donations WHERE donor='${donor}' ORDER BY from_date DESC`);
  }

  async getPendingDonations() {
    return this._query(
      `SELECT id, item, quantity, value, donor, from_date, to_date, distributor, status, 
      poc_name, poc_phone, notes, address + ' ' + city + ' ' + state + ' ' + zip_code as address
     FROM Donations WHERE status='PENDING' ORDER BY from_date DESC`);
  }

  async getAcceptedDonations(distributor) {
    return this._query(
      `SELECT id, item, quantity, value, donor, from_date, to_date, distributor, status, 
      poc_name, poc_phone, notes, address + ' ' + city + ' ' + state + ' ' + zip_code as address 
      FROM Donations WHERE distributor='${distributor}' AND status='ACCEPTED' ORDER BY from_date DESC`);
  }

  async getCompletedDonations(distributor) {
    return this._query(
      `SELECT id, item, quantity, value, donor, from_date, to_date, distributor, status, 
      poc_name, poc_phone, notes, address + ' ' + city + ' ' + state + ' ' + zip_code as address 
      FROM Donations WHERE distributor='${distributor}' AND status='COMPLETED' ORDER BY from_date DESC`);
  }

  async updateExpiredDonations() {
    return this._query(`UPDATE Donations SET status = 'EXPIRED' WHERE status = 'PENDING' AND to_date < GETDATE()`);
  }

  async donorOfTheWeek() {
    return this._query(
      `SELECT TOP 1 donor
      FROM Donations
      WHERE status='COMPLETED' 
        AND from_date >= dateadd(day, 1-datepart(dw, getdate()), CONVERT(date,getdate())) 
        AND from_date <  dateadd(day, 8-datepart(dw, getdate()), CONVERT(date,getdate()))
      GROUP BY donor
      ORDER BY SUM(value) desc`
    );
  }

  async distributorOfTheWeek() {
    return this._query(
      `SELECT TOP 1 distributor
      FROM Donations
      WHERE status='COMPLETED' 
        AND from_date >= dateadd(day, 1-datepart(dw, getdate()), CONVERT(date,getdate())) 
        AND from_date <  dateadd(day, 8-datepart(dw, getdate()), CONVERT(date,getdate()))
      GROUP BY distributor
      ORDER BY SUM(value) desc`
    );
  }

  async allDistributorsContributions() {
    return this._query(
      `SELECT distributor, SUM(value) as value
      FROM Donations
      WHERE status='COMPLETED' 
      GROUP BY distributor
      ORDER BY SUM(value) desc`
    );
  }
  
  async allDonationsOverTime() {
    return this._query(
      `SELECT SUM(value) value, from_date
      FROM (SELECT value, Format(from_date, 'MM/dd') from_date FROM Donations WHERE status='COMPLETED') t
      GROUP BY from_date`
    );
  }

  async donorDonationsOverTime(donor) {
    return this._query(
      `SELECT SUM(value) value, from_date
      FROM (
        SELECT value, Format(from_date, 'MM/dd') from_date 
        FROM Donations
        WHERE status='COMPLETED' AND donor='${donor}'
      ) t
      GROUP BY from_date`
    );
  }

  async distributorDonationsOverTime(distributor) {
    return this._query(
      `SELECT SUM(value) value, from_date
      FROM (
        SELECT value, Format(from_date, 'MM/dd') from_date 
        FROM Donations
        WHERE status='COMPLETED' AND distributor='${distributor}'
      ) t
      GROUP BY from_date`
    );
  }
}
