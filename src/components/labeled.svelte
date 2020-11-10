<script lang="typescript">

export let label: string = '';
export let horizontal: boolean = false;

</script>

<template>
    <div class="labeled" class:horizontal={horizontal}>
        <div class="label">{label}</div>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss">

.labeled
{
    margin-top: 16px;
    margin-bottom: 8px;

    .label, .content
    {
        display: block;
    }

    &.horizontal
    {
        .label, .content
        {
            display: inline-block;
        }
    }
}

</style>