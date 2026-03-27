# AudioManager

Static audio system built on the Web Audio API. Preload sounds by id, play with runtime control. Available globally from any module or game object.

## Setup

```js
// Preload during initialization (before or after engine.Start())
await AudioManager.Load('shoot', './sounds/shoot.mp3');
await AudioManager.Load('explosion', './sounds/boom.wav');
await AudioManager.Load('music', './sounds/theme.ogg');
```

The `AudioContext` is created lazily on first use and auto-resumes if the browser suspends it (autoplay policy).

## Playing Sounds

```js
// Fire and forget
AudioManager.Play('shoot');

// With options
AudioManager.Play('explosion', { volume: 0.5 });

// Looping background music
const music = AudioManager.Play('music', { loop: true, volume: 0.3 });
```

`Play()` returns a `SoundInstance` handle (or `null` if the sound isn't loaded).

## Play Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `volume` | `number` | `1` | Playback volume (0+) |
| `loop` | `boolean` | `false` | Loop the sound |
| `playbackRate` | `number` | `1` | Speed/pitch multiplier |

## SoundInstance

Returned by `AudioManager.Play()`. Controls a single playing sound.

| Property / Method | Type | Description |
|-------------------|------|-------------|
| `Volume` | `number` (get/set) | Instance volume |
| `Loop` | `boolean` (get/set) | Toggle looping while playing |
| `PlaybackRate` | `number` (get/set) | Speed/pitch multiplier |
| `IsPlaying` | `boolean` (readonly) | Whether the sound is still active |
| `Stop()` | method | Stop playback immediately |

```js
const sfx = AudioManager.Play('engine', { loop: true, volume: 0.6 });

// Adjust at runtime
sfx.Volume = 0.2;
sfx.PlaybackRate = 1.5;

// Stop when done
sfx.Stop();
```

## Global Controls

| Property / Method | Description |
|-------------------|-------------|
| `AudioManager.MasterVolume` | Get/set master volume (affects all sounds) |
| `AudioManager.StopAll()` | Stop all currently playing sounds |
| `AudioManager.IsLoaded(id)` | Check if a sound id has been loaded |
| `AudioManager.Load(id, url)` | Preload a sound, returns `Promise<void>` |

```js
AudioManager.MasterVolume = 0.5;  // half volume globally
AudioManager.StopAll();            // silence everything
```

## Notes

- Multiple simultaneous playbacks of the same sound are supported — each `Play()` call creates an independent source
- `Load()` deduplicates — calling it twice with the same id returns the existing promise/resolves immediately
- Supports any format the browser's Web Audio API can decode (MP3, WAV, OGG, etc.)
