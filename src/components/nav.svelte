<script>

const links = [
    {
        text: 'Type',
        path: '/#/',
    },
    {
        text: 'Your stats',
        path: '/#/stats',
    },
    {
        text: 'About and FAQ',
        path: '/#/about',
    },
].filter(x => x.path !== window.location.pathname);

</script>

<template>
    <div class="nav">
        {#each links as link}
            <a href={link.path}>{link.text}</a>
        {/each}
    </div>
</template>

<style lang="scss">
.nav a
{
    margin: 0 24px;
    color: inherit;
    text-decoration: none;
    font-size: 22px;
}
</style>