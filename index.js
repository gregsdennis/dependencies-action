// const evaluate = require('./evaluate-dependencies');

import {evaluate} from "./evaluate-dependencies.js";

async function run() {
    await evaluate();
}

run();