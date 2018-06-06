import { Subject } from 'rxjs';

class AdapterController {
  constructor(sendPresenceInteractor) {
    this.sendPresenceInteractor = sendPresenceInteractor;
    this.deviceAddedSource = new Subject();
  }

  get deviceAdded$() {
    return this.deviceAddedSource.asObservable();
  }

  async sendPresence(id, name) {
    const device = await this.sendPresenceInteractor.execute(id, name);
    this.deviceAddedSource.next(device);
  }
}

export default AdapterController;
