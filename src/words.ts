
interface WordsSet
{
    long: string[];
    medium: string[];
    short: string[];
}

export interface WordSizeRatios
{
    long: number;
    medium: number;
    short: number;
}

let wordsCache: WordsSet | null = null;

export async function getWords(): Promise<WordsSet>
{
    if(wordsCache === null)
    {
        let longWords = localStorage.getItem('words_long');
        if(longWords === null)
        {
            longWords = await fetch('/words_long.txt').then(x => x.text());
            localStorage.setItem('words_long', longWords);
        }

        let mediumWords = localStorage.getItem('words_medium');
        if(mediumWords === null)
        {
            mediumWords = await fetch('/words_medium.txt').then(x => x.text());
            localStorage.setItem('words_medium', mediumWords);
        }

        let shortWords = localStorage.getItem('words_short');
        if(shortWords === null)
        {
            shortWords = await fetch('/words_short.txt').then(x => x.text());
            localStorage.setItem('words_short', shortWords);
        }

        const long = longWords.split('\n');
        const medium = mediumWords.split('\n');
        const short = shortWords.split('\n');

        wordsCache = {
            long,
            medium,
            short,
        };
    }

    return wordsCache;
}

export async function getRandomText(length: number, wordSizeRatios: WordSizeRatios): Promise<string>
{
    const words = await getWords();

    const retVal = [];

    for(let i = 0; i < length; i++)
    {
        const sizeRand = Math.random();
        if(sizeRand <= wordSizeRatios.short)
        {
            const index = Math.floor(Math.random() * words.short.length);
            retVal.push(words.short[index]);
        }
        else if(sizeRand <= wordSizeRatios.short + wordSizeRatios.medium)
        {
            const index = Math.floor(Math.random() * words.medium.length);
            retVal.push(words.medium[index]);
        }
        else
        {
            const index = Math.floor(Math.random() * words.long.length);
            retVal.push(words.long[index]);
        }

    }

    return retVal.join(' ');
}