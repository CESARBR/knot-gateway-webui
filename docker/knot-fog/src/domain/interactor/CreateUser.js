import EntityExistsError from 'domain/interactor/EntityExistsError';

class CreateUser {
  constructor(userGateway) {
    this.userGateway = userGateway;
  }

  async execute(user) {
    if (await this.userGateway.existsByEmail(user.email)) {
      throw new EntityExistsError(`User with e-mail '${user.email}' exists`);
    }
    return this.userGateway.create(user);
  }
}

export default CreateUser;
