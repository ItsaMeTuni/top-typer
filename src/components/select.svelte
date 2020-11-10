<script lang="typescript">
import { createEventDispatcher } from "svelte";

interface Option
{
    text: string;
    value: any;
}

export let options: Option[] = [];
export let selected: Option | null = null;

let visible = false;
let title: string;
$: title = selected ? selected.text : 'Select a value';

const dispatch = createEventDispatcher();

let btnDiv: HTMLDivElement;

function select(option: Option)
{
    selected = option;
    dispatch('change', selected);
}

document.addEventListener('click', (e: MouseEvent) =>
{
    visible = e.target === btnDiv && !visible;
});

</script>

<template>
    <div
        class="select"
        class:open={visible}
    >
        <div
            bind:this={btnDiv}
            class="button"
        >
            <span>{title}</span>
            <img src="/chevron-down.svg" alt="">
        </div>
        <div
            class="options"
        >
            {#each options as option}
                <div
                    class="option"
                    on:click={() => select(option)}
                >{option.text}</div>
            {/each}
        </div>
    </div>
</template>

<style lang="scss">

.select
{
    position: relative;

    padding: 6px 18px;

    font-weight: 500;

    color: rgba(255, 255, 255, 0.8);
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.6);

    overflow: visible;

    cursor: pointer;
    user-select: none;
}

.button
{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    &>*
    {
        pointer-events: none;
    }

    img
    {
        margin-left: 1.5ch;

        width: 1.3em;   
        height: 1.3em;

        opacity: .5;
    }

    pointer-events: all;
}

.options
{
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;

    display: none;

    z-index: 10;

    .open &
    {
        display: block;
    }

    .option
    {
        padding: 8px 18px;

        color: rgba(255, 255, 255, 0.8); 

        border-bottom: 1px solid rgba(0, 0, 0, 0.6);
        border-left: 1px solid rgba(0, 0, 0, 0.6);
        border-right: 1px solid rgba(0, 0, 0, 0.6);
        background-color: rgb(66, 66, 66);

    }
}

</style>