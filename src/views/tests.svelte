<script lang="typescript">
import Select from "../components/select.svelte";

const options = [
    {
        text: 'opt1',
        value: 0,
    },
    {
        text: 'opt2',
        value: 1,
    },
    {
        text: 'opt3',
        value: 2,
    },
];

</script>

<template>
    <div class="wrapper">
        <Select options={options}></Select>
    </div>
</template>

<style lang="scss">

.wrapper
{
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

</style>