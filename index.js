const evaluate = require('./evaluate-dependencies');

async function run() {
    await evaluate.evaluate();
}

run();