import InvalidTokenTypeError from 'domain/interactor/InvalidTokenTypeError';

const APP_TOKEN = `eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWU
sImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh`;

class CreateToken {
  constructor(userGateway) {
    this.userGateway = userGateway;
  }

  async execute(type, user) {
    if (type !== 'user' && type !== 'app') {
      throw new InvalidTokenTypeError("only 'user' and 'app' token types are supported");
    }

    return { token: APP_TOKEN };
  }
}

export default CreateToken;
