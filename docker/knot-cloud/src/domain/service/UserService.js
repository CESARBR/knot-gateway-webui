class UserService {
  constructor(createUser) {
    this.createUser = createUser;
  }

  async create(user) {
    return this.createUser.execute(user);
  }
}

export default UserService;
