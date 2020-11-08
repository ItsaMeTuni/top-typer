<script lang="typescript">
import type { Word, Typewriter } from "../typewriter";

export let typewriter: Typewriter;
export let onNext: () => void = () => {};

type FragmentType = 'normal' | 'preview' | 'error';

class Fragment
{
    text: string = '';
    type: FragmentType = 'preview';

    constructor(text: string, type: FragmentType)
    {
        this.text = text;
        this.type = type;
    }
}

let fragments: Fragment[] = [];
$: if(typewriter !== undefined) render();

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
            const fragmentType = isPreview ? 'preview' : isTypo ? 'error' : 'normal';

            // Display space typos as underscores
            if(fragmentType === 'error' && char === ' ')
            {
                char = '_';
            }


            if(fragments.length > 0 && fragments[fragments.length - 1].type === fragmentType)
            {
                fragments[fragments.length - 1].text += char;
            }
            else
            {
                const fragment = new Fragment(char, fragmentType);
                fragments.push(fragment);
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
    render();
}

function onKeydown(e: KeyboardEvent)
{
    if(e.key === 'Backspace')
    {
        typewriter.undo();
    }
    render();
}

</script>

<template>
    <div class="wrapper">    
        <div
            class="typewriter"
            tabindex="0"
            on:keypress={onKeypress}
            on:keydown={onKeydown}
        >
            {#each fragments as fragment}
                <span
                    class={fragment.type + ' fragment'}
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


</style>