<script lang="typescript">

export let visible = true;

function close()
{
    visible = false;
}

</script>

<template>
    <div
        class="dialog-bg"
        class:visible={visible}
        on:click|self={close}
    >
        <div class="dialog">
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss">

@import '../styles/vars.scss';

.dialog-bg
{
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: none;

    justify-content: center;
    align-items: center;

    background-color: rgba(0, 0, 0, 0.6);

    &.visible
    {
        display: flex;
    }
}

.dialog
{
    padding: 24px;

    min-width: 25vw;
    min-height: 30vh;

    background-color: $color-bg;
    border-radius: 3px;

    :global(h1)
    {
        margin: 0;
        font-weight: 400;
        text-align: center;
    }

    :global(h1, h2, h3)
    {
        font-weight: 400;
    }
}

</style>