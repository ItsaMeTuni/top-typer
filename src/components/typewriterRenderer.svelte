<script lang="typescript">
import { onDestroy, onMount } from "svelte";
import type { Word, Typewriter } from "../typewriter";

type FragmentType = 'normal' | 'preview' | 'error' | 'curr-char';

class Fragment
{
    text: string = '';
    type: FragmentType = 'preview';
    word: Word = null;
    el: HTMLSpanElement;

    constructor(text: string, type: FragmentType, word: Word)
    {
        this.text = text;
        this.type = type;
        this.word = word;
    }
}


export let typewriter: Typewriter;
export let onNext: () => void = () => {};

const framerate = 60;
const scrollSpeed = 15;

let typewriterEl: HTMLDivElement;
let fragments: Fragment[] = [];
let tickIntervalId: number;
let currCharFragment: Fragment;

onMount(() =>
{
    typewriter.attachRenderListener(render);
    render();
    tickIntervalId = setInterval(tick, 1000 / framerate);
});

onDestroy(() =>
{
    clearInterval(tickIntervalId);
});


function render()
{
    fragments = [];

    const words = typewriter.getWords();
    for(let wordIndex = 0; wordIndex < words.length; wordIndex++)
    {
        const word = words[wordIndex];

        const isPreviewWord = wordIndex > typewriter.getWordIndex();

        for(let charIndex = 0 ; charIndex < word.text.length; charIndex++)
        {
            let char = word.text[charIndex];
            const isTypo = word.typos.includes(charIndex);
            const isPreview = isPreviewWord || (wordIndex === typewriter.getWordIndex() && charIndex >= typewriter.getCharIndex());
            const isCurrChar = (wordIndex === typewriter.getWordIndex() && charIndex == typewriter.getCharIndex());

            let fragmentType: FragmentType;
            if(isCurrChar) fragmentType = 'curr-char';
            else if(isPreview) fragmentType = 'preview';
            else if(isTypo) fragmentType = 'error';
            else fragmentType = 'normal';

            // Display space typos as underscores
            if(isTypo && char === ' ')
            {
                char = '_';
            }

            const lastFragment = fragments[fragments.length - 1];

            if(fragments.length > 0 && lastFragment.type === fragmentType && lastFragment.word === word)
            {
                fragments[fragments.length - 1].text += char;
            }
            else
            {
                const fragment = new Fragment(char, fragmentType, word);
                fragments.push(fragment);
            }

            if(isCurrChar)
            {
                currCharFragment = fragments[fragments.length - 1];
            }
        }
    }
}

function onKeypress(e: KeyboardEvent)
{
    if(e.key === 'Enter' && typewriter.hasEnded)
    {
        onNext();
    }

    typewriter.write(e.key);
}

function onKeydown(e: KeyboardEvent)
{
    if(e.key === 'Backspace')
    {
        typewriter.undo();
    }
}

function tick()
{
    const curr = typewriterEl.scrollTop;
    const target = currCharFragment.el.offsetTop;
    typewriterEl.scrollBy(0, (target - curr) * (1 / framerate) * scrollSpeed);
}

</script>

<template>
    <div class="wrapper">    
        <div
            class="typewriter"
            bind:this={typewriterEl}
            tabindex="0"
            on:keypress={onKeypress}
            on:keydown={onKeydown}
        >
            {#each fragments as fragment}
                <span
                    class={fragment.type + ' fragment'}
                    bind:this={fragment.el}
                >{fragment.text}</span>
            {/each}
        </div>
    </div>
</template>

<style lang="scss">

@import '../styles/vars.scss';

.wrapper
{
    position: relative;

    font-size: 32px;
    font-family: 'Source Code Pro', monospace;
    font-weight: 400;
    line-height: 1.3em;

    max-height: calc(1.3em * 3.8);

    overflow: hidden;


    &::after
    {
        content: '';

        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;

        height: calc(1.3em);

        background: linear-gradient(0deg, $color-bg 0%, transparentize($color-bg, 1) 100%);

        pointer-events: none;
    }
}

.typewriter
{
    width: 50ch;
    
    height: calc(1.3em * 3.8);

    overflow: hidden;

    word-wrap: break-word;;

    span
    {
        white-space: pre-wrap;

        &.preview, &.curr-char
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

        span.curr-char
        {
            color: $color-bg;
            background-color: white;
        }
    }    
}


</style>