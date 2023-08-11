import Engine, * as Contents from './index';

const Abram =  {
	Engine, ...Contents
};

Object.assign(global, { Abram });
