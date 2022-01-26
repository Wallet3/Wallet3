import { action, computed, makeObservable, observable } from 'mobx';

import { Browser } from '../Browser';
import { PageMetadata } from '../Web3View';

export class TabBrowserController {
  pages = new Map<number, PageMetadata | undefined>();
  tabs: JSX.Element[] = [];
  activeTabIndex = 0;

  get activeTab() {
    return this.tabs[this.activeTabIndex];
  }

  constructor() {
    makeObservable(this, {
      tabs: observable,
      activeTabIndex: observable,
      addTab: action,
      activeTab: computed,
      setActiveTab: action,
    });
  }

  addTab(tab: JSX.Element) {
    this.tabs.push(tab);
  }

  setTab(index: number, pageMetadata?: PageMetadata) {
    this.pages.set(index, pageMetadata);
  }

  setActiveTab(index: number) {
    this.activeTabIndex = index;
  }
}
