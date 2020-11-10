<script lang="typescript">
import { getStats } from "../statManager";
import {Line} from "svelte-chartjs"
import Header from "../components/header.svelte";
import Checkbox from "../components/checkbox.svelte";
import Layout from "../layout.svelte";

const stats = getStats();
const calculatedStats = stats.map(x => x.calculateStats());
const wpmHistory = calculatedStats.map(x => x.wpm);
const accuracyHistory = calculatedStats.map(x => Math.floor(x.keystrokeAccuracy * 100));
const pace = calculatedStats.map(x => Math.floor(x.pace * 100));
const dates = stats.map(x => new Date(x.timestamp));

interface Dataset
{
    label: string;
    data: {x: Date, y: number}[];
    fill: boolean;
    borderColor: string;
    pointBackgroundColor: string;
    pointRadius: number;
    pointHoverRadius: number;
    yAxisID: string;
    hidden: boolean;
}

interface Axis
{
    id: string;
    type: 'linear';
    ticks: {
        suggestedMin: number;
        suggestedMax: number;
    },
    display: 'auto',
    weight: number,
}

function makeLine(label: string, color: string, data: number[], min: number, max: number, initialVisiblity: boolean, axisWeight: number): [Dataset, Axis]
{
    const dataset: Dataset = {
        label,
        data: data.map((y, i) => ({x: dates[i], y})),
        fill: false,
        borderColor: color,
        pointBackgroundColor: color,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: label,
        hidden: !initialVisiblity,
    };

    const yAxis: Axis = {
        id: label,
        type: 'linear',
        display: 'auto',
        weight: 1 / axisWeight,
        ticks: {
            suggestedMin: min,
            suggestedMax: max,
        },
    };

    return [dataset, yAxis];
}

function makeChart(datasetsAndAxes: [Dataset, Axis][]): any
{
    return {
        data: {
            datasets: datasetsAndAxes.map(x => x[0]),
        },
        options: {
            legend: {
                display: false,
            },
            animation: {
                duration: 0,
            },
            scales: {
                yAxes: datasetsAndAxes.map(x => x[1]),
                xAxes: [
                    {
                        type: 'time',
                        distribution: 'series',
                    },
                ],
            },
        },
    }
}

let mainChart = makeChart([
    makeLine('WPM', '#27D239', wpmHistory, 0, 130, true, 3),
    makeLine('Accuracy', '#6892FF', accuracyHistory, 40, 100, false, 2),
    makeLine('Pace', '#FF66C7', pace, 20, 100, false, 1),
]);

const hardestKeysSessionCount = calculatedStats.length > 15 ? 15 : calculatedStats.length;

const last5CalcStats = calculatedStats.slice(calculatedStats.length - hardestKeysSessionCount - 1); //Last 15

const hardestKeysMap: Map<string, [number, number]> = new Map();

for(let i = 0; i < hardestKeysSessionCount; i++)
{
    const calcStat = last5CalcStats[i];

    for(const [key, avgDelay] of calcStat.avgTypingDelay)
    {
        let curr = hardestKeysMap.get(key) || [0, 0];
        curr[0] += avgDelay;
        curr[1] += 1;
        hardestKeysMap.set(key, curr);
    }
}

const hardestKeysAveraged: Map<string, number> = new Map();

for(const [key, [totalDelay, delayCount]] of hardestKeysMap)
{
    hardestKeysAveraged.set(key, totalDelay / delayCount);
}

const hardestKeys = Array.from(hardestKeysAveraged.entries()).sort((a, b) =>
{
    if(a[1] > b[1]) return -1;
    if(a[1] < b[1]) return 1;
    if(a[1] === b[1]) return 0;
})
.map(x => x[0])
.filter(x => x !== ' ');

</script>

<template>
    <Layout>
        <h1>Your stats</h1>
        <h2>Progress</h2>
        <p>
            Here is your performance progress.
        </p>
        <div class="chart-wrapper">
            <Line data={mainChart.data} options={mainChart.options}></Line>
            <div class="checkboxes">
                {#each mainChart.data.datasets as dataset}
                    <Checkbox bind:checked={dataset.hidden} label={dataset.label} color={dataset.borderColor} invert={true}></Checkbox>
                {/each}
            </div>
        </div>
        <br>
        <h2>Character difficulty</h2>
        <p>
            Here is a list of characters ranked by the difficulty you seem to have when typing them, from hardest to easiest. The difficulty is measured
            as the time you take to type each character, the harder the character is for you, the longer you will take
            to type it.
        </p>
        <div class="hardest-keys">
            {#each hardestKeys as key}
                <span>{key}</span>
            {/each}
        </div>
    </Layout>
</template>

<style lang="scss">

.chart-wrapper
{
    display: flex;
    flex-direction: row;
    align-items: center;

    max-width: 40vw;
}

.checkboxes
{
    margin-bottom: 64px;
    margin-left: 40px;

    flex: 0;
}

.hardest-keys span
{
    margin: 2px;
    padding: 4px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 2ch;
    height: 2ch;

    font-family: 'Roboto Mono', monospace;

    background-color: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 2px;

    box-sizing: content-box;
}

</style>