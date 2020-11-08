<script lang="typescript">
import { onMount } from "svelte";
import { text, xlink_attr } from "svelte/internal";

import Layout from "../layout.svelte";
import { calcAccuracy, calcWpm, getStats, saveStat, Stat, WordStat } from "../statManager";
import { getRandomText } from "../words";

class Token
{
    text = '';

    // How much time the user took to type this word.
    duration = 0;

    // How much time the user took to type each character
    // of this word (even if the typed character was incorrect).
    // If the user deletes the character its duration resets to 0.
    characterDurations = [];

    // Indexes of the characters in this word that the user typed
    // wrong.
    typos = [];

    constructor(text: string)
    {
        this.text = text;
        this.characterDurations = text.split('').map(_ => 0);
        this.typos = [];
    }
}

type RenderedTokenType = 'normal' | 'error' | 'preview';

// This stores information about each <span> that's
// rendered to the user.
class RenderedToken
{
    // All or a portion of the text of the token, with or without typos.
    // Basically the group of letters the user typed for the token.
    text: string;
    token: Token;
    type: RenderedTokenType;

    constructor(token: Token, text: string, type: RenderedTokenType)
    {
        this.token = token;
        this.text = text;
        this.type = type;
    }
}

let textTokens: Token[] = [];
let renderedTokens: RenderedToken[] = [];
let wpm = 0;
let wpmRelativeDiff = 0;
let accuracy = 0;
let accuracyRelativeDiff = 0;

// Index of the first 'preview' token in the renderedTokens array,
// which is the rendered token whose first character is the next character
// the user will type.
let currRenderedTokenIndex = 0;

let started = false;
let ended = false;

let wordTimestamp: number = 0;
let charTimestamp: number = 0;

reset();
setInterval(updateStats, 250);

async function generateTokens(): Promise<Token[]>
{
    const text = await getRandomText(3, { short: .2, medium: .6, long: .2 });
    const tokens = text.split(' ').map(s => new Token(s));
    const retVal = [];

    for(let i = 0; i < tokens.length; i++)
    {
        retVal.push(tokens[i]);
        if(i < tokens.length - 1)
        {
            retVal.push(new Token(' '));
        }
    }

    return retVal;
}

function generateRenderedTokens(tokens: Token[]): RenderedToken[]
{
    return tokens.map(token => new RenderedToken(token, token.text, 'preview'));
}

function onKeypress(e: KeyboardEvent)
{
    if(e.key === 'Enter')
    {
        if(ended)
        {
            reset();
        }

        return;
    }
    
    if(ended)
    {
        return;
    }

    if(!started)
    {
        wordTimestamp = Date.now();
        charTimestamp = Date.now();
    }
    started = true;

    let currPreviewToken = renderedTokens[currRenderedTokenIndex];
    let currPreviewTextToken = currPreviewToken.token;

    const wordRenderedTokens = renderedTokens.filter(t => t.token === currPreviewTextToken);

    // RenderedTokens from wordRenderedTokens that are not of 'preview' type
    const wordConcreteRTs = wordRenderedTokens.filter(t => t.type !== 'preview');

    // The string the user has typed for currTextToken. If currTextToken is 'lasagna'
    // and wordRenderedTokens is
    // `[{text: 'lasa', type: 'normal'}, {text: 'h', type: 'error'}, {text: 'na', type: 'preview'}]`,
    // typedWord will have the two first elements of wordRenderedTokens.
    const typedWord = wordConcreteRTs.reduce((acc, x) => acc + x.text, '');
    
    // Set the character timestamp for the character the user just typed
    currPreviewTextToken.characterDurations[typedWord.length] = (Date.now() - charTimestamp) / 1000;

    // The character the user was expected to type
    const expectedChar = currPreviewTextToken.text[typedWord.length];
    const isTypo = e.key !== expectedChar;

    

    if(isTypo)
    {
        // Record typo at current character
        currPreviewTextToken.typos.push(typedWord.length);
    }

    const currConcreteRT = wordConcreteRTs[wordConcreteRTs.length - 1];

    // Append typed character to current concrete rendered token
    // but only if the type of the token matches whether or not
    // the typed character is a typo.
    if(currConcreteRT !== undefined && isTypo === (currConcreteRT.type === 'error'))
    {
        currConcreteRT.text += expectedChar;

        // Trigger svelte update
        renderedTokens = renderedTokens;
    }
    // Otherwise, create a new token with the correct type.
    else
    {
        const type = isTypo ? 'error' : 'normal';
        const rt = new RenderedToken(currPreviewTextToken, expectedChar, type);

        if(currConcreteRT === undefined)
        {
            renderedTokens = arrInsertBeforePredicate(renderedTokens, rt, x => x.type === 'preview');
        }
        else
        {
            renderedTokens = arrInsertAfterPredicate(renderedTokens, rt, x => x === currConcreteRT);
        }

        currRenderedTokenIndex += 1;
        currPreviewToken = renderedTokens[currRenderedTokenIndex];
        currPreviewTextToken = currPreviewToken.token;
    }

    // Remove text from current token
    currPreviewToken.text = currPreviewToken.text.substr(1); 

    // If the preview token doesn't have any more text,
    // remove it from the rendered tokens. This also means
    // the user just got to another token, so set the
    // (last) token's duration.
    if(currPreviewToken.text.length === 0)
    {
        currPreviewTextToken.duration = (Date.now() - wordTimestamp) / 1000;
        wordTimestamp = Date.now();

        renderedTokens = renderedTokens.filter(x => x !== currPreviewToken);

        // Don't increment currRenderedTokenIndex here because we just removed
        // the preview token, so what would be the next token basically got shifted
        // into currRenderedTokenIndex

        currPreviewToken = renderedTokens[currRenderedTokenIndex];
        if(currPreviewToken !== undefined)
        {
            currPreviewTextToken = currPreviewToken.token;
        }
    }

    charTimestamp = Date.now();

    if(!ended && currRenderedTokenIndex === renderedTokens.length)
    {
        // update stats one last time before ending
        updateStats();
        ended = true;
    }
}

