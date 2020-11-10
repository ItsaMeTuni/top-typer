<script lang="typescript">
import Dialog from "../components/dialog.svelte";
import Header from "../components/header.svelte";
import Select from "../components/select.svelte";
import TypewriterRenderer from "../components/typewriterRenderer.svelte";
import TypewriterStats from "../components/typewriterStats.svelte";
import Layout from "../layout.svelte";
import Labeled from "../components/labeled.svelte";
import {Typewriter} from "../typewriter";
import { getRandomText } from "../words";
import type { WordSizeRatios } from '../words';
import Slider from "../components/slider.svelte";

let typewriter: Typewriter = new Typewriter('');

interface Config
{
    wordCount: number;
    wordSizeRatios: WordSizeRatios;
}

interface Preset
{
    text: string;
    value: Config;
}

const customConfig: Config = {
    wordCount: 15,
    wordSizeRatios: {
        short: .2,
        medium: .6,
        long: .2,
    },
};

const presets: Preset[] = [
    {
        text: 'Custom',
        value: customConfig,
    },
    {
        text: 'Normal',
        value: {
            wordCount: 15,
            wordSizeRatios: {
                short: .2,
                medium: .6,
                long: .2,
            },
        },
    },
    {
        text: 'Endurance',
        value: {
            wordCount: 60,
            wordSizeRatios: {
                short: .2,
                medium: .4,
                long: .4,
            },
        },
    },
    {
        text: 'Burst',
        value: {
            wordCount: 5,
            wordSizeRatios: {
                short: .3,
                medium: .6,
                long: .1,
            },
        },
    },
];

let selectedPreset: Preset = presets[2];

let isCustomPreset: boolean;
$: isCustomPreset = selectedPreset === presets[0];

let configsDialogVisible = false;

setup();

async function setup()
{
    const text = await getRandomText(selectedPreset.value.wordCount, selectedPreset.value.wordSizeRatios);
    typewriter.reset(text);
}


function onSliderInput()
{
    setup();
}

function onChangePreset()
{
    setup();
}

function percentageSliderFormatter(val: number): string
{
    return Math.floor(val * 100).toString() + '%';
}

</script>

<template>
    <div class="layout">
        <div>
            <Header></Header>
        </div>
        <div class="typewriter">
            <TypewriterRenderer typewriter={typewriter} onNext={setup}></TypewriterRenderer>
            <TypewriterStats typewriter={typewriter}></TypewriterStats>
        </div>
        <div class="settings-btn-wrapper">
            <button on:click={() => configsDialogVisible = true}>Settings</button>
        </div>
        <Dialog bind:visible={configsDialogVisible}>
            <h1>Options</h1>
            <br>
            <div class="row center">
                <Labeled label="Preset" horizontal>
                    <Select options={presets} bind:selected={selectedPreset} on:change={onChangePreset}></Select>
                </Labeled>
            </div>
            <h2>Customize</h2>
            <Labeled label="Word count">
                <Slider
                    min={3}
                    max={200}
                    step={1}
                    bind:value={selectedPreset.value.wordCount}
                    on:input={onSliderInput}
                    disabled={!isCustomPreset}
                ></Slider>
            </Labeled>
            <Labeled label="% of short words">
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={selectedPreset.value.wordSizeRatios.short}
                    on:input={onSliderInput}
                    labelFormatter={percentageSliderFormatter}
                    disabled={!isCustomPreset}
                ></Slider>
            </Labeled>
            <Labeled label="% of medium words">
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={selectedPreset.value.wordSizeRatios.medium}
                    on:input={onSliderInput}
                    labelFormatter={percentageSliderFormatter}
                    disabled={!isCustomPreset}
                ></Slider>
            </Labeled>
            <Labeled label="% of long words">
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    bind:value={selectedPreset.value.wordSizeRatios.long}
                    on:input={onSliderInput}
                    labelFormatter={percentageSliderFormatter}
                    disabled={!isCustomPreset}
                ></Slider>
            </Labeled>
        </Dialog>
    </div>
</template>

<style lang="scss">

@import '../styles/vars.scss';

.layout
{
    display: grid;
    grid-template-rows: 1fr auto 1fr;

    height: 100vh;
}

.typewriter
{
    justify-self: center;
}

.settings-btn-wrapper
{
    padding-bottom: 32px;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    button
    {
        @include link-button;
    }
}

</style>