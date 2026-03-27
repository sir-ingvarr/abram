# Math & Utilities

All math classes are exported under `Classes` (or `Abram.Classes` in the browser).

```js
const { Vector, Point, Maths, RGBAColor, PolarCoordinates, Segment, Ray, BezierCurve } = Abram.Classes;
```

---

## Vector

Extends `Point`. The primary type for positions, velocities, and directions. Instance methods **mutate** and return `this` for chaining. Static methods are **pure** and return new vectors.

### Static Properties (frozen — immutable, zero allocations)

| Property | Value | Description |
|----------|-------|-------------|
| `Vector.Up` | `(0, -1)` | Screen-up (negative Y) |
| `Vector.Down` | `(0, 1)` | Screen-down (positive Y) |
| `Vector.Left` | `(-1, 0)` | |
| `Vector.Right` | `(1, 0)` | |
| `Vector.Zero` | `(0, 0)` | |
| `Vector.One` | `(1, 1)` | |

These are `Object.freeze`'d singletons — no allocation on access, but cannot be mutated. Use the mutable variants when you need a modifiable instance:

| Property | Value | Description |
|----------|-------|-------------|
| `Vector.ZeroMutable` | `(0, 0)` | New mutable vector each access |
| `Vector.OneMutable` | `(1, 1)` | New mutable vector each access |

### Static Methods (pure — never mutate arguments)

| Method | Description |
|--------|-------------|
| `Vector.Add(first, ...rest)` | Sum vectors |
| `Vector.Subtract(first, ...rest)` | Subtract vectors |
| `Vector.MultiplyCoordinates(base, other)` | Component-wise multiply (`base` can be a number) |
| `Vector.DivideCoordinates(base, other)` | Component-wise divide |
| `Vector.Dot(v1, v2)` | Dot product |
| `Vector.Distance(from, to)` | Euclidean distance |
| `Vector.AngleBetween(v1, v2)` | Angle in radians |
| `Vector.Angle(from, to)` | Difference of angles |
| `Vector.Rotate(vector, angleRad)` | Rotate by angle |
| `Vector.LerpBetween(p1, p2, factor)` | Linear interpolation |
| `Vector.SameVectors(v1, v2)` | Equality within epsilon |
| `Vector.From(source)` | Create from any `{x, y}` |
| `Vector.Of(x, y?)` | Create from numbers |

### Instance Methods (mutating — return `this`)

| Method | Description |
|--------|-------------|
| `Add(other)` | Add in-place |
| `Subtract(other)` | Subtract in-place |
| `MultiplyCoordinates(base)` | Scale in-place (number or `{x,y}`) |
| `DivideCoordinates(base)` | Divide in-place |
| `Rotate(angleRad)` | Rotate in-place |
| `SetMagnitude(mag)` | Set length, preserve direction |
| `Mirror(x?, y?)` | Flip axes |
| `Clamp(x?, y?)` | Clamp to ranges `[min, max]` |
| `ToBinary()` | Sign vector `(-1, 0, or 1)` per axis |
| `Copy()` | New vector with same values |

### Instance Properties

| Property | Type | Description |
|----------|------|-------------|
| `Magnitude` | `number` | Length (get/set) |
| `Angle` | `number` | Angle in radians (atan2) |
| `Normalized` | `Vector` | Unit vector copy |

---

## Point

Base class for 2D coordinates.

```js
const p = new Point(10, 20);
const p2 = Point.From({ x: 5, y: 5 });
const p3 = Point.Of(3, 4);
```

| Method | Description |
|--------|-------------|
| `Set(x, y?)` | Set coordinates (y defaults to x) |
| `SetFrom(other)` | Copy from another point |
| `Copy()` | Clone |
| `ToVector()` | Convert to Vector |
| `ToArray()` | Returns `[x, y]` |

---

## PolarCoordinates

Polar representation with conversion to/from Cartesian.

```js
// From polar
const polar = new PolarCoordinates({ r: 100, angle: Math.PI / 4 });
const point = polar.ToCartesian(); // Point

// From cartesian
const polar2 = PolarCoordinates.From({ x: 50, y: 50 });
```

---

## Maths

Static utility methods.

| Method | Description |
|--------|-------------|
| `Maths.Clamp(val, min, max)` | Constrain value to range |
| `Maths.Lerp(from, to, factor)` | Linear interpolation |
| `Maths.GetLerpFactor(from, to, value)` | Inverse lerp — get factor from value |
| `Maths.RandomRange(from, to, int?)` | Random in range (set `int=true` for integers) |
| `Maths.IsValidNumber(variable)` | True if `typeof number` and not `NaN` |

---

## RGBAColor

Color with red, green, blue, alpha channels (0-255 each).

```js
const red = new RGBAColor(255, 0, 0, 255);
const fromHex = RGBAColor.FromHex('#ff3b3bff');
const transparent = RGBAColor.Transparent();
```

### Methods

| Method | Description |
|--------|-------------|
| `LerpTo(color, factor)` | Interpolate to another color, returns new RGBAColor |
| `ToHex()` | `#rrggbbaa` string |
| `toString()` | `rgba(r,g,b,a)` string |
| `Copy()` | Clone |

### Properties (get/set)

`Red`, `Green`, `Blue`, `Alpha` — setting any channel updates the internal hex cache and fires `OnUpdated`.

---

## Segment

A line segment between two points.

```js
const seg = new Segment(new Point(0, 0), new Point(100, 50));
seg.Length;            // euclidean length
seg.Width;             // |from.x - to.x|
seg.Height;            // |from.y - to.y|
seg.HasPoint(p);       // is point on segment?
seg.getIntersection(other);  // intersection point or null
```

---

## Ray

A ray from a point at an angle.

```js
const ray = new Ray(new Point(0, 0), Math.PI / 4);
ray.ToUnitVector();        // direction as unit Vector
ray.IsPointOnRay(point);   // is point along this ray?
ray.To;                    // endpoint at unit distance
```

---

## BezierCurve

Quadratic Bezier curve through three control points.

```js
const curve = new BezierCurve(
    new Point(0, 0),
    new Point(50, 100),   // control point
    new Point(100, 0),
);

// Evaluate at factor 0..1
const midpoint = curve.Eval(0.5);  // {x, y}
```

---

## Collections

### Iterator\<T\>

Iterable with optional infinite looping (used internally by Animator).

```js
const iter = new Iterator({ data: [1, 2, 3], infinite: true });
iter.Next;    // { value: 1, done: false, index: 0 }
```

### List\<T\>, Queue\<T\>, Stack\<T\>

Standard collection types extending Iterator with `Push`, `Remove`/`Shift`/`Pop`, and `SearchAndRemove`.
