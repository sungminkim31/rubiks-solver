import Cube from 'cubejs';
Cube.initSolver();
const cube = Cube.random();
const sol = cube.solve();
console.log("Sol length:", sol.split(' ').length);
console.log("Sol string:", sol);