function onKeydown(e: KeyboardEvent)
{
    if(ended)
    {
        return;
    }

    if(e.key === 'Backspace')
    {
        let currPreviewToken = renderedTokens[currRenderedTokenIndex];
        
        const concreteRtIndex = renderedTokens.indexOf(currPreviewToken) - 1;

        if(concreteRtIndex < 0)
        {
            return;
        }

        const concreteRt = renderedTokens[concreteRtIndex];

        if(concreteRt.token === currPreviewToken.token)
        {
            currPreviewToken.text = concreteRt.text[concreteRt.text.length - 1] + currPreviewToken.text;
            renderedTokens = renderedTokens;
        }
        else
        {
            const rt = new RenderedToken(concreteRt.token, concreteRt.text[concreteRt.text.length - 1], 'preview');
            renderedTokens = arrInsertBeforePredicate(renderedTokens, rt, x => x === currPreviewToken);

            // No need to change the index here, since we just inserted rt at currRenderedTokenIndex
        }

        concreteRt.text = concreteRt.text.substr(0, concreteRt.text.length - 1);

        if(concreteRt.text.length === 0)
        {
            renderedTokens = renderedTokens.filter(x => x !== concreteRt);
            currRenderedTokenIndex -= 1;
        }

        charTimestamp = Date.now();
    }
}

function updateStats()
{
    if(!started || ended)
    {
        return;
    }

    let currTextTokenIndex;
    if(currTextTokenIndex < textTokens.length)
    {
        currTextTokenIndex = textTokens.indexOf(renderedTokens[currRenderedTokenIndex].token);
    }
    else
    {
        currTextTokenIndex = textTokens.length - 1;
    }

    let overallDuration = 0;
    let typos = 0;
    let charCount = 0;

    for(let i = 0; i <= currTextTokenIndex ; i++) 
    {
        if(i === currTextTokenIndex)
        {
            overallDuration += (Date.now() - wordTimestamp) / 1000;
        }
        else
        {
            overallDuration += textTokens[i].duration;
        }
        typos += textTokens[i].typos.length;
        charCount += textTokens[i].text.length;
    }

    wpm = Math.floor((charCount / 5) / (overallDuration / 60));
    accuracy = 1 - (typos / charCount);
}

async function reset()
{
    textTokens = await generateTokens();
    renderedTokens = generateRenderedTokens(textTokens);

    started = false;
    ended = false;

    currRenderedTokenIndex = 0;
}

function arrInsertAfterPredicate<T>(arr: T[], x: T, pred: (T) => boolean): T[]
{
    for(let i = 0; i < arr.length; i++)
    {
        if(pred(arr[i]))
        {
            return [...arr.slice(0, i + 1), x, ...arr.slice(i + 1)];
        }
    }

    return [...arr, x];
}

function arrInsertBeforePredicate<T>(arr: T[], x: T, pred: (T) => boolean): T[]
{
    for(let i = 0; i < arr.length; i++)
    {
        if(pred(arr[i]))
        {
            return [...arr.slice(0, i), x, ...arr.slice(i)];
        }
    }

    return [...arr, x];
}

</script>

<template>
    <Layout>
        <div class="wrapper">
            <div class="messages">
                {#if false}
                    <div class="warn">Caps Lock activated</div>
                {/if}
            </div>

            <div
                class="text"
                tabindex="0"
                on:keypress={onKeypress}
                on:keydown={onKeydown}
            >
                {#each renderedTokens as token}
                    <span
                        class={'token ' + token.type}
                    >{token.text}</span>
                {/each}
            </div>

            <div class="stats">
                <div class="stat">
                    <div class="title">Speed</div>
                    <div class="value">{wpm}WPM</div>
                    <div
                        class="relative-diff"
                        class:positive={wpmRelativeDiff > 1}
                    >
                        {wpmRelativeDiff >= 1 ? '+' : ''}{Math.floor(wpmRelativeDiff * 100) - 100}%
                    </div>
                </div>
                <div class="stat">
                    <div class="title">Accuracy</div>
                    <div class="value">{Math.floor(accuracy * 100)}%</div>
                    <div
                        class="relative-diff"
                        class:positive={accuracyRelativeDiff > 1}
                    >
                        {accuracyRelativeDiff >= 1 ? '+' : ''}{Math.floor(accuracyRelativeDiff * 100) - 100}%
                    </div>
                </div>
            </div>
        </div>
        <div class="test-line"></div>
    </Layout>
</template>

<style lang="scss">

@import '../styles/vars.scss';

.wrapper
{
    align-self: center;
    display: grid;
    grid-template-rows: 1fr auto 1fr;
}

.messages
{
    display: flex;
    flex-direction: row;
    align-items: center;

    align-self: flex-end;

    height: 70px;

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

    font-size: 32px;
    font-family: 'Source Code Pro', monospace;
    font-weight: 400;

    span
    {
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
    margin-top: 64px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    float: inline-start;
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
        font-size: 18px;
        font-weight: 400;
    }

    .title
    {
        opacity: .6;
    }

    .value
    {
        font-size: 36px;
        font-weight: 300;
    }

    .relative-diff
    {
        margin-left: 12px;
        color: #40A7F2;

        &.positive
        {
            color: #50DB1F;
        }
    }
}

</style>