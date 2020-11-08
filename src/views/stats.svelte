<script lang="typescript">
import Graph from "../components/graph.svelte";
import Layout from "../layout.svelte";
import { calcAccuracy, calcWpm, getStats } from "../statManager";
import {Dataset} from '../types/dataset';

const stats = getStats();
const wpmHistory = stats.map(x => calcWpm(x.words));
const accuracyHistory = stats.map(x => calcAccuracy(x.words));

const datasets = [
    new Dataset(wpmHistory, '#27D239', 40, 120),
    new Dataset(accuracyHistory, '#6892FF', .5, 1),
];

</script>

<template>
    <Layout>
        <Graph datasets="{datasets}"></Graph>
    </Layout>
</template>

<style lang="scss">

</style>