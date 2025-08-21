/**
 * @File:GeneratorManager.js
 * @Date:2025/4/2 下午12:07:46
 */
export class WaitTimer {
    constructor() {
        this.lastTime = 0;
        this.waitTime = 0;
    }

    *delay(ms) {
        const startTime = performance.now(); // 或用 Date.now()
        while (performance.now() - startTime < ms) {
            yield;
        }
    }
}

export class GeneratorManager {
    constructor() {
        this.generators = new Set();
    }

    start(generator) {
        this.generators.add(generator);
        return generator;
    }
    clearAll(){
        this.generators.clear();
    }
    remove(generator) {
        this.generators.delete(generator);
    }

    update( ) {
        for (const gen of this.generators) {
            if(!gen) {
                continue;
            }
            if (gen.next( ).done) {
                this.generators.delete(gen);
            }
        }
    }
}