<script>
import Logo from "./components/logo.svelte";
import Nav from "./components/nav.svelte";

</script>

<template>
    <div class="layout">
        <Logo></Logo>
        <slot></slot>
        <Nav></Nav>
    </div>
</template>

<style lang="scss">

.layout
{
    padding: 48px 0;
    display: grid;
    grid-template-rows: 1fr auto 1fr auto;
    justify-items: center;

    height: 100vh;

    box-sizing: border-box;
}

.nav
{
    align-self: end;

    a
    {
        margin: 0 24px;
        color: inherit;
        text-decoration: none;
        font-size: 22px;
    }
}

</style>