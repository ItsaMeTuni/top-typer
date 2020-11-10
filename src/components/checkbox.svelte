<script lang="typescript">

import { mdiCheckboxMarkedCircleOutline, mdiCheckboxBlankCircleOutline } from '@mdi/js'

export let checked = false;
export let label = 'Test';
export let color = 'white';
export let invert = false;

let _checked: boolean;
$: _checked = checked === !invert;

let checkPath: string;
$: checkPath = _checked ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline;

function toggle()
{
    checked = !checked;
}

</script>

<template>
    <div
        class="checkbox"
        on:click={toggle}
    >
        <svg style={`--color: ${color};`}>
            <path d={checkPath}></path>
        </svg> 
        <span class="text">{label}</span>
    </div>
</template>

<style lang="scss">

.checkbox
{
    margin: 16px 0;

    display: flex;
    flex-direction: row;
    align-items: center;

    cursor: pointer;
    user-select: none;
}

svg
{
    margin-right: 10px;

    display: block;

    width: 1em;
    height: 1em;

    path
    {
        fill: var(--color);
    }
}

</style>