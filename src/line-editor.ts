import Konva from "konva";

export class LineEditor extends Konva.Group {
    private line?: Konva.Line;
    private pointCount = 0;

    attach(line: Konva.Line) {
        this.line = line;
        line.on('pointsChange', () => {
            this.update()
        })
        this.update()
    }

    update() {
        const points = this.line!.points();
        let previous = -1;
        for (let i = 0; i < points.length / 2; i++) {
            this.get(i, 'anchor').setAttrs({x: points[i * 2], y: points[i * 2 + 1]});
            if (previous !== -1) {
                this.get(i, 'control').setAttrs({
                    x: points[previous * 2] + (points[i * 2] - points[previous * 2]) / 2,
                    y: points[previous * 2 + 1] + (points[i * 2 + 1] - points[previous * 2 + 1]) / 2
                })
            }
            previous = i
        }
        for (let i = points.length / 2; i < this.pointCount; i++) {
            this.findOne(`.${i}-anchor`).destroy()
            this.findOne(`.${i}-control`).destroy()
        }
        this.pointCount = points.length / 2;

    }

    private get(index: number, type: string) {
        return this.findOne(`.${index}-${type}`) || this.create(index, type)
    }

    private create(index: number, type: string) {
        const point = new Konva.Circle({name: `${index}-${type}`, radius: 10, draggable: true, fill: 'red'})
        if (type === 'anchor') {
            point.on('dragmove', (e) => {
                const points = this.line!.points();
                points[index * 2] = e.target.x();
                points[index * 2 + 1] = e.target.y();
                this.line!.points(points)
            }).on('dblclick', () => {
                const points = this.line!.points();
                points.splice(index * 2, 2)
                return this.line!.points(points)
            }).setAttrs({
                fill: 'red',
            })
        } else {
            point.on('dragmove', (e) => {
                const points = this.line!.points();
                points.splice(index * 2, 0, e.target.x(), e.target.y())
                this.line!.points(points)
                e.target.stopDrag()
                e.target.getParent().findOne(`.${index}-anchor`).startDrag(e)
            }).setAttrs({
                fill: 'green',
                radius: 8,
            })
        }

        this.add(point)
        return point;
    }
}
