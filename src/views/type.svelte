<script lang="ts">

interface TextPart
{
    text: string;
    type: 'normal' | 'error' | 'preview';
}

const text = 'Occaecat incididunt aliquip nostrud pariatur magna anim. Enim Lorem consequat ullamco aliqua irure id irure pariatur dolore. Velit commodo consequat sit ex enim ut adipisicing dolore.';

let parts: TextPart[] = [
    {
        text: text,
        type: 'preview',
    }
];

let wordTimings: number[] = [];

let wordsPerMinute: number = 0;
$: {
    const wordDurations = wordTimings.map(x => x / 1000);
    wordsPerMinute = 60 / (wordDurations.reduce((acc, x) => acc + x, 0) / wordDurations.length);
    wordsPerMinute = Math.floor(wordsPerMinute);
}

let lastWordTimestamp = 0;

// Index of the word the user is currently typing
let currWord = 0;

let capsLockActivated = false;

function onKeypress(e: KeyboardEvent)
{
    capsLockActivated = e.key.toLowerCase() !== e.key && !e.shiftKey;

    if(lastWordTimestamp === 0)
    {
        lastWordTimestamp = Date.now();
    }

    const previewPart = parts[parts.length - 1];
    const lastConcretePart: TextPart | null = parts[parts.length - 2];

    const expectedChar = previewPart.text[0]; // Character we were expecting the user to type
    const inputChar = e.key; // Character the user actually typed


    // Remove the first character of the preview part, since it will
    // be added to another part.
    previewPart.text = previewPart.text.substr(1);

    // If the user typed the correct character we want to create/append
    // the character to a normal part, otherwise we want to create/append
    // it to an error part.
    const partType = inputChar === expectedChar ? 'normal' : 'error';

    // Character to be added to part
    let char = expectedChar;

    if(char === ' ')
    {
        const words = lastConcretePart.text.split(' ');
        const word = words[words.length - 1];

        wordTimings[currWord] = Date.now() - lastWordTimestamp;
        lastWordTimestamp = Date.now();

        currWord += 1;
    }

    // If the user missed a space replace it with an underscore
    // so the mistake is visible
    if(char === ' ' && partType === 'error')
    {
        char = '_';
    }

    // If the partType is the same as the type of the last concrete part,
    // just append the expected letter to the last concrete part.
    if(lastConcretePart != null && lastConcretePart.type === partType)
    {
        lastConcretePart.text = lastConcretePart.text + char;

        // Trigger svelte update
        parts = parts;
    }
    // Otherwise, create a new part with the type we want
    // and insert it right before the previewPart
    else
    {
        const newPart: TextPart = {
            text: char,
            type: partType,
        };

        parts = [
            ...parts.slice(0, parts.length - 1),
            newPart,
            previewPart,
        ];
    }
}

function onKeydown(e: KeyboardEvent)
{
    // Handle backspace by basically moving the last character
    // of the last concrete part to the start of the preview
    if(e.key === 'Backspace')
    {
        const previewPart = parts[parts.length - 1];
        const lastConcretePart: TextPart | null = parts[parts.length - 2];

        if(lastConcretePart === undefined)
        {
            return;
        }

        // If the character was an underscore replace it with a space,
        // since it was put there just to signal a mistake to the user.
        let char = lastConcretePart.text.substr(-1, 1);
        if(char === '_')
        {
            char = ' ';

            currWord -= 1;
        }

        // "Move" last character of lastConcretePart to start of preview
        previewPart.text = char + previewPart.text;
        lastConcretePart.text = lastConcretePart.text.substr(0, lastConcretePart.text.length - 1);

        // Remove lastConcretePart from parts if it has no content
        if(lastConcretePart.text.length <= 0)
        {
            parts = [
                ...parts.slice(0, parts.length - 2),
                previewPart
            ];
        }
        else
        {
            // Trigger svelte update
            parts = parts;
        }
    }
}

</script>

<template>
    <div class="type">
        <div class="logo">
            <div>Top Typer</div>
            <div>Type faster, much faster</div>
        </div>

        <div class="main">
            <div class="messages">
                {#if capsLockActivated}
                    <div class="warn">Caps Lock activated</div>
                {/if}
            </div>
            <div
                class="text"
                tabindex="0"
                on:keypress={onKeypress}
                on:keydown={onKeydown}
            >
                {#each parts as part}
                    <span class={part.type}>{part.text}</span>
                {/each}
            </div>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="title">Speed</div>
                <div class="value">{wordsPerMinute || 0}WPM</div>
                <div class="relative-diff positive">+3%</div>
            </div>
            <div class="stat">
                <div class="title">Accuracy</div>
                <div class="value">89%</div>
                <div class="relative-diff negative">-6%</div>
            </div>
        </div>

        <div class="nav">
            <a href="/stats">Your stats</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/options">Options</a>
            <a href="/about">About and FAQ</a>
        </div>
    </div>
</template>

<style lang="scss">

@import '../styles/vars.scss';

.type
{
    padding: 48px 0;
    display: grid;
    grid-template-rows: repeat(4, auto);
    justify-items: center;

    height: 100vh;

    box-sizing: border-box;
}

.logo
{
    font-weight: 200;
    align-self: flex-start;

    div:first-child
    {
        font-size: 74px;
        text-transform: uppercase;
    }

    div:last-child
    {
        margin-top: 16px;
        margin-right: -15%;
        font-size: 28px;
        text-align: right;
    }
}

.main
{
    align-self: center;
}

.messages
{
    display: flex;
    flex-direction: row;
    align-items: center;

    opacity: .8;

    div
    {
        margin-bottom: 16px;
        padding: 8px 12px;

        font-size: 16px;
        font-weight: 500;

        border-radius: 3px;

        &.warn
        {
            background-color: #ffbb00;
            color: $color-bg;
        }
    }
}

.text
{

    width: 50ch;

    font-size: 36px;
    font-family: 'Source Code Pro', monospace;
    font-weight: 400;

    span
    {
        word-break: break-all;
        word-wrap: break-word;

        &.preview
        {
            opacity: .4;
        }

        &.error
        {
            color: #C24646;
        }
    }

    &:focus
    {
        outline: none;
    }
}

.stats
{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    align-self: flex-start;
}

.stat
{
    margin: 0 32px;

    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;

    .title, .value, .relative-diff
    {
        font-family: 'Lato', sans-serif;
    }

    .value, .relative-diff
    {
        grid-row: 2 / 3;
        align-self: center;
    }

    .title, .relative-diff
    {
        font-size: 22px;
        font-weight: 400;
    }

    .title
    {
        opacity: .6;
    }

    .value
    {
        font-size: 40px;
        font-weight: 300;
    }

    .relative-diff
    {
        margin-left: 12px;

        &.positive
        {
            color: #50DB1F;
        }

        &.negative
        {
            color: #40A7F2;
        }
    }
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