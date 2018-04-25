import UserSchema from 'data/UserSchema';

const USER_NAME = 'User';

class MongoUserGateway {
  constructor(connection) {
    this.connection = connection;
  }

  async existsByUuid(uuid) {
    return await this.connection.count(USER_NAME, UserSchema, { uuid }) > 0;
  }

  async existsByEmail(email) {
    return await this.connection.count(USER_NAME, UserSchema, { 'user.email': email }) > 0;
  }

  async create(device) {
    return this.connection.save(USER_NAME, UserSchema, device);
  }
}

export default MongoUserGateway;
