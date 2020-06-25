class FogApi {
  constructor(userService) {
    this.userService = userService;
  }

  async createUser(user) {
    return this.userService.create(user);
  }

  async createToken(type, user) {
    return this.userService.createToken(type, user);
  }
}

export default FogApi;
