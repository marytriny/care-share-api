class Account {
  constructor(
    id, 
    role, 
    email, 
    password_hash, 
    organization, 
    address, 
    city, 
    state, 
    zip_code, 
    phone, 
    poc_name, 
    poc_phone, 
    active
  ) {
    this.id = id
    this.role = role, 
    this.email = email, 
    this.password_hash = password_hash, 
    this.organization = organization, 
    this.address = address, 
    this.city = city,
    this.state = state, 
    this.zip_code = zip_code, 
    this.phone = phone, 
    this.poc_name = poc_name, 
    this.poc_phone = poc_phone, 
    this.active = active
  }
}

module.exports = Account;
