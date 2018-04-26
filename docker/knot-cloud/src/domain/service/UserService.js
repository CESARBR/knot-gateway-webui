class UserService {
  constructor(createUser) {
    this.createuser = createUser;
  }

  async create(user) {
    return this.createuser.execute(user);
  }
}

export default UserService;
