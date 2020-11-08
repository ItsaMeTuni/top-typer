import type { Typewriter, Word } from './typewriter'

interface CalculatedStat
{
    wpm: number;
    keystrokeAccuracy: number;
    wordAccuracy: number;
    typoFrequencies: Map<string, number>;
    avgTypingDelay: Map<string, number>;
    avgWordDelay: number;
    wordRhythm: number;
    keystrokeRhythm: number 
}

export class Stat
{
    words: Word[] = [];
    keystrokeCount: number = 0;
    charTypos: Map<string, number> = new Map();
    charDurations: Map<string, number[]> = new Map();
    wordIntervalDelays: number[] = [];
    timestamp: number = 0;

    static fromTypewriter(typwriter: Typewriter): Stat
    {
        const stat = new Stat();

        stat.words = typwriter.getWords();
        stat.keystrokeCount = typwriter.getKeystrokeCount();
        stat.charTypos = typwriter.getCharTypos();
        stat.charDurations = typwriter.getCharDurations();
        stat.wordIntervalDelays = typwriter.getWordIntervalDelays();
        stat.timestamp = Date.now();

        return stat;
    }

    calculateStats(): CalculatedStat
    {
        const duration = this.words.reduce((acc, x) => acc + x.duration, 0);
        const charCount = this.words.reduce((acc, x) => x.duration > 0 ? acc + x.text.length : acc, 0);    
        const wpm = Math.floor((charCount / 5) / (duration / 60));
    
        const typoCount = Array.from(this.charTypos.values()).reduce((acc, x) => acc + x, 0);
        const keystrokeAccuracy = 1 - (typoCount / this.keystrokeCount);

        const wordsWithTypos = this.words.reduce((acc, x) => x.typos.length > 0 ? acc + 1 : acc, 0);
        const wordAccuracy = 1 - (wordsWithTypos / this.words.length);

        const typingDelays = Array.from(this.charDurations.entries());
        const avgTypingDelayPerKey = new Map(
            typingDelays
                .map(([char, delays]) => [char, delays.reduce((acc, x) => acc + x, 0) / delays.length])
        );

        const avgWordDelay = this.wordIntervalDelays.reduce((acc, x) => acc + x, 0) / this.wordIntervalDelays.length;
        
        
        // Calculate wordRhythm
        let wordDelayVariance = 0;
        for(const delay of this.wordIntervalDelays)
        {
            wordDelayVariance += Math.pow(delay - avgWordDelay, 2)
        }
        wordDelayVariance /= this.wordIntervalDelays.length;
        const wordDelayStdDeviation = Math.sqrt(wordDelayVariance);


        // Calculate keystrokeRhythm
        const typingDelays1d = Array.from(this.charDurations.values())
            .reduce((acc, x) => [...acc, ...x], []);

        const avgTypingDelay = typingDelays1d.reduce((acc, x) => acc + x, 0) / typingDelays1d.length;

        let keystrokeDelayVariance = 0;
        let delayCount = 0;
        for(const delays of this.charDurations.values())
        {
            for(const delay of delays)
            {
                keystrokeDelayVariance += Math.pow(delay - avgTypingDelay, 2);
                delayCount += 1;
            }
        }
        keystrokeDelayVariance /= delayCount;

        const keystrokeDelayStdDeviation = Math.sqrt(keystrokeDelayVariance);


        return {
            wpm,
            keystrokeAccuracy,
            wordAccuracy,
            typoFrequencies: this.charTypos,
            avgTypingDelay: avgTypingDelayPerKey,
            avgWordDelay,
            wordRhythm: wordDelayStdDeviation * 100,
            keystrokeRhythm: keystrokeDelayStdDeviation * 100,
        };
    }
}

const STAT_HISTORY = 'statHistory';

let cache: Stat[] | null = null;

export function saveStat(stat: Stat)
{
    const stats = getStats();

    stats.push(stat);

    localStorage.setItem(STAT_HISTORY, JSON.stringify(stats));
}

export function getStats()
{
    if(cache === null)
    {
        const stored = localStorage.getItem(STAT_HISTORY);
        if(stored !== null)
        {
            cache = JSON.parse(stored);
        }
        else
        {
            cache = [];
        }
    }
    
    return cache;
}