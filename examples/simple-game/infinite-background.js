class InfiniteBackground extends GameObject {
    constructor(params) {
        super(params);
        this.segmentWidth = params.width || 1280;
        this.segmentHeight = params.height || 800;
        this.stride = this.segmentWidth - 1;
        this.imageSrc = params.imageSrc;
        this.layer = params.layer || 0;
        this.segments = [];
    }

    Start() {
        for (let i = -1; i <= 1; i++) {
            const seg = new GameObject({
                position: new Vector(i * this.stride, 0),
                name: `bg_${i}`,
            });
            const image = new ImageWrapper(this.imageSrc);
            const sprite = new Sprite({
                image: image,
                width: this.segmentWidth,
                height: this.segmentHeight,
                layer: this.layer,
            });
            seg.RegisterModule(sprite);
            this.AppendChild(seg);
            this.segments.push(seg);
        }
    }

    Update() {
        const cam = Camera.GetInstance({});
        const camCenterX = cam.Position.x + 640;

        for (const seg of this.segments) {
            const segX = seg.transform.WorldPosition.x;

            if (segX < camCenterX - this.stride * 1.5) {
                seg.transform.LocalPosition = new Vector(
                    seg.transform.LocalPosition.x + this.stride * 3,
                    seg.transform.LocalPosition.y
                );
            } else if (segX > camCenterX + this.stride * 1.5) {
                seg.transform.LocalPosition = new Vector(
                    seg.transform.LocalPosition.x - this.stride * 3,
                    seg.transform.LocalPosition.y
                );
            }
        }

        super.Update();
    }
}
