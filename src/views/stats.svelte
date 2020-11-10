<script lang="typescript">
import { getStats } from "../statManager";
import {Line} from "svelte-chartjs"
import Header from "../components/header.svelte";
import Checkbox from "../components/checkbox.svelte";

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

let chart = makeChart([
    makeLine('WPM', '#27D239', wpmHistory, 0, 130, true, 3),
    makeLine('Accuracy', '#6892FF', accuracyHistory, 40, 100, false, 2),
    makeLine('Pace', '#FF66C7', pace, 20, 100, false, 1),
]);


</script>

<template>
    <div class="layout">
        <Header></Header>
        <h1 class="title">Your stats</h1>
        <div class="chart-wrapper">
            <Line data={chart.data} options={chart.options}></Line>
        </div>
        <div class="checkboxes">
            {#each chart.data.datasets as dataset}
                <Checkbox bind:checked={dataset.hidden} label={dataset.label} color={dataset.borderColor} invert={true}></Checkbox>
            {/each}
        </div>
    </div>
</template>

<style lang="scss">

.layout
{
    display: flex;
    flex-direction: column;
    align-items: center;
}

.title
{
    margin: 1em 0;
    font-weight: 400;
}

.chart-wrapper
{
    width: 50vw;
}

.checkboxes
{
    margin-top: 32px;
}

</style>