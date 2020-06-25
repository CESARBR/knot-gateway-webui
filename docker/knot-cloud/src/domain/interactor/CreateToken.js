import InvalidTokenTypeError from 'domain/interactor/InvalidTokenTypeError';

const APP_TOKEN = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTI4OTEzNTAsImlhdCI6MTU5Mjg1NTM1MCwiaXNzIjoibWFpbmZsdXg
uYXV0aG4iLCJzdWIiOiJrbm90X3Rlc3RAY2VzYXIub3JnLmJyIiwidHlwZSI6MH0.Z3duoSnBPNMpVOqyA2RKiJe0PVyxw2eBcNnYBz0ylNQ`;

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
