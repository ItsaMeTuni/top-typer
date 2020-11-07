<script lang="typescript">
import { calcAccuracy, calcWpm, getStats, saveStat, Stat, WordStat } from "../statManager";



interface TextPart
{
    text: string;
    type: 'normal' | 'error' | 'preview';
}

const text = 'Occaecat incididunt aliquip nostrud pariatur magna anim.';

let parts: TextPart[] = [];
let started = false;
let ended = false;
let currWordIndex = 0;
// Index of the current character relative to the start
// of the current word
let currCharIndexRelative = 0;
let wordStats: WordStat[] = [];
let lastStat: Stat | null;
let cachedLastStatWpm: number = 0
let cachedLastStatAccuracy: number = 0

const wordTickInterval = 50;
const wpmUpdateInterval = 250;
let capsLockActivated = false;

let wpm = 0;
let wpmRelativeDiff = 0;
let accuracy = 0;
let accuracyRelativeDiff = 0;

reset();

function onKeypress(e: KeyboardEvent)
{
    if(ended)
    {
        if(e.key === 'Enter')
        {
            reset();
        }
        return;
    }

    started = true;

    capsLockActivated = e.key.toLowerCase() !== e.key && !e.shiftKey;

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
        nextWord();
    }
    else
    {
        currCharIndexRelative += 1;
    }

    if(partType === 'error')
    {
        // Register a typo in the WordStat of the current word
        const currWordStat = wordStats[currWordIndex];
        currWordStat.typos.push(currCharIndexRelative);
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

    if(previewPart.text.length === 0)
    {
        end();
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
            prevWord();
            char = ' ';
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

function nextWord()
{
    currWordIndex += 1;
    currCharIndexRelative = 0;
    wordStats[currWordIndex].duration = 0;
}

function prevWord()
{
    currWordIndex -= 1;
}

function wordTick()
{
    if(started)
    {
        wordStats[currWordIndex].duration += wordTickInterval;
    }
}

function updateStatLabels()
{
    if(started && !ended)
    {
        wpm = calcWpm(wordStats, currWordIndex);
        accuracy = calcAccuracy(wordStats, currWordIndex);

        if(lastStat !== null)
        {
            wpmRelativeDiff = wpm / cachedLastStatWpm;
            accuracyRelativeDiff = accuracy / cachedLastStatAccuracy;
        }
    }
}

function end()
{
    if(ended)
    {
        return;
    }


    ended = true;

    console.log(wordStats);

    const stat = new Stat();

    stat.timestamp = Date.now();
    stat.words = wordStats;

    saveStat(stat);
}

function reset()
{
    parts = [
        {
            text: text,
            type: 'preview',
        }
    ];

    started = false;
    ended = false;
    currWordIndex = 0;
    currCharIndexRelative = 0;
    wordStats = WordStat.fromText(text);

    const statHistory = getStats();

    lastStat = statHistory[statHistory.length - 1];
    cachedLastStatWpm = calcWpm(lastStat.words);
    cachedLastStatAccuracy = calcAccuracy(lastStat.words);
}

setInterval(wordTick, wordTickInterval);
setInterval(updateStatLabels, wpmUpdateInterval);

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
                <div class="value">{wpm}WPM</div>
                <div class="relative-diff positive">{wpmRelativeDiff >= 1 ? '+' : ''}{Math.floor(wpmRelativeDiff * 100) - 100}%</div>
            </div>
            <div class="stat">
                <div class="title">Accuracy</div>
                <div class="value">{Math.floor(accuracy * 100)}%</div>
                <div class="relative-diff negative">{accuracyRelativeDiff >= 1 ? '+' : ''}{Math.floor(accuracyRelativeDiff * 100) - 100}%</div>
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