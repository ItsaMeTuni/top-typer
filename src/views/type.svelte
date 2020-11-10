<script lang="typescript">
import Header from "../components/header.svelte";
import TypewriterRenderer from "../components/typewriterRenderer.svelte";
import TypewriterStats from "../components/typewriterStats.svelte";
import Layout from "../layout.svelte";
import {Typewriter} from "../typewriter";
import { getRandomText } from "../words";

let typewriter: Typewriter = new Typewriter('');


setup();

async function setup()
{
    const text = await getRandomText(10, { short: .2, medium: .6, long: .2 });
    typewriter.reset(text);
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
    </div>
</template>

<style lang="scss">

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

</style>