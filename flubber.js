class Flubber {
  constructor() {
    this.el = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.worker = null;
    this.FPS = 30;
    this.mod = 40;
    this.pi = Math.PI;
    this.numPoints = 20;
    this.noise = [];

    this.applyStyle();
    this.path = this.generateInitPath();
    this.draw();
    this.initWorker();
    return this.el;
  }

  applyStyle() {
    this.el.setAttribute("fill", "lightgreen");
    this.el.setAttribute("stroke", "black");
    this.el.setAttribute("stroke-width", "1");
  }

  generateInitPath() {
    const step = 2 / this.numPoints;
    let points = [];
    for (let i = 0.0; i <= 2; i += step) {
      let mod = Math.floor(Math.random() * 10 + this.mod);
      const x = parseFloat((Math.sin(i * this.pi) * mod).toFixed(2));
      const y = parseFloat((Math.cos(i * this.pi) * mod).toFixed(2));
      points.push([x, y]);
    }
    return points;
  }

  initWorker() {
    this.worker = new Worker("worker.js");
    this.worker.postMessage("Hello World");
  }

  randomNoise(points, noise) {
    //if (this.noise.length == 0) this.noise.push({ p: 0, x: 3, y: 3 });
    let addNoise = Math.floor(Math.random() * 10) >= 2;
    if (addNoise) {
      const index = Math.floor(Math.random() * this.numPoints);
      if (!noise.find(n => n.p === index) && points[index]) {
        let dmod = Math.floor(Math.random() * 10 + this.mod);
        const step = (2 / this.numPoints) * 0.1;
        let drad = step * Math.floor(Math.random() * 10 - 5);
        const x = parseFloat(
          (
            Math.sin(((2 * index) / this.numPoints + drad) * this.pi) * dmod
          ).toFixed(2)
        );
        const y = parseFloat(
          (
            Math.cos(((2 * index) / this.numPoints + drad) * this.pi) * dmod
          ).toFixed(2)
        );
        noise.push({ p: index, x: x, y: y });
      }
    }
  }

  setNoise() {
    for (let i = 0; i < this.noise.length; i++) {
      let p = this.path[this.noise[i].p];
      const diff = [
        Math.abs(this.noise[i].x - p[0]),
        Math.abs(this.noise[i].y - p[1])
      ];
      const step = [
        diff[0] >= 0.05 ? 0.05 : 0.01,
        diff[1] >= 0.05 ? 0.05 : 0.01
      ];
      if (p && diff[0] === 0.0 && diff[1] === 0.0) {
        this.worker.postMessage(this.noise);
        this.noise.splice(i, 1);
      } else if (p) {
        if (this.noise[i].x > p[0]) {
          p[0] = parseFloat((p[0] + step[0]).toFixed(2));
        } else if (this.noise[i].x < p[0]) {
          p[0] = parseFloat((p[0] - step[0]).toFixed(2));
        }
        if (this.noise[i].y > p[1]) {
          p[1] = parseFloat((p[1] + step[1]).toFixed(2));
        } else if (this.noise[i].y < p[1]) {
          p[1] = parseFloat((p[1] - step[1]).toFixed(2));
        }
        //console.log(JSON.stringify(p));
      }
    }
  }

  draw() {
   
    let self = this;
    setTimeout(() => {
      requestAnimationFrame(self.draw.bind(self));
      self.randomNoise(self.path, self.noise);
      self.setNoise();
      let str = `M ${self.path[0][0]} ${self.path[0][1]}`;
      for (let i = 1; i < self.path.length; i = i + 1) {
        var current, previous, next;
        current = self.path[i];
        previous = self.path[i - 1];
        if (i < self.path.length - 1) {
          next = self.path[i + 1];
        } else {
          next = self.path[0];
        }
        var quota = -0.1;
        var median = [
          (current[0] - previous[0] * quota) / (1 + quota),
          (current[1] - previous[1] * quota) / (1 + quota)
        ];
        str += ` C ${previous} ${median} ${current} `;
      }

      self.el.setAttribute("d", str + " Z");
    }, 1000 / 60);
  }
}

export default Flubber;
