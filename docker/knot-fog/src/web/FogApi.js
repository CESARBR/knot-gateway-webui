class FogApi {
  constructor(userService) {
    this.userService = userService;
  }

  async createUser(user) {
    return this.userService.create(user);
  }

  async createToken(user) {
    return this.userService.createToken(user);
  }
}

export default FogApi;
