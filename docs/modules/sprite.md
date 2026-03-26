# Sprite

Renders an image on screen. Adds itself to the render queue each frame. `canBeDuplicated = false`.

## Usage

```js
const image = new ImageWrapper('./character.png');
const sprite = new Sprite({
    image: image,
    width: 64,
    height: 64,
    layer: 1,
});
this.RegisterModule(sprite);
```

## Constructor Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `image` | `ImageWrapper` | **required** | The image to render |
| `width` | `number` | `100` | Display width in pixels |
| `height` | `number` | `100` | Display height in pixels |
| `layer` | `number` | `0` | Render order (higher layers draw on top) |

## ImageWrapper

Loads and caches an image by URL:

```js
const img = new ImageWrapper('./assets/hero.png');
```

The image loads asynchronously. `img.isReady` becomes `true` when loaded. The Sprite handles this automatically -- it skips rendering until the image is ready.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `Width` | `number` (readonly) | Display width |
| `Height` | `number` (readonly) | Display height |
| `ImageId` | `string` (readonly) | Image URL/identifier |
| `layer` | `number` | Render layer |
| `image` | `ImageWrapper` | The loaded image |
