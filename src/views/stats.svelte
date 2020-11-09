<script lang="typescript">
import Graph from "../components/graph.svelte";
import Layout from "../layout.svelte";
import { getStats } from "../statManager";
import {Dataset} from '../types/dataset';

const stats = getStats().map(x => x.calculateStats());
const wpmHistory = stats.map(x => x.wpm);
const accuracyHistory = stats.map(x => x.keystrokeAccuracy);
const keystrokeRhythm = stats.map(x => x.keystrokeRhythm);

const datasets = [
    new Dataset(wpmHistory, '#27D239', 'auto', 'auto'),
    new Dataset(accuracyHistory, '#6892FF', 'auto', 'auto'),
    new Dataset(keystrokeRhythm, '#ff66c7', 'auto', 'auto'),
];


</script>

<template>
    <Layout>
        <Graph datasets="{datasets}"></Graph>
    </Layout>
</template>

<style lang="scss">

</style>