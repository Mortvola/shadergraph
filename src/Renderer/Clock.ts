import { observable, runInAction } from "mobx";

class Clock {
  previousTimestamp: number | null = null;

  systemStartTime: number | null = null;

  systemTime: number | null = null;

  startTime = 0;

  timestamp = 0;

  elapsedTime = 0;

  accumulatedTime = 0;

  @observable
  accessor paused = false;

  update(timestamp: number) {
    if (!this.paused) {
      if (this.systemStartTime === null) {
        this.systemStartTime = timestamp;
      }
  
      this.systemTime = timestamp;

      this.timestamp = this.systemTime - this.systemStartTime + this.accumulatedTime;

      this.elapsedTime = (this.timestamp - (this.previousTimestamp ?? this.timestamp)) / 1000.0;
  
      this.previousTimestamp = this.timestamp;

      // console.log(this.timestamp)
    }
    else {
      this.elapsedTime = 0;
    }
  }

  pause() {
    runInAction(() => {
      this.paused = true;
    })
  }

  play() {
    runInAction(() => {
      this.paused = false;
      if (this.systemTime !== null && this.systemStartTime !== null) {
        this.accumulatedTime += this.systemTime - this.systemStartTime;
      }
      this.systemStartTime = null;  
    })
  }

  togglePlay() {
    runInAction(() => {
      this.paused = !this.paused;

      if (!this.paused) {
        if (this.systemTime !== null && this.systemStartTime !== null) {
          this.accumulatedTime += this.systemTime - this.systemStartTime;
        }
        this.systemStartTime = null;  
      }  
    })
  }

  restart() {
    runInAction(() => {
      this.timestamp = 0;
      this.systemStartTime = null;
      this.systemTime = null;
      this.accumulatedTime = 0;  
    })
  }

  skipBack() {

  }
}

export default Clock;
