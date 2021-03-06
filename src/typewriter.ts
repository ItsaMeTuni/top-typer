import clone from 'clone';
import { saveStat, Stat } from './statManager';

export class Word
{
    text = '';

    // How much time the user took to type this word.
    duration = 0;

    // Indexes of the characters in this word that the user typed
    // wrong.
    typos = [];

    constructor(text: string)
    {
        this.text = text;
        this.typos = [];
    }

    static fromPlain(plain: any): Word
    {
        plain.__proto__ =  Word.prototype;
        return plain;
    }

    toPlain(): any
    {
        return Object.assign({}, clone(this));
    }
}

export class Typewriter
{
    private words: Word[] = [];

    private currWordIndex: number = 0;
    private get currWord() { return this.words[this.currWordIndex]; }

    private currCharIndex: number = 0;

    private wordIntervalTimestamp: number = 0;
    private charTimestamp: number = 0;

    private started = false;
    private ended = false;

    private keystrokeCount = 0;

    // Typo count for each character the user typed.
    // If the user was expected to type an 'e' but instead
    // typed an 'r', the typo count for 'e' will be incremented.
    private charTypos: Map<string, number> = new Map();

    // How much time it takes the user to type each character
    private charDurations: Map<string, number[]> = new Map();
    
    private wordIntervalDelays: number[] = [];

    private onEndListeners: (() => void)[] = [];
    private onRender: (() => void)[] = [];

    getWords() { return clone(this.words); }
    getCharIndex() { return this.currCharIndex; }
    getWordIndex() { return this.currWordIndex; }
    getCharTypos() { return clone(this.charTypos); }
    getCharDurations() { return clone(this.charDurations); }
    getWordIntervalDelays() { return clone(this.wordIntervalDelays); }
    getKeystrokeCount() { return this.keystrokeCount; }
    get hasStarted() { return this.started; }
    get hasEnded() { return this.ended; }

    constructor(text: string)
    {
        this.reset(text);
    }

    makeWordsFromText(text: string): Word[]
    {
        const words: Word[] = [];
        const wordsStr = text.split(' ');
        for(const str of wordsStr)
        {
            words.push(new Word(str));
            words.push(new Word(' '));
        }

        // Remove trailing space
        words.pop();

        return words;
    }

    reset(text: string)
    {
        this.words = this.makeWordsFromText(text);
        this.currWordIndex = 0;
        this.currCharIndex = 0;
        this.wordIntervalTimestamp = 0;
        this.charTimestamp = 0;
        this.started = false;
        this.ended = false;
        this.keystrokeCount = 0;
        this.charTypos = new Map();
        this.charDurations = new Map();
        this.wordIntervalDelays = [];

        this.triggerRender();
    }

    write(char: string)
    {
        if(this.ended)
        {
            return;
        }

        if(!this.started)
        {
            this.start();
        }

        if(this.currWordIndex === this.words.length)
        {
            if(char === 'Enter')
            {
                this.end();
            }
            return;
        }

        const expectedChar = this.currWord.text[this.currCharIndex];
        const isTypo = char !== expectedChar;
        
        if(isTypo)
        {
            this.registerCharTypo(expectedChar);
            this.currWord.typos.push(this.currCharIndex);
        }
        else
        {
            // make sure the current word doesn't has this character
            // marked as a typo
            this.currWord.typos = this.currWord.typos.filter(x => x !== this.currCharIndex);
        }

        this.currWord.duration += this.registerCharDuration(char);

        this.keystrokeCount += 1;

        this.currCharIndex += 1;        

        if(this.currCharIndex === this.currWord.text.length)
        {
            this.currWordIndex += 1;
            this.currCharIndex = 0;

            this.wordIntervalTimestamp = Date.now();

            // End game if no more characters and last word 
            // doesn't have any typos
            if(this.currWordIndex === this.words.length && this.words[this.words.length - 1].typos.length === 0)
            {
                this.end();
            }
        }

        if(this.currCharIndex === 0 && expectedChar !== ' ')
        {
            //A new word has begun
            this.registerWordInterval();
        }

        this.charTimestamp = Date.now();   
        
        this.triggerRender();
    }

    undo()
    {
        if(!this.started || this.ended)
        {
            return;
        }

        // Nothing to undo
        if(this.currWordIndex === 0 && this.currCharIndex === 0)
        {
            return;
        }

        if(this.currCharIndex === 0)
        {
            this.currWordIndex -= 1;
            this.currCharIndex = this.currWord.text.length - 1;
        }
        else
        {
            this.currCharIndex -= 1;
        }

        this.charTimestamp = Date.now();

        this.triggerRender();
    }

    private start()
    {
        this.wordIntervalTimestamp = Date.now()
        this.charTimestamp = Date.now();
        this.started = true;
    }

    private end()
    {
        this.ended = true;

        this.onEndListeners.forEach(x => x());

        saveStat(Stat.fromTypewriter(this));
    }

    private registerCharTypo(char: string)
    {
        this.charTypos.set(char, (this.charTypos.get(char) || 0) + 1);
    }

    private registerCharDuration(char: string): number
    {
        const charDuration = (Date.now() - this.charTimestamp) / 1000;
        const durations = this.charDurations.get(char) || [];
        durations.push(charDuration);
        this.charDurations.set(char, durations);
        return charDuration;
    }

    private registerWordInterval()
    {
        this.wordIntervalDelays.push((Date.now() - this.wordIntervalTimestamp) / 1000);
    }

    triggerRender()
    {
        this.onRender.forEach(x => x());
    }

    attachRenderListener(listener: () => void)
    {
        this.onRender.push(listener);
    }

    attachEndListener(listener: () => void)
    {
        this.onEndListeners.push(listener);
    }
}