<script lang="typescript">
import TypewriterRenderer from "../components/typewriterRenderer.svelte";
import TypewriterStats from "../components/typewriterStats.svelte";
import Layout from "../layout.svelte";
import {Typewriter} from "../typewriter";
import { getRandomText } from "../words";

let typewriter: Typewriter;


setup();

async function setup()
{
    const text = await getRandomText(10, { short: .2, medium: .6, long: .2 });
    typewriter = new Typewriter(text);
}

</script>

<template>
    <Layout>
        <TypewriterRenderer typewriter={typewriter} onNext={setup}></TypewriterRenderer>
        <TypewriterStats typewriter={typewriter}></TypewriterStats>
    </Layout>
</template>