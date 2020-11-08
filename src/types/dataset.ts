export interface Point
{
    x: number;
    y: number;
}

export class Dataset
{
    readonly values: number[] = [];
    readonly xCount: number = 0;
    readonly yMin: number = 0;
    readonly yMax: number = 0;
    readonly points: Point[] = [];
    readonly color: string = '';

    constructor(arr: number[], color: string, yMin: number | 'auto', yMax: number | 'auto')
    {
        this.values = [...arr];
        this.xCount = this.values.length;

        if(yMin === 'auto')
        {
            this.yMin = this.values.reduce((min, x) => x < min ? x : min, Number.POSITIVE_INFINITY);
        }
        else
        {
            this.yMin = yMin;
        }

        if(yMax === 'auto')
        {
            this.yMax = this.values.reduce((max, x) => x > max ? x : max, 0);
        }
        else
        {
            this.yMax = yMax;
        }
        
        this.points = this.values.map((value, i) =>
        {
            const x = scaleRange(0, this.xCount - 1, 0, 1, i);
            const y = scaleRange(this.yMin, this.yMax, 0, 1, value);

            return {x, y}
        });

        this.color = color;
    }
}

function scaleRange(fromMin: number, fromMax: number, toMin: number, toMax: number, x: number): number
{
    return (((toMax - toMin) * (x - fromMin)) / (fromMax - fromMin)) + toMin;
}