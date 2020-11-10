<script lang="typescript">
import Logo from "./logo.svelte";
import Nav from "./nav.svelte";

</script>

<template>
    <div class="header">
        <div>
            <Logo></Logo>
        </div>
        <Nav></Nav>
    </div>
</template>

<style lang="scss">

.header
{
    padding: 16px 24px;

    width: 100%;
    
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;

    box-sizing: border-box;
}

</style>