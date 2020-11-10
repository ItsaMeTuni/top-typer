<script lang="typescript">
import Layout from "../layout.svelte";


</script>

<template>
    <Layout>
        <h1>About</h1>
        <h2>How is the text generated?</h2>
        <p>
            The text is randomly generated from a set (<a href="https://github.com/first20hours/google-10000-english">repo</a>)
            of the ~10,000 most common words in english
            as determined by
            <a href="https://books.google.com/ngrams/info">Googlee's Trillion Word Corpus</a>.
            Actually, it's generated from 3 separate sets: one with long words, one with medium words, and one with
            short words. Together they add up to ~10,000 words. A weight is assigned for each set so that we
            generate text mostly with medium-length words and a few long and short ones for variety.
        </p>
        <h2>How was Top Typer made?</h2>
        <p>
            It was made using Svelte + Typescript. The charts are generated with Chart.js. If you're interested,
            feel free to take a look Top Typer's source code
            <a href="https://github.com/ItsaMeTuni/top-typer">here</a>.
        </p>
        <h2>Who is Top Typer's developer?</h2>
        <p>
            Let me introduce myself: I'm Lucas Antunes, a fullstack developer that absolutely loves Rust.
            Feel free to check out my 
            <a href="https://github.com/ItsaMeTuni">GitHub</a>
            and my
            <a href="https://lucasantunes.me">Portfolio</a>
            :)
        </p>
        <h2>Want to report a bug?</h2>
        <p>
            If you found anything that could be improved or have any suggestions for Top Typer, please open
            an issue
            <a href="https://github.com/ItsaMeTuni/top-typer/issues">here</a>.
        </p>
    </Layout>
</template>

<style lang="scss">


</style>