class UserService {
  constructor(createUser, createUserToken) {
    this.createUser = createUser;
    this.createUserToken = createUserToken;
  }

  async create(user) {
    return this.createUser.execute(user);
  }

  async createToken(type, user) {
    return this.createUserToken.execute(type, user);
  }
}

export default UserService;
