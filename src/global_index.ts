import Engine,
{
	GraphicPrimitives, Shapes, ImageWrapper, Camera, GameObject,
	InputSystem, CursorInputSystem, Animator, Sprite, Classes, Time, RigidBody,
	ParticleSystem, Collision, Collider2D, ParticleSystemAssets, TrailRenderer,
	CollisionDetection, PhysicsMaterial, CollisionsManager, Debug, CursorInputAssets,
	UIText, UIRect, UIElement,
	AudioManager, AudioAssets,
} from './index';

const Abram =  {
	Engine, GameObject, InputSystem, CursorInputSystem, Animator, Sprite,
	Classes, Camera, Time, RigidBody, ParticleSystem, ImageWrapper,
	GraphicPrimitives, Shapes, Collision, Collider2D, ParticleSystemAssets,
	TrailRenderer, CollisionDetection, PhysicsMaterial, CollisionsManager, Debug,
	CursorInputAssets, UIText, UIRect, UIElement,
	AudioManager, AudioAssets,
};

Object.assign(global, { Abram });
