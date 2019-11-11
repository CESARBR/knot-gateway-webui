import UserSchema from 'data/UserSchema';
import { throws } from 'assert';

const USER_NAME = 'User';

class MongoUserGateway {
  constructor(connection) {
    this.connection = connection;
  }

  async existsByEmail(email) {
    return await this.connection.count(USER_NAME, UserSchema, { email }) > 0;
  }

  async create(user) {
    return this.connection.save(USER_NAME, UserSchema, user);
  }

  async update(user) {
    return this.connection.findOneAndUpdate(USER_NAME, UserSchema, { email: user.email }, user)
  }
}

export default MongoUserGateway;
