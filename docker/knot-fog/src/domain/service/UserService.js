class UserService {
  constructor(createUser, createUserToken) {
    this.createUser = createUser;
    this.createUserToken = createUserToken;
  }

  async create(user) {
    return this.createUser.execute(user);
  }

  async createToken(user) {
    return this.createUserToken.execute(user);
  }
}

export default UserService;
