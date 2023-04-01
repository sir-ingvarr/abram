import Engine, * as Contents from './index';

const Abram =  Object.assign({}, {
	Engine, ...Contents
});

Object.assign(global, { Abram });
