<script>
import Header from "./components/header.svelte";

</script>

<template>
    <div class="layout">
        <Header></Header>
        <div class="content">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss">

.layout
{
    padding-bottom: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;

    min-height: 100vh;

    .content
    {
        max-width: 60vw;

        :global(h1, h2)
        {
            margin: 1em 0;
            font-weight: 400;
        }

        :global(h1)
        {
            text-align: center;
        }

        :global(p)
        {
            opacity: .8;
        }

        :global(a)
        {
            color: rgb(72, 171, 252);
            text-decoration: none;
            font-weight: 600;
        }
    }
}

</style>