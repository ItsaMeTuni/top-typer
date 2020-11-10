<script lang="typescript">
import Layout from "../layout.svelte";
import { getStats } from "../statManager";
import {Line} from "svelte-chartjs"
import Select from "../components/select.svelte";
import Logo from "../components/logo.svelte";
import Nav from "../components/nav.svelte";
import Header from "../components/header.svelte";

const stats = getStats();
const calculatedStats = stats.map(x => x.calculateStats());
const wpmHistory = calculatedStats.map(x => x.wpm);
const accuracyHistory = calculatedStats.map(x => Math.floor(x.keystrokeAccuracy * 100));
const pace = calculatedStats.map(x => Math.floor(x.pace * 100));
const dates = stats.map(x => new Date(x.timestamp));



function createData(label: string, color: string, data: number[]): any
{
    return {
        datasets: [
            {
                label,
                data: data.map((y, i) => ({x: dates[i], y})),
                fill: false,
                borderColor: color,
                pointBackgroundColor: color,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
        ],
    };
}

function createOptions(min: number, max: number)
{
    return {
        scales: {
            yAxes: [
                {
                    type: 'linear',
                    ticks: {
                        suggestedMin: min,
                        suggestedMax: max,
                    },
                },
            ],
            xAxes: [
                {
                    type: 'time',
                    distribution: 'series',
                },
            ],
        },
    };
}

const charts = [
    {
        text: 'WPM',
        value: {
            data: createData('WPM', '#27D239', wpmHistory),
            options: createOptions(0, 130),
        },
    },
    {
        text: 'Accuracy',
        value: {
            data: createData('Accuracy', '#6892FF', accuracyHistory),
            options: createOptions(40, 100),
        },
    },
    {
        text: 'Pace',
        value: {
            data: createData('Pace', '#FF66C7', pace),
            options: createOptions(20, 100),
        },
    },
]

let selectedChart = charts[0];

</script>

<template>
    <div class="layout">
        <Header></Header>
        <h1>Stats</h1>
        <div class="chart-wrapper">
            <Line data={selectedChart.value.data} options={selectedChart.value.options}></Line>
        </div>
        <Select options={charts} bind:selected={selectedChart}></Select>
    </div>
</template>

<style lang="scss">

.layout
{
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chart-wrapper
{
    width: 50vw;
}

</style>