import flatten from '../flatten';

function mapStatusToDBusStatus(status) {
  return flatten(status);
}

class NetworkAdapterController {
  constructor(getStatusInteractor) {
    this.getStatusInteractor = getStatusInteractor;
  }

  async getStatus(adapterId) {
    const status = await this.getStatusInteractor.execute(adapterId);
    return mapStatusToDBusStatus(status);
  }
}

export default NetworkAdapterController;
