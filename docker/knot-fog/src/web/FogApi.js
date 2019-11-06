class FogApi {
  constructor(userService) {
    this.userService = userService;
  }

  async createUser(user) {
    return this.userService.create(user);
  }
}

export default FogApi;
