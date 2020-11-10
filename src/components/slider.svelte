<script lang="typescript">
import { createEventDispatcher } from "svelte";



export let value: number = 0;
export let min: number = 0;
export let max: number = 100;
export let step: number = 1;
export let disabled: boolean = false;
export let labelFormatter: (val: number) => string = (val) => val.toString();

let label: string;
$: label = labelFormatter(value);

const dispatch = createEventDispatcher();

</script>

<template>
    <div class="slider">
        <input
            type="range"
            bind:value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            on:input={(e) => dispatch('input', e)}
        >
        <div class="value">{label}</div>
    </div>
</template>

<style lang="scss">

.slider
{
    display: flex;
    flex-direction: row;
    align-items: center;
}

input
{
    flex: 1;
}

.value
{
    width: 6ch;
    text-align: center;
}

</style>