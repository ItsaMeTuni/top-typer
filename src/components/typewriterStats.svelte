<script lang="typescript">
import { onMount } from "svelte";

import { Stat, getStats } from "../statManager";
import type { CalculatedStat } from "../statManager";

import type { Word, Typewriter } from "../typewriter";

export let typewriter: Typewriter;

let lastCalculatedStats: CalculatedStat | null = null;

let wpm = 0;
let wpmDiff = 0;
let accuracy = 0;
let accuracyDiff = 0;
let pace = 0;
let paceDiff = 0;

onMount(() => {
    setInterval(updateStats, 50);
    cacheLastCalculatedStats();
    typewriter.attachEndListener(cacheLastCalculatedStats);
});

function updateStats()
{
    if(typewriter === undefined || !typewriter.hasStarted)
    {
        return;
    }

    const stats = Stat.fromTypewriter(typewriter).calculateStats();
    wpm = stats.wpm;
    accuracy = Math.floor(stats.keystrokeAccuracy * 100);
    pace = Math.floor(stats.pace * 100);

    if(lastCalculatedStats !== null)
    {
        wpmDiff = Math.floor((wpm / lastCalculatedStats.wpm) * 100) - 100;
        accuracyDiff = Math.floor((stats.keystrokeAccuracy / lastCalculatedStats.keystrokeAccuracy) * 100) - 100;
        paceDiff = Math.floor((stats.pace / lastCalculatedStats.pace) * 100) - 100;
    }
}

function cacheLastCalculatedStats()
{
    const stats = getStats();
    const lastStat = stats[stats.length - 1];
    if(lastStat)
    {
        lastCalculatedStats = lastStat.calculateStats();
    }
    else
    {
        lastCalculatedStats = null;
    }
}

</script>

<template>
    <div class="stats">
        <div class="stat">
            <div class="title">Raw speed</div>
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
        <div class="stat">
            <div class="title">Pace</div>
            <div class="value">{pace}%</div>
            <div
                class="relative-diff"
                class:positive={paceDiff > 1}
            >
                {paceDiff >= 0 ? '+' : ''}{paceDiff}%
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