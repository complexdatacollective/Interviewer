'use strict';

import NCNode from './nodes';
import Network from './network';

let node = new NCNode('Josh');
let network = new Network();

console.log(network);

network.addNode({name: 'Josh'});

console.log(network);

console.log('JOSH');
