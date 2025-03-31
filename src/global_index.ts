import Engine,
{
	GraphicPrimitives, Shapes, ImageWrapper, Camera, GameObject,
	InputSystem, Animator, Sprite, Classes, Time, RigidBody,
	ParticleSystem, Collision, Collider2D, ParticleSystemAssets, TrailRenderer,
} from './index';

const Abram =  {
	Engine, GameObject, InputSystem, Animator, Sprite,
	Classes, Camera, Time, RigidBody, ParticleSystem, ImageWrapper,
	GraphicPrimitives, Shapes, Collision, Collider2D, ParticleSystemAssets,
	TrailRenderer
};

Object.assign(global, { Abram });
