<script lang="typescript">
import { Stat } from "../statManager";

import type { Word, Typewriter } from "../typewriter";

export let typewriter: Typewriter;

let wpm = 0;
let wpmDiff = 0;
let accuracy = 0;
let accuracyDiff = 0;

const intervalId = setInterval(updateStats, 50);

function updateStats()
{
    if(typewriter === undefined || !typewriter.hasStarted)
    {
        return;
    }

    const stats = Stat.fromTypewriter(typewriter).calculateStats();
    wpm = stats.wpm;
    accuracy = Math.floor(stats.keystrokeAccuracy * 100);
}

</script>

<template>
    <div class="stats">
        <div class="stat">
            <div class="title">Speed</div>
            <div class="value">{wpm}WPM</div>
            <div
                class="relative-diff"
                class:positive={wpmDiff > 1}
            >
                {wpmDiff >= 0 ? '+' : ''}{wpmDiff}%
            </div>
        </div>
        <div class="stat">
            <div class="title">Accuracy</div>
            <div class="value">{accuracy}%</div>
            <div
                class="relative-diff"
                class:positive={accuracyDiff > 1}
            >
                {accuracyDiff >= 0 ? '+' : ''}{accuracyDiff}%
            </div>
        </div>
    </div>
</template>

<style lang="scss">

@import '../styles/vars.scss';

.stats
{
    margin-top: 64px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    float: inline-start;
}

.stat
{
    margin: 0 32px;

    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;

    .title, .value, .relative-diff
    {
        font-family: 'Lato', sans-serif;
    }

    .value, .relative-diff
    {
        grid-row: 2 / 3;
        align-self: center;
    }

    .title, .relative-diff
    {
        font-size: 18px;
        font-weight: 400;
    }

    .title
    {
        opacity: .6;
    }

    .value
    {
        font-size: 36px;
        font-weight: 300;
    }

    .relative-diff
    {
        margin-left: 12px;
        color: #40A7F2;

        &.positive
        {
            color: #50DB1F;
        }
    }
}
</style>