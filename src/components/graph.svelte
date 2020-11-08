<script lang="typescript">

import type {Point, Dataset} from '../types/dataset';

export let datasets: Dataset[] = [];
export let graphWidth = 600;
export let graphHeight = 400;

function getLineStyle(pointA: Point, pointB: Point): string
{
    const a = normalizedToAbsolute(pointA);
    const b = normalizedToAbsolute(pointB);

    const xDiff = b.x - a.x;
    const yDiff = b.y - a.y;

    const tg = yDiff / xDiff;
    const deg = Math.atan(tg) * 180 / Math.PI * -1;

    const len = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

    return `
        left: ${a.x}px;
        bottom: ${a.y}px;
        transform: rotate(${deg}deg);
        width: ${len}px;
    `;
}

function getPointStyle(point: Point): string
{
    const {x, y} = normalizedToAbsolute(point);
    
    return `
        left: ${x}px;
        bottom: ${y}px;
    `;
}

function normalizedToAbsolute(a: Point): Point
{
    return {
        x: a.x * graphWidth,
        y: a.y * graphHeight,
    }
}

</script>

<template>
    <div class="wrapper">
        <div
            class="graph"
        >
            {#each datasets as dataset}
                {#each dataset.points as point, i}
                    <div
                        class="point"
                        style={getPointStyle(point) + `--color: ${dataset.color};`}
                    ></div>
                    {#if i < dataset.points.length - 1}
                        <div
                            class="line"
                            style={getLineStyle(point, dataset.points[i + 1]) + `--color: ${dataset.color};`}
                        ></div>
                    {/if}
                {/each}
            {/each}
        </div>
    </div>
</template>

<style lang="scss">

@import '../styles/vars.scss';

$point-radius: 8px;
$line-width: 4px;

.wrapper
{
    overflow: hidden;
}

.graph
{
    margin: $point-radius;
    position: relative;

    width: 600px;
    height: 400px;
}

.point
{
    position: absolute;

    margin-left: #{-$point-radius};
    margin-bottom: #{-$point-radius};
    
    display: block;

    width: $point-radius;
    height: $point-radius;

    background-color: $color-bg;
    border: #{$point-radius / 2} solid var(--color);
    border-radius: 50%;

    z-index: 1;

    transition: left .2s bottom .2s;
}

.line
{
    margin-bottom: #{$line-width / -2};
    position: absolute;

    height: $line-width;

    background-color: var(--color);

    transform-origin: left center;

    transition: left .2s bottom .2s width .2s transform .2s;
}

</style>