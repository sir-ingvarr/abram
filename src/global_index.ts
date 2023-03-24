import Engine,
{
	GraphicPrimitives, Shapes, ImageWrapper, Camera, GameObject,
	InputSystem, Animator, Sprite, Classes, Time, RigidBody,
	ParticleSystem, Collision, Collider2D
} from './index';

const Abram =  Object.assign({}, {
	Engine, GameObject, InputSystem, Animator, Sprite,
	Classes, Camera, Time, RigidBody, ParticleSystem, ImageWrapper,
	GraphicPrimitives, Shapes, Collision, Collider2D
});

Object.assign(window, { Abram });
