class UserService {
  constructor(createUserInteractor, createTokenInteractor) {
    this.createUserInteractor = createUserInteractor;
    this.createTokenInteractor = createTokenInteractor;
  }

  async createToken(type, user) {
    return this.createTokenInteractor.execute(type, user);
  }

  async create(user) {
    return this.createUserInteractor.execute(user);
  }
}

export default UserService;
