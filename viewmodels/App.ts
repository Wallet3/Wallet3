import { makeObservable } from 'mobx';

class App {
  constructor() {
    makeObservable(this);
  }
}
