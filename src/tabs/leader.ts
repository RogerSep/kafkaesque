import { Observable } from "rx"
import * as R from "ramda";

let l: () => void = null;

const tabId: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  .replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

function runIfLeader() {
  const leader = localStorage.getItem("kafkaesque-ui.leader");

  if (R.either(R.equals(tabId), R.either(R.isNil, R.isEmpty))(leader)) {
    localStorage.setItem("kafkaesque-ui.leader", tabId);
    l()
  }
}

function leader(heartbeat: Observable<any>): (f: () => void) => void {
  return function(f: () => void): void {
    if (l == null) {
      l = R.once(f);
      heartbeat.subscribe( runIfLeader );
      runIfLeader()
    }
  }
}

Observable.fromEvent(window, "unload").subscribe( () => {
  if (localStorage.getItem("kafkaesque-ui.leader") == tabId) {
    localStorage.setItem("kafkaesque-ui.leader", "")
  }
} );

export { leader };